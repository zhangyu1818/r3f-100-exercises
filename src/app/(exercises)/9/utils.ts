import * as THREE from 'three/webgpu'

export function getProjectedPlane(
  camera: THREE.PerspectiveCamera,
  aspect: number,
) {
  const distance = Math.abs(camera.position.z)
  const height =
    2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance

  return {
    height,
    width: height * aspect,
  }
}

export function wrapPosition(value: number, max: number) {
  return ((value % max) + max) % max
}
