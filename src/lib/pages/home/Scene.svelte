<script lang="ts">
	import EeyoreCD from '$lib/assets/gltf/EeyoreCD.svelte';
	import type { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat';
	import { T, useTask } from '@threlte/core';
	import { interactivity, MeshLineGeometry, MeshLineMaterial, useCursor } from '@threlte/extras';
	import { Collider, RigidBody, usePhysicsTask, useRapier, useRopeJoint } from '@threlte/rapier';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { Vector3 } from 'three';
	import SceneEnvironment from './SceneEnvironment.svelte';

	interactivity();

	let suspensionT = new Tween(0, { duration: 7000, easing: cubicOut });
	let podiumT = new Tween(0, { delay: 500, duration: 2000, easing: cubicOut });

	let anchor = $derived.by(() => {
		const t = suspensionT.current;
		return new Vector3(0.05, 8, 0.05).lerp({ x: 0, y: 5.3, z: 0 }, t);
	});
	let podiumPosition = $derived.by(() => {
		const t = podiumT.current;
		return new Vector3(0, -5, 0).lerp({ x: 0, y: -0.525, z: 0 }, t);
	});

	const { rigidBodyA, rigidBodyB } = useRopeJoint([0, 0, 0], [0, 0, 0], 4);

	let podiumBody = $state<RapierRigidBody>();
	let ropePointA = $state.raw([new Vector3()]);

	const { simulationTask } = useRapier();

	usePhysicsTask(() => {
		if ($rigidBodyB && podiumBody) {
			$rigidBodyB.setNextKinematicTranslation(anchor);
			podiumBody.setNextKinematicTranslation(podiumPosition);
		}
	});

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
		suspensionT.target = 1;
		podiumT.target = 1;
	}

	const { onPointerEnter, onPointerLeave } = useCursor();
</script>

<T.PerspectiveCamera makeDefault position={[0, 1, 5]} rotation={[0, 0, 0]} fov={20} />

<!-- <RigidBody type="fixed">
	<T.Mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
		<T.PlaneGeometry args={[10, 10]} />
		<T.MeshPhysicalMaterial color="hotpink" metalness={0.05} roughness={0.5} />
	</T.Mesh>
</RigidBody> -->

<T.Group position={[0, -0.5, 0]}>
	<RigidBody type="kinematicPosition" bind:rigidBody={podiumBody}>
		<Collider shape="cylinder" args={[1, 0.5]} />
		<T.Mesh receiveShadow>
			<T.CylinderGeometry args={[0.5, 0.5, 2]} />
			<T.MeshPhysicalMaterial color="#df629a" metalness={0.05} roughness={0.5} />
		</T.Mesh>
	</RigidBody>
</T.Group>

<RigidBody
	bind:rigidBody={$rigidBodyB}
	type="kinematicPosition"
	oncreate={(ref) => {
		ref.setTranslation(anchor, false);
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
	<MeshLineGeometry points={[anchor, ropePointA[0]]} />
	<MeshLineMaterial width={0.015} color="#000000" opacity={0.25} dashRatio={0.5} dashArray={0.01} />
</T.Mesh>

<SceneEnvironment />
