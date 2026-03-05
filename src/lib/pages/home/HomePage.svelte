<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { World } from '@threlte/rapier';
	import { NeutralToneMapping, PCFShadowMap } from 'three';
	import HUD from './hud/HUD.svelte';
	import Scene from './scene/Scene.svelte';
</script>

<section>
	<div class="content">
		<h1>Knitwork</h1>
		<p>Hello! I make music and stuff.</p>
		<p>My <em>Eeyore EP</em> is out now :)</p>
		<p>
			Also check out <a href="https://theoretically.online/">theoretically.online</a> for handmade development.
		</p>
	</div>
</section>

<HUD />

<div class="canvas">
	<Canvas toneMapping={NeutralToneMapping} shadows={PCFShadowMap}>
		<World>
			<Scene />
		</World>
	</Canvas>
</div>

<style lang="scss">
	section {
		display: grid;
		place-content: start center;
		z-index: 1;
	}

	.content {
		padding: 96px 24px;
		padding-top: calc(15vh - 40px);
		padding-bottom: 0;
		width: min(max(calc(25vw + 200px), 640px), 100vw);
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
