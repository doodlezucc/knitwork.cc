<script lang="ts">
	import EeyoreCD from '$lib/assets/gltf/EeyoreCD.svelte';
	import {
		ImpulseJoint,
		Quaternion as RapierQuaternion,
		RigidBody as RapierRigidBody
	} from '@dimforge/rapier3d-compat';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { MeshLineGeometry, MeshLineMaterial, useCursor } from '@threlte/extras';
	import { Collider, RigidBody, useRapier, useRopeJoint } from '@threlte/rapier';
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { writable } from 'svelte/store';
	import {
		Matrix4,
		Object3D,
		Plane,
		Quaternion,
		Raycaster,
		Vector2,
		Vector3,
		type Intersection
	} from 'three';

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

	let isHovered = $state(false);

	// Runs after physics simulation stage
	useTask(
		() => {
			if ($bodyCD) {
				cdAnchorPosition.copy($bodyCD.translation());
				ropeEndpoints = [hookPosition, cdAnchorPosition];

				const cdIntersection = intersectCD();
				isHovered = cdIntersection !== undefined;
			}
		},
		{ after: simulationTask }
	);

	function startSuspension() {
		isSuspending = true;
	}

	const { onPointerEnter, onPointerLeave } = useCursor();

	$effect(() => {
		if (isHovered) {
			onPointerEnter();
		} else {
			onPointerLeave();
		}
	});

	const { camera } = useThrelte();
	const raycaster = new Raycaster();

	function updateRaycaster() {
		raycaster.setFromCamera(pointerPosition, $camera);
	}
	const xyPlane = new Plane(new Vector3(0, 0, 1));
	const target = new Vector3();

	function raycastPlaneXY(z: number) {
		xyPlane.constant = -z;
		raycaster.ray.intersectPlane(xyPlane, target);
		return target;
	}

	interface GrabbingState {
		/** The initiating touch's unique ID. */
		pointerId: number;
		zCoordinate: number;
		joint: ImpulseJoint;
	}

	let grabbingState = $state<GrabbingState>();
	const bodyCursor = writable<RapierRigidBody | undefined>();

	let cdHitbox: Object3D | undefined;
	const pointerPosition = new Vector2();

	function intersectCD() {
		if (!cdHitbox) return undefined;

		return raycaster.intersectObject(cdHitbox).at(0);
	}

	function disposeGrabbingState() {
		if (!grabbingState) return;

		world.removeImpulseJoint(grabbingState.joint, true);
		grabbingState = undefined;
	}

	function convertRapierQuaternionToThree(q: RapierQuaternion) {
		return new Quaternion(q.x, q.y, q.z, q.w);
	}

	function startGrabbing(intersection: Intersection, pointerId: number) {
		disposeGrabbingState();

		if (!$bodyCD || !$bodyCursor) return;

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

		const joint = world.createImpulseJoint(
			rapier.JointData.spring(0, 2, 1, { x: 0, y: 0, z: 0 }, grabbedPointRelativeToCD),
			$bodyCursor,
			$bodyCD,
			true
		);

		grabbingState = {
			pointerId,
			zCoordinate: grabbedPoint.z,
			joint
		};
	}

	interface HasClientPosition {
		clientX: number;
		clientY: number;
	}

	function handlePointerPositionUpdate({ clientX, clientY }: HasClientPosition) {
		pointerPosition.set(
			(clientX / window.innerWidth) * 2 - 1,
			-(clientY / window.innerHeight) * 2 + 1
		);

		updateRaycaster();
	}

	function onTouchStart(ev: TouchEvent) {
		handlePointerPositionUpdate(ev.touches[0]);

		if (intersectCD()) {
			ev.preventDefault();
		}
	}

	function onPointerDown(ev: PointerEvent) {
		handlePointerPositionUpdate(ev);

		const cdIntersection = intersectCD();

		if (cdIntersection) {
			ev.preventDefault();

			if (!grabbingState) {
				startGrabbing(cdIntersection, ev.pointerId);
			}
		}
	}

	function onPointerMove(ev: PointerEvent) {
		handlePointerPositionUpdate(ev);

		if (grabbingState && ev.pointerId === grabbingState.pointerId) {
			const grabbedPoint = raycastPlaneXY(grabbingState.zCoordinate);
			$bodyCursor!.setNextKinematicTranslation(grabbedPoint);
		}
	}

	function onPointerUp(ev: PointerEvent) {
		if (grabbingState && ev.pointerId === grabbingState.pointerId) {
			disposeGrabbingState();
		}
	}

	onMount(() => {
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
			<EeyoreCD onLoaded={startSuspension} />

			<T.Mesh
				visible={false}
				oncreate={(ref) => {
					cdHitbox = ref;
				}}
			>
				<T.BoxGeometry args={[1, 0.08, 0.834]} />
			</T.Mesh>
		</T.Group>
	</RigidBody>
</T.Group>

<T.Mesh>
	<MeshLineGeometry points={ropeEndpoints} />
	<MeshLineMaterial width={0.015} color="#000000" opacity={0.25} dashRatio={0.5} dashArray={0.01} />
</T.Mesh>
