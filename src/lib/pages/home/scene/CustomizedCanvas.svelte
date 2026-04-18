<script lang="ts">
	import { Canvas } from '@threlte/core';
	import type { Snippet } from 'svelte';
	import { NeutralToneMapping, PCFShadowMap, WebGLRenderer } from 'three';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<Canvas
	toneMapping={NeutralToneMapping}
	shadows={PCFShadowMap}
	createRenderer={(canvas) => {
		const renderer = new WebGLRenderer({
			canvas,
			powerPreference: 'default',
			antialias: true,
			alpha: true
		});
		renderer.debug.checkShaderErrors = false;
		return renderer;
	}}
>
	{@render children()}
</Canvas>
