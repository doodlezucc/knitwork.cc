<script lang="ts">
	import { Brands, EeyoreLinks, type Platform } from '../platform-links';

	interface Props {
		platform: Platform;
	}

	let { platform }: Props = $props();

	let brand = $derived(Brands[platform]);
	let href = $derived(EeyoreLinks[platform]);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a {href} style:--color={brand.color}>
	<img src={brand.logoUrl} alt="{brand.name} Logo" />

	{brand.name}
</a>

<style lang="scss">
	$size: 48px;

	a {
		color: inherit;
		text-decoration: none;
		font-weight: normal;
		background-color: #ffffff20;
		border-radius: 12px;
		padding: 20px 16px;
		text-wrap: nowrap;
		min-width: 40vw;

		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;

		&:hover {
			background-color: #ffffff33;
		}
	}

	img {
		width: $size;
		height: $size;
		object-fit: contain;
		border-radius: 4px;
		filter: drop-shadow(0 4px 10px #00000017);
	}
</style>
