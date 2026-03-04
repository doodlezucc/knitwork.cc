<script lang="ts">
	import { Platform } from '../platform-links';
	import LinkButton from './LinkButton.svelte';
</script>

<div class="hud-desktop">
	<LinkButton platform={Platform.AppleMusic} anchor={[0.14, 0.2]} />
	<LinkButton platform={Platform.Spotify} anchor={[0.78, 0.1]} />
	<LinkButton platform={Platform.YouTubeMusic} spinAnimation anchor={[0.93, 0.35]} />
	<LinkButton platform={Platform.Tidal} anchor={[0.06, 0.7]} />
	<LinkButton platform={Platform.Bandcamp} anchor={[0.83, 0.8]} />
</div>

<style lang="scss">
	.hud-desktop {
		position: absolute;
		pointer-events: none;
		z-index: 1;
		align-self: center;
		width: max(75vw, min(1024px, 95vw));
		top: 40vh;
		height: 40vh;

		> :global(*) {
			pointer-events: all;
			position: absolute;
		}
	}

	@media screen and (max-width: 640px) {
		.hud-desktop {
			display: none;
		}
	}
</style>
