<script lang="ts">
	import { T } from '@threlte/core';
	import { Environment } from '@threlte/extras';
</script>

<T.DirectionalLight
	position={[-2, 10, 3]}
	castShadow
	intensity={5}
	oncreate={(ref) => {
		const camera = ref.shadow.camera;
		camera.bottom = -2;
		camera.top = 5;
		camera.left = -2;
		camera.right = 2;
	}}
/>

<T.AmbientLight intensity={1} />

<Environment url="/hdri/studio_small_09_1k.exr" />
