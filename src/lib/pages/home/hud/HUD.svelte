<script lang="ts">
	import DesktopHUD from './desktop/DesktopHUD.svelte';
	import MobileHUD from './mobile/MobileHUD.svelte';

	interface Props {
		isOverlayOpen: boolean;
	}

	let { isOverlayOpen = $bindable(false) }: Props = $props();
</script>

<MobileHUD bind:isOverlayOpen />

<DesktopHUD />
