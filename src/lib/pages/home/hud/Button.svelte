<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { XOR } from 'ts-essentials';

	interface ButtonProps {
		link?: never;
		onClick: () => void;
	}

	interface LinkProps {
		link: true;
		href: string;
	}

	type Props = XOR<ButtonProps, LinkProps> & {
		icon?: boolean;
		children: Snippet;
	};

	let { icon = false, link, children, ...props }: Props = $props();
</script>

{#if link}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a class:icon href={props.href}>{@render children()}</a>
{:else}
	<button class:icon onclick={props.onClick}>{@render children()}</button>
{/if}

<style lang="scss">
	@use '$lib/style/scheme.scss';

	* {
		font: inherit;
		border: none;
		cursor: pointer;

		text-decoration: none;

		font-weight: bold;

		--foreground: #{scheme.$background};
		--background: #{scheme.$foreground};

		display: grid;
		place-content: center;
		border-radius: 100vw;
		background-color: var(--background);
		color: var(--foreground);
		box-shadow: 0 2px 4px #00000030;
		padding: 12px 32px;
		min-height: 52px;

		&:hover {
			background-color: oklch(from var(--background) calc(l + 0.25) c h);
		}

		&:active {
			background-color: oklch(from var(--background) calc(l + 0.3) c h);
		}

		&.icon {
			padding: 0;
			width: 52px;
			height: 52px;

			> :global(*) {
				height: 32px;
			}
		}
	}
</style>
