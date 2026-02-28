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

	const suspensionDurationSeconds = 1;
	const suspensionEasing = cubicOut;

	const { rigidBodyA: bodyCD, rigidBodyB: bodyHook } = useRopeJoint([0, 0, 0], [0, 0, 0], 4);

	let isSuspending = $state(false);
	let suspensionProgress = $state(0);

	let hookPosition = $derived.by(() => {
		const t = suspensionEasing(suspensionProgress);
		return new Vector3(0.05, 7.5, 0.05).lerp({ x: 0, y: 5.3, z: 0 }, t);
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

	// Runs after physics simulation stage
	useTask(
		() => {
			if ($bodyCD) {
				cdAnchorPosition.copy($bodyCD.translation());
				ropeEndpoints = [hookPosition, cdAnchorPosition];

				const cdIntersection = intersectCD();
				setCDHovered(cdIntersection !== undefined);
			}
		},
		{ after: simulationTask }
	);

	function startSuspension() {
		isSuspending = true;
	}

	const { onPointerEnter, onPointerLeave } = useCursor();
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
		joint: ImpulseJoint;
		z: number;
		offset: Vector3;
	}

	let grabbingState = $state<GrabbingState>();
	const bodyCursor = writable<RapierRigidBody>();

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

	function startGrabbing(intersection: Intersection) {
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
			joint: joint,
			z: grabbedPoint.z,
			offset: grabbedPointRelativeToCD
		};
	}

	function setCDHovered(hovered: boolean) {
		if (hovered) {
			onPointerEnter();
		} else {
			onPointerLeave();
		}
	}

	function handlePointerPositionUpdate(ev: PointerEvent) {
		pointerPosition.set(
			(ev.clientX / window.innerWidth) * 2 - 1,
			-(ev.clientY / window.innerHeight) * 2 + 1
		);

		updateRaycaster();
	}

	function onPointerDown(ev: PointerEvent) {
		handlePointerPositionUpdate(ev);

		const cdIntersection = intersectCD();

		if (cdIntersection) {
			startGrabbing(cdIntersection);
		}
	}

	function onPointerMove(ev: PointerEvent) {
		handlePointerPositionUpdate(ev);

		updateGrabbing();
	}

	function updateGrabbing() {
		if (!grabbingState || !$bodyCursor) return;

		const grabbedPoint = raycastPlaneXY(grabbingState.z);
		$bodyCursor.setNextKinematicTranslation(grabbedPoint);
	}

	const rope2Points = [new Vector3(), new Vector3()];

	useTask(
		() => {
			if ($bodyCD && $bodyCursor && grabbingState) {
				rope2Points[0].copy(grabbingState.offset.clone().add($bodyCursor.translation()));
				rope2Points[1].copy($bodyCD.translation());
			}
		},
		{ after: simulationTask }
	);
</script>

<svelte:window
	onpointerup={disposeGrabbingState}
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
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

<T.Mesh>
	<MeshLineGeometry points={rope2Points} />
	<MeshLineMaterial width={0.015} color="#000000" opacity={0.25} dashRatio={0.5} dashArray={0.01} />
</T.Mesh>
