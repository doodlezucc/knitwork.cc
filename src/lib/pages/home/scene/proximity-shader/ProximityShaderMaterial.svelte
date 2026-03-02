<script lang="ts">
	import { T } from '@threlte/core';
	import { quintOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { Vector3, type Vector3Like } from 'three';
	import fragmentShader from './fragment.glsl?raw';
	import vertexShader from './vertex.glsl?raw';

	interface Props {
		target: Vector3Like | undefined;
	}

	let { target }: Props = $props();

	const validTarget = new Vector3();

	const animation = new Tween(0, { duration: 200, easing: quintOut });

	$effect(() => {
		if (target) {
			validTarget.copy(target);
			animation.set(0, { duration: 0 });
			animation.set(1);
		} else {
			animation.set(0, { delay: 100 });
		}
	});
</script>

<T.ShaderMaterial
	transparent
	{fragmentShader}
	{vertexShader}
	uniforms={{
		target: { value: 0 },
		t: { value: 0 }
	}}
	uniforms.target.value={validTarget}
	uniforms.t.value={animation.current}
/>
