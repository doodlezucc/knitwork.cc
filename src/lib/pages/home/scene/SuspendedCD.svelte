<script lang="ts">
	import EeyoreCD from '$lib/assets/gltf/EeyoreCD.svelte';
	import {
		ImpulseJoint,
		Quaternion as RapierQuaternion,
		RigidBody as RapierRigidBody
	} from '@dimforge/rapier3d-compat';
	import { T, useDOM, useTask } from '@threlte/core';
	import { MeshLineGeometry, MeshLineMaterial } from '@threlte/extras';
	import { Collider, RigidBody, useRapier, useRopeJoint } from '@threlte/rapier';
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { writable } from 'svelte/store';
	import { Group, Matrix4, Mesh, Quaternion, Vector3 } from 'three';
	import ProximityShaderMaterial from './proximity-shader/ProximityShaderMaterial.svelte';
	import { useRaycasting } from './raycasting.svelte';

	const suspensionDurationSeconds = 5;
	const suspensionEasing = cubicOut;

	const { rigidBodyA: bodyCD, rigidBodyB: bodyHook } = useRopeJoint([0, 0, 0], [0, 0, 0], 4);

	let isSuspending = $state(false);
	let suspensionProgress = $state(0);

	let hookPosition = $derived.by(() => {
		const t = suspensionEasing(suspensionProgress);
		return new Vector3(0.05, 7.5, 0.05).lerp({ x: 0, y: 5.25, z: 0 }, t);
	});

	const cdAnchorPosition = new Vector3(0, 10, 0);

	let ropeEndpoints = $state<Vector3[]>([]);

	const { simulationTask, rapier, world } = useRapier();

	// Runs before physics simulation stage
	useTask(
		(delta) => {
			if (isSuspending && $bodyHook) {
				suspensionProgress = Math.min(1.0, suspensionProgress + delta / suspensionDurationSeconds);
				$bodyHook.setNextKinematicTranslation(hookPosition);
			}
		},
		{ before: simulationTask, running: () => suspensionProgress <= 1 }
	);

	let cdModel = $state<Group>();
	let isHovered = $state(false);

	// Runs after physics simulation stage
	useTask(
		() => {
			if ($bodyCD) {
				cdAnchorPosition.copy($bodyCD.translation());
				ropeEndpoints = [hookPosition, cdAnchorPosition];

				const cdIntersection = computeCDIntersection();
				isHovered = cdIntersection !== undefined;
			}
		},
		{ after: simulationTask }
	);

	function startSuspension() {
		isSuspending = true;
	}

	let cursor = $derived.by(() => {
		if (grabbingState) {
			return 'grabbing';
		} else if (isHovered) {
			return 'grab';
		} else {
			return 'auto';
		}
	});

	$effect(() => {
		document.body.style.cursor = cursor;
	});

	const raycaster = useRaycasting();

	interface GrabbingState {
		/** The initiating touch's unique ID. */
		pointerId: number;
		zCoordinate: number;
		joint: ImpulseJoint;
		anchorRelativeToCDModel: Vector3;
	}

	let grabbingState = $state<GrabbingState>();
	const bodyCursor = writable<RapierRigidBody | undefined>();

	let cdHitbox = $state<Mesh>();

	function computeCDIntersection() {
		if (!cdHitbox) return undefined;

		return raycaster.intersect(cdHitbox);
	}

	function disposeGrabbingState() {
		if (!grabbingState) return;

		world.removeImpulseJoint(grabbingState.joint, true);
		grabbingState = undefined;
	}

	function convertRapierQuaternionToThree(q: RapierQuaternion) {
		return new Quaternion(q.x, q.y, q.z, q.w);
	}

	function startGrabbing(pointerId: number) {
		disposeGrabbingState();

		if (!$bodyCD || !$bodyCursor || !cdModel) return;

		const intersection = computeCDIntersection();
		if (!intersection) return;

		const grabbedPoint = intersection.point;

		$bodyCursor.setTranslation(grabbedPoint, true);

		const rotation = convertRapierQuaternionToThree($bodyCD.rotation());
		const p = $bodyCD.translation();
		const translation = new Matrix4().setPosition(p.x, p.y, p.z).invert();

		const localSpaceMatrix = new Matrix4()
			.makeRotationFromQuaternion(rotation)
			.invert()
			.multiply(translation);

		const grabbedPointRelativeToCD = grabbedPoint.clone().applyMatrix4(localSpaceMatrix);
		const anchorRelativeToCDModel = cdModel.worldToLocal(grabbedPoint.clone());

		const joint = world.createImpulseJoint(
			rapier.JointData.spring(0, 2, 1, { x: 0, y: 0, z: 0 }, grabbedPointRelativeToCD),
			$bodyCursor,
			$bodyCD,
			true
		);

		grabbingState = {
			pointerId,
			zCoordinate: grabbedPoint.z,
			joint,
			anchorRelativeToCDModel
		};
	}

	function onTouchStart(ev: TouchEvent) {
		raycaster.handlePointerPositionUpdate(ev.touches[0]);

		if (computeCDIntersection()) {
			ev.preventDefault();
		}
	}

	const { canvas } = useDOM();

	function onPointerDown(ev: PointerEvent) {
		if (ev.target !== canvas) {
			// Pointer event occurred outside the 3D scene
			return;
		}

		if (grabbingState) return;

		raycaster.handlePointerPositionUpdate(ev);

		const cdIntersection = computeCDIntersection();

		if (cdIntersection) {
			ev.preventDefault();
			startGrabbing(ev.pointerId);
		}
	}

	function onPointerMove(ev: PointerEvent) {
		raycaster.handlePointerPositionUpdate(ev);

		if (grabbingState && ev.pointerId === grabbingState.pointerId) {
			const grabbedPoint = raycaster.raycastPlaneXY(grabbingState.zCoordinate);
			$bodyCursor!.setNextKinematicTranslation(grabbedPoint);
		}
	}

	function onPointerUp(ev: PointerEvent) {
		if (grabbingState && ev.pointerId === grabbingState.pointerId) {
			disposeGrabbingState();
		}
	}

	onMount(() => {
		// { passive: false } is needed here to correctly intercept mobile scroll events.
		document.addEventListener('touchstart', onTouchStart, { passive: false });

		return () => {
			document.removeEventListener('touchstart', onTouchStart);
		};
	});
</script>

<svelte:window
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
/>

<svelte:body style:cursor />

<RigidBody
	bind:rigidBody={$bodyHook}
	type="kinematicPosition"
	oncreate={(ref) => {
		ref.setTranslation(hookPosition, false);
	}}
/>

<RigidBody bind:rigidBody={$bodyCursor} type="kinematicPosition" />

<T.Group position={[0, 2, 0]}>
	<RigidBody bind:rigidBody={$bodyCD} linearDamping={0.1} angularDamping={0.5} canSleep={false}>
		<T.Group position={[0, -0.417, 0]} rotation={[Math.PI / 2, 0, 0]}>
			<Collider shape="cuboid" args={[0.5, 0.04, 0.417]} />
			<EeyoreCD onLoaded={startSuspension} bind:ref={cdModel}>
				{#snippet hullMaterial()}
					<ProximityShaderMaterial target={grabbingState?.anchorRelativeToCDModel} />
				{/snippet}
			</EeyoreCD>

			<T.Mesh visible={false} bind:ref={cdHitbox}>
				<T.BoxGeometry args={[1, 0.08, 0.834]} />
			</T.Mesh>
		</T.Group>
	</RigidBody>
</T.Group>

<T.Mesh>
	<MeshLineGeometry points={ropeEndpoints} />
	<MeshLineMaterial width={0.015} color="#000000" opacity={0.25} dashRatio={0.5} dashArray={0.01} />
</T.Mesh>
