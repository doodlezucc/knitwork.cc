<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		children: Snippet;
	}

	let { href, children }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
<a class="button" {href}>{@render children()}</a>

<style lang="scss">
	@use '$lib/style/scheme.scss';

	.button {
		font: inherit;
		outline: none;
		cursor: pointer;

		text-decoration: none;

		font-weight: bold;

		--foreground: #{scheme.$background};
		--background: #{scheme.$foreground};

		border-radius: 100vw;
		background-color: var(--background);
		color: var(--foreground);
		box-shadow: 0 2px 4px #00000030;
		padding: 16px 32px;

		&:hover {
			background-color: oklch(from var(--background) calc(l + 0.25) c h);
		}

		&:active {
			background-color: oklch(from var(--background) calc(l + 0.3) c h);
		}
	}
</style>
