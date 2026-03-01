<script lang="ts">
	import LinkButton from './LinkButton.svelte';
</script>

<div class="hud">
	<LinkButton href="https://knitwork.bandcamp.com/album/eeyore">Listen on Bandcamp</LinkButton>
</div>

<style lang="scss">
	.hud {
		position: absolute;
		z-index: 1;
		bottom: 20vh;
		left: 0;
		right: 0;

		margin: 8px;

		display: grid;
		place-content: center;
		// grid-template-columns: max-content max-content;
		gap: 24px;
	}

	@media screen and (max-width: 640px) {
		.hud {
			bottom: 20px;
		}
	}
</style>
