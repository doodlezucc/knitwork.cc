<script lang="ts">
	import XIcon from '@iconify-svelte/lucide/x';
	import Button from '../Button.svelte';
	import MobileLinks from './MobileLinks.svelte';

	let isOverlayOpen = $state(false);
</script>

<div class="mobile-links" class:visible={isOverlayOpen}>
	<MobileLinks visible={isOverlayOpen} />
</div>

<div class="hud-mobile">
	<Button icon={isOverlayOpen} onClick={() => (isOverlayOpen = !isOverlayOpen)}>
		{#if isOverlayOpen}
			<XIcon />
		{:else}
			Listen
		{/if}
	</Button>
</div>

<style lang="scss">
	@use '$lib/style/media.scss';

	.hud-mobile {
		position: absolute;
		z-index: 1;
		bottom: 32px;
		left: 0;
		right: 0;

		display: flex;
		justify-content: center;
	}

	.mobile-links {
		position: absolute;
		z-index: 1;
		padding: 8px 16px;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		display: grid;
		place-content: center;

		background-color: #ffffff50;
		backdrop-filter: blur(3px);

		transition: 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
		pointer-events: none;
		opacity: 0;

		&.visible {
			pointer-events: all;
			opacity: 1;
		}
	}

	@include media.on-desktop {
		.hud-mobile,
		.mobile-links {
			display: none;
		}
	}
</style>
