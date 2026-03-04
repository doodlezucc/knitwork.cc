<script lang="ts">
	import XIcon from '@iconify-svelte/lucide/x';
	import Button from '../Button.svelte';
	import MobileLinks from './MobileLinks.svelte';

	interface Props {
		isOverlayOpen: boolean;
	}

	let { isOverlayOpen = $bindable(false) }: Props = $props();
</script>

<div class="hud-mobile">
	<Button icon={isOverlayOpen} onClick={() => (isOverlayOpen = !isOverlayOpen)}>
		{#if isOverlayOpen}
			<XIcon />
		{:else}
			Listen
		{/if}
	</Button>

	<div class="mobile-links">
		{#if isOverlayOpen}
			<MobileLinks />
		{/if}
	</div>
</div>

<style lang="scss">
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
		bottom: 100%;
		margin: 8px;
	}

	@media screen and (min-width: 641px) {
		.hud-mobile {
			display: none;
		}
	}
</style>
