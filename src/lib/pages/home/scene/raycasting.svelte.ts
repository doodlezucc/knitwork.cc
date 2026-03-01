import { useThrelte } from '@threlte/core';
import { Object3D, Plane, Raycaster, Vector2, Vector3 } from 'three';

export function useRaycasting() {
	const { camera } = useThrelte();
	const raycaster = new Raycaster();
	const pointerPosition = new Vector2();

	function updateRaycaster() {
		raycaster.setFromCamera(pointerPosition, camera.current);
	}

	const xyPlane = new Plane(new Vector3(0, 0, 1));
	const target = new Vector3();

	function raycastPlaneXY(z: number) {
		xyPlane.constant = -z;
		raycaster.ray.intersectPlane(xyPlane, target);
		return target;
	}

	function handlePointerPositionUpdate({ clientX, clientY }: HasClientPosition) {
		pointerPosition.set(
			(clientX / window.innerWidth) * 2 - 1,
			-(clientY / window.innerHeight) * 2 + 1
		);

		updateRaycaster();
	}

	function intersect(object: Object3D) {
		return raycaster.intersectObject(object).at(0);
	}

	return {
		raycastPlaneXY,
		handlePointerPositionUpdate,
		intersect
	};
}

interface HasClientPosition {
	clientX: number;
	clientY: number;
}
