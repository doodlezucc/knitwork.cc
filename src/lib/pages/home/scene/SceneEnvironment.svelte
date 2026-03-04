<script lang="ts">
	import { GainMapLoader } from '@monogrid/gainmap-js';
	import { T, useThrelte } from '@threlte/core';
	import { onMount } from 'svelte';
	import { EquirectangularReflectionMapping } from 'three';

	const { renderer, scene } = useThrelte();

	const loader = new GainMapLoader(renderer).setRenderTargetOptions({
		mapping: EquirectangularReflectionMapping
	});

	onMount(async () => {
		const result = await loader.loadAsync([
			'/hdri/studio_small_09_1k.webp',
			'/hdri/studio_small_09_1k-gainmap.webp',
			'/hdri/studio_small_09_1k.json'
		]);

		scene.environment = result.renderTarget.texture;
	});
</script>

<T.DirectionalLight
	position={[-2, 10, 3]}
	castShadow
	intensity={5}
	oncreate={(ref) => {
		const camera = ref.shadow.camera;
		camera.bottom = -2;
		camera.top = 5;
		camera.left = -2;
		camera.right = 2;
	}}
/>

<T.AmbientLight intensity={1} />
