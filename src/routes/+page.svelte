<script lang="ts">
	import HomePage from '$lib/pages/home/HomePage.svelte';

	const title = 'Knitwork | Homepage';
	const description = 'Music by Knitwork. Eeyore EP out now!';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="og:title" content={title} />

	<meta name="description" content={description} />
	<meta name="og:description" content={description} />

	<link rel="icon" href="/favicon.png" />
	<meta name="og:image" content="https://knitwork.cc/thumbnail-eeyore.png" />

	<meta name="color-scheme" content="light" />
</svelte:head>

<HomePage />
