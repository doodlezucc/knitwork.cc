<script lang="ts">
	import BandcampLink from '../links/BandcampLink.svelte';
</script>

<div class="hud-desktop">
	<BandcampLink />
</div>

<style lang="scss">
	.hud-desktop {
		position: absolute;
		pointer-events: none;
		z-index: 1;
		left: 0;
		right: 0;
		bottom: 120px;

		display: grid;
		place-content: center;

		> :global(*) {
			pointer-events: all;
		}
	}

	@media screen and (max-width: 640px) {
		.hud-desktop {
			display: none;
		}
	}
</style>
