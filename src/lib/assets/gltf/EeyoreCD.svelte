<!--
Source Command: npx @threlte/gltf@3.0.1 ./static/models/EeyoreCD.glb --root /models/ --types
-->

<script lang="ts">
	import type * as THREE from 'three';

	import { T, type Props } from '@threlte/core';
	import { useDraco, useGltf } from '@threlte/extras';
	import type { Snippet } from 'svelte';

	let {
		fallback,
		error,
		children,
		ref = $bindable(),
		onLoaded,
		...props
	}: Props<THREE.Group> & {
		ref?: THREE.Group;
		children?: Snippet<[{ ref: THREE.Group }]>;
		fallback?: Snippet;
		error?: Snippet<[{ error: Error }]>;
		onLoaded: () => void;
	} = $props();

	type GLTFResult = {
		nodes: {
			Cube: THREE.Mesh;
			Cube_1: THREE.Mesh;
			Cube_2: THREE.Mesh;
			Cube_3: THREE.Mesh;
		};
		materials: {
			Solid: THREE.MeshStandardMaterial;
			Plastic: THREE.MeshStandardMaterial;
			['Cover Art']: THREE.MeshStandardMaterial;
			CD: THREE.MeshStandardMaterial;
		};
	};

	const dracoLoader = useDraco();
	const gltf = useGltf<GLTFResult>('/models/EeyoreCD.glb', { dracoLoader });

	gltf.then(() => onLoaded());
</script>

<T.Group bind:ref dispose={false} {...props}>
	<!-- eslint-disable-next-line svelte/require-store-reactive-access -->
	{#await gltf}
		{@render fallback?.()}
	{:then gltf}
		<T.Mesh castShadow geometry={gltf.nodes.Cube.geometry} material={gltf.materials.Solid} />
		<T.Mesh castShadow geometry={gltf.nodes.Cube_1.geometry} material={gltf.materials.Plastic} />
		<T.Mesh geometry={gltf.nodes.Cube_2.geometry} material={gltf.materials['Cover Art']} />
		<T.Mesh geometry={gltf.nodes.Cube_3.geometry} material={gltf.materials.CD} />
	{:catch err}
		{@render error?.({ error: err })}
	{/await}

	{@render children?.({ ref: ref! })}
</T.Group>
