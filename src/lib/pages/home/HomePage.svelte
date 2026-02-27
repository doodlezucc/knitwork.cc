<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { World } from '@threlte/rapier';
	import { NeutralToneMapping, PCFShadowMap } from 'three';
	import Scene from './Scene.svelte';
</script>

<section>
	<div class="content">
		<h1>Knitwork</h1>
		<p>Music and stuff.</p>
		<p>My <em>Eeyore EP</em> releases on March 1st, 2026.</p>
		<p>
			Also check out <a href="https://theoretically.online/">theoretically.online</a> for handmade development.
		</p>
	</div>
</section>

<div class="canvas">
	<Canvas toneMapping={NeutralToneMapping} shadows={PCFShadowMap} renderMode="always">
		<World>
			<Scene />
		</World>
	</Canvas>
</div>

<style lang="scss">
	section {
		display: grid;
		place-content: start center;
	}

	.content {
		padding: 96px 24px;
		padding-bottom: 0;
		width: min(max(calc(25vw + 200px), 640px), calc(100vw - 36px));
		position: relative;
		z-index: 1;
	}

	@media screen and (max-width: 640px) {
		.content {
			padding-top: 24px;
		}
	}

	.canvas {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
	}
</style>
