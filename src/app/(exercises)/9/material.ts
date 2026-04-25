import * as THREE from 'three/webgpu'

import { StretchWaveNodeMaterial } from './material-tsl'

export { StretchWaveNodeMaterial } from './material-tsl'

export type StretchWaveMaterialInstance = StretchWaveNodeMaterial

export function createStretchWaveMaterial({
  texture: sourceTexture,
}: {
  texture: THREE.Texture
}): StretchWaveMaterialInstance {
  const material = new StretchWaveNodeMaterial()

  material.side = THREE.DoubleSide
  material.transparent = true
  material.uniforms.uMap.value = sourceTexture

  return material
}
