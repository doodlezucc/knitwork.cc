<script lang="ts">
	import EeyoreCD from '$lib/assets/gltf/EeyoreCD.svelte';
	import { T, useTask } from '@threlte/core';
	import { interactivity, MeshLineGeometry, MeshLineMaterial, useCursor } from '@threlte/extras';
	import { Collider, RigidBody, usePhysicsTask, useRapier, useRopeJoint } from '@threlte/rapier';
	import { cubicOut } from 'svelte/easing';
	import { Vector3 } from 'three';
	import SceneEnvironment from './SceneEnvironment.svelte';

	interactivity();

	const suspensionDurationSeconds = 7;
	const suspensionEasing = cubicOut;

	let isSuspending = $state(false);
	let suspensionT = $state(0);
	let anchorPosition = $derived.by(() => {
		const t = suspensionEasing(suspensionT);
		return new Vector3(0.05, 7.5, 0.05).lerp({ x: 0, y: 5.3, z: 0 }, t);
	});

	const { rigidBodyA, rigidBodyB } = useRopeJoint([0, 0, 0], [0, 0, 0], 4);

	let ropePointA = $state.raw([new Vector3(0, 8, 0)]);

	const { simulationTask } = useRapier();

	usePhysicsTask(
		(delta) => {
			if (isSuspending && $rigidBodyB) {
				suspensionT = Math.min(1.0, suspensionT + delta / suspensionDurationSeconds);
				$rigidBodyB.setNextKinematicTranslation(anchorPosition);
			}
		},
		{ running: () => suspensionT <= 1 }
	);

	useTask(
		() => {
			if ($rigidBodyA) {
				ropePointA[0].copy($rigidBodyA.translation());
				ropePointA = [...ropePointA];
			}
		},
		{ after: simulationTask }
	);

	function startSuspension() {
		isSuspending = true;
	}

	const { onPointerEnter, onPointerLeave } = useCursor();
</script>

<T.PerspectiveCamera makeDefault position={[0, 1, 5]} rotation={[0, 0, 0]} fov={20} />

<RigidBody
	bind:rigidBody={$rigidBodyB}
	type="kinematicPosition"
	oncreate={(ref) => {
		ref.setTranslation(anchorPosition, false);
	}}
/>

<T.Group position={[0, 2, 0]}>
	<RigidBody bind:rigidBody={$rigidBodyA} linearDamping={0.1} angularDamping={0.5} canSleep={false}>
		<T.Group position={[0, -0.417, 0]} rotation={[Math.PI / 2, 0, 0]}>
			<Collider shape="cuboid" args={[0.5, 0.05, 0.417]} />
			<EeyoreCD
				onLoaded={startSuspension}
				onpointerenter={onPointerEnter}
				onpointerleave={onPointerLeave}
				onpointerdown={(ev) => {
					const intersection = ev.intersections[0];
					$rigidBodyA!.applyImpulseAtPoint({ x: 0, y: 0, z: -0.03 }, intersection.point, true);
				}}
			/>
		</T.Group>
	</RigidBody>
</T.Group>

<T.Mesh>
	<MeshLineGeometry points={[anchorPosition, ropePointA[0]]} />
	<MeshLineMaterial width={0.015} color="#000000" opacity={0.25} dashRatio={0.5} dashArray={0.01} />
</T.Mesh>

<SceneEnvironment />
