<script lang="ts">
	import { Platform } from '../platform-links';
	import LinkButton from './LinkButton.svelte';

	interface Props {
		visible: boolean;
	}

	let { visible }: Props = $props();
</script>

<div class="list" class:visible>
	<LinkButton platform={Platform.Spotify} />
	<LinkButton platform={Platform.AppleMusic} />
	<LinkButton platform={Platform.Tidal} />
	<LinkButton platform={Platform.YouTubeMusic} />
	<LinkButton platform={Platform.Bandcamp} />
</div>

<style lang="scss">
	@use '$lib/style/scheme.scss';

	.list {
		pointer-events: all;
		background-color: #000d;
		color: scheme.$background;
		padding: 16px;
		border-radius: 24px;
		box-shadow: 0 6px 16px #0005;

		display: flex;
		flex-wrap: wrap;
		gap: 4px;

		transition: 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19);
		pointer-events: none;
		translate: 0 32px;
		opacity: 0;

		&.visible {
			transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
			pointer-events: all;
			translate: 0 0;
			opacity: 1;
		}

		> :global(*) {
			flex: 1;
		}
	}
</style>
