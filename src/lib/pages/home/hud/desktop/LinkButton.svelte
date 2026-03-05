<script lang="ts">
	import { onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { SimplexNoise } from 'three/examples/jsm/Addons.js';
	import { Brands, EeyoreLinks, type Platform } from '../platform-links';

	interface Props {
		anchor: [number, number];
		spinAnimation?: boolean;
		platform: Platform;
	}

	let { anchor, spinAnimation = false, platform }: Props = $props();

	const fadeInTween = new Tween(0, { duration: 2500, easing: quintOut });

	const simplex = new SimplexNoise();
	let simplexT = $state(0);
	let animationFrameHandle!: number;
	let previousFrame!: number;

	function tick(now: number) {
		const deltaSeconds = (now - previousFrame) / 1000;
		simplexT += 0.06 * deltaSeconds;

		animationFrameHandle = requestAnimationFrame(tick);
		previousFrame = now;
	}

	onMount(() => {
		fadeInTween.set(1, { delay: Math.random() * 500 });

		previousFrame = performance.now();
		animationFrameHandle = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(animationFrameHandle);
		};
	});

	let brand = $derived(Brands[platform]);
	let href = $derived(EeyoreLinks[platform]);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
	{href}
	style:--color={brand.color}
	style:--left={anchor[0]}
	style:--top={anchor[1]}
	style:--x={simplex.noise(simplexT, 0)}
	style:--y={simplex.noise(simplexT, 100)}
	style:--fade={fadeInTween.current}
	style:--tilt={simplex.noise(simplexT, 200)}
	class:spin={spinAnimation}
>
	<img src={brand.logoUrl} alt="{brand.name} Logo" />

	{brand.name}
</a>

<style lang="scss">
	$size: 48px;
	$orbit: 20px;
	$tilt: 5deg;

	// Shaking intensity on hover
	$rotation: 10deg;

	a {
		left: calc(var(--left) * 100% - $size * 0.5);
		top: calc(var(--top) * 100% - $size * 0.5);
		translate: calc($orbit * var(--x)) calc(100vh * (1 - var(--fade)) + $orbit * var(--y));
		rotate: calc(calc($tilt) * var(--tilt));

		color: #000000;
		text-decoration: none;
		font-weight: bold;
		opacity: 0.65;

		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;

		&:hover,
		&:focus-visible {
			outline-offset: 8px;
			opacity: 1;
			color: var(--color);

			img {
				animation: shake 0.5s;
			}

			&.spin img {
				animation: spin 0.5s;
			}
		}
	}

	img {
		width: $size;
		height: $size;
		object-fit: contain;
		border-radius: 4px;
	}

	@keyframes shake {
		0% {
			rotate: 0deg;
			scale: 1;
			translate: 0 0;
		}
		10% {
			rotate: -$rotation;
			scale: 1.1;
		}
		30% {
			rotate: $rotation;
			translate: 0 -10px;
		}
		50% {
			rotate: -$rotation * 0.5;
		}
		70% {
			rotate: $rotation * 0.5;
		}
		80% {
			rotate: 0deg;
			scale: 1;
			translate: 0 0;
		}
	}

	@keyframes spin {
		0% {
			rotate: 0deg;
			scale: 1;
			translate: 0 0;
		}
		10% {
			scale: 1.1;
		}
		30% {
			translate: 0 -10px;
		}
		80% {
			scale: 1;
			translate: 0 0;
		}
		100% {
			rotate: 360deg;
		}
	}
</style>
