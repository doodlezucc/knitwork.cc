<script lang="ts">
	import { seededRandom } from 'three/src/math/MathUtils.js';
	import { Brands, EeyoreLinks, type Platform } from '../platform-links';

	interface Props {
		randomSeed: number;
		anchor: [number, number];
		spinAnimation?: boolean;
		platform: Platform;
		logoUrl?: string;
	}

	let { randomSeed, anchor, spinAnimation = false, platform, logoUrl }: Props = $props();

	let brand = $derived(Brands[platform]);
	let href = $derived(EeyoreLinks[platform]);

	function random(min: number, max: number, { seedOffset }: { seedOffset: number }) {
		return min + (max - min) * seededRandom(randomSeed + seedOffset);
	}
</script>

<div
	class="anchor"
	style:--left={anchor[0]}
	style:--top={anchor[1]}
	style:animation-delay="{random(-0.5, 0.5, { seedOffset: 0 })}s"
>
	<div class="orbiting" style:animation-delay="{random(-30, 0, { seedOffset: 1 })}s">
		<div class="orbiting reverse" style:animation-delay="{random(-30, 0, { seedOffset: 2 })}s">
			<!-- eslint-disable svelte/no-navigation-without-resolve -->
			<a
				{href}
				style:--color={brand.color}
				class:spin={spinAnimation}
				style:animation-delay="{random(-30, 0, { seedOffset: 3 })}s"
			>
				<img src={logoUrl ?? brand.logoUrl} alt="{brand.name} Logo" />

				{brand.name}
			</a>
		</div>
	</div>
</div>

<style lang="scss">
	$size: 48px;
	$orbit: 8px;
	$tilt: 2.5deg;

	// Shaking intensity on hover
	$rotation: 10deg;

	.anchor {
		left: calc(var(--left) * 100% - $size * 0.5);
		top: calc(var(--top) * 100% - $size * 0.5);
		animation: fly-in 5s cubic-bezier(0.23, 1, 0.32, 1) both;
	}

	.orbiting {
		animation: orbit 11.3s linear infinite;

		&.reverse {
			animation-duration: 15s;
			animation-direction: reverse;
		}
	}

	a {
		animation: tilt 5s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;

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

	@keyframes fly-in {
		from {
			transform: translateY(100vh);
		}
		to {
			transform: translateY(0);
		}
	}

	// https://lea.verou.me/blog/2012/02/moving-an-element-along-a-circle/
	@keyframes orbit {
		from {
			transform: rotate(0deg) translate($orbit) rotate(0deg);
		}
		to {
			transform: rotate(360deg) translate($orbit) rotate(-360deg);
		}
	}

	@keyframes tilt {
		0% {
			rotate: -$tilt;
		}
		50% {
			rotate: $tilt;
		}
		100% {
			rotate: -$tilt;
		}
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
