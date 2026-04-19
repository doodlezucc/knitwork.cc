<script lang="ts">
	import { World } from '@threlte/rapier';
	import HUD from './hud/HUD.svelte';
	import CustomizedCanvas from './scene/CustomizedCanvas.svelte';
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
	<CustomizedCanvas>
		<World>
			<Scene />
		</World>
	</CustomizedCanvas>
</div>

<style lang="scss">
	@use '$lib/style/media.scss';

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

	@include media.on-mobile {
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
