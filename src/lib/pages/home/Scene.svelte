<script lang="ts">
	import { T } from '@threlte/core';
	import SceneEnvironment from './SceneEnvironment.svelte';
	import SuspendedCD from './SuspendedCD.svelte';
</script>

<T.PerspectiveCamera makeDefault position={[0, 1, 5]} rotation={[0, 0, 0]} fov={20} />

<SceneEnvironment />

<SuspendedCD />
