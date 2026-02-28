<script lang="ts">
	import EeyoreCD from '$lib/assets/gltf/EeyoreCD.svelte';
	import { T, useTask } from '@threlte/core';
	import {
		interactivity,
		type IntersectionEvent,
		MeshLineGeometry,
		MeshLineMaterial,
		useCursor
	} from '@threlte/extras';
	import { Collider, RigidBody, useRapier, useRopeJoint } from '@threlte/rapier';
	import { cubicOut } from 'svelte/easing';
	import { Vector3 } from 'three';

	// Enable pointer events on 3D models
	interactivity();

	const suspensionDurationSeconds = 7;
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

	const { simulationTask } = useRapier();

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
			}
		},
		{ after: simulationTask }
	);

	function startSuspension() {
		isSuspending = true;
	}

	const { onPointerEnter, onPointerLeave } = useCursor();
</script>

<RigidBody
	bind:rigidBody={$bodyHook}
	type="kinematicPosition"
	oncreate={(ref) => {
		ref.setTranslation(hookPosition, false);
	}}
/>

<T.Group position={[0, 2, 0]}>
	<RigidBody bind:rigidBody={$bodyCD} linearDamping={0.1} angularDamping={0.5} canSleep={false}>
		<T.Group position={[0, -0.417, 0]} rotation={[Math.PI / 2, 0, 0]}>
			<Collider shape="cuboid" args={[0.5, 0.05, 0.417]} />
			<EeyoreCD
				onLoaded={startSuspension}
				onpointerenter={onPointerEnter}
				onpointerleave={onPointerLeave}
				onpointerdown={(ev: IntersectionEvent<PointerEvent>) => {
					const intersection = ev.intersections[0];
					$bodyCD!.applyImpulseAtPoint({ x: 0, y: 0, z: -0.03 }, intersection.point, true);
				}}
			/>
		</T.Group>
	</RigidBody>
</T.Group>

<T.Mesh>
	<MeshLineGeometry points={ropeEndpoints} />
	<MeshLineMaterial width={0.015} color="#000000" opacity={0.25} dashRatio={0.5} dashArray={0.01} />
</T.Mesh>
