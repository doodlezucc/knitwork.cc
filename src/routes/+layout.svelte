<script lang="ts">
	import '@fontsource-variable/cascadia-code';
	import '@fontsource-variable/montserrat';
	import '@fontsource/pt-serif';

	import favicon from '$lib/assets/favicon.ico';
	import '$lib/style/global.scss';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
