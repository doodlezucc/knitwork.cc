import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: [
			'@dimforge/rapier3d-compat',
			'@iconify-svelte/lucide/x',
			'@monogrid/gainmap-js',
			'@threlte/core',
			'@threlte/extras',
			'@threlte/rapier',
			'three',
			'three/examples/jsm/Addons.js'
		]
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
