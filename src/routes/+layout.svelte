<script lang="ts">
	import '@fontsource-variable/cascadia-code';
	import '@fontsource-variable/montserrat';
	import '@fontsource/pt-serif';

	import '$lib/style/global.scss';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="og:type" content="website" />
	<link rel="icon" href="/favicon.png" />
</svelte:head>

{@render children()}
