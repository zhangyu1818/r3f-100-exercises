import * as THREE from 'three'

import { shaderMaterial } from '@react-three/drei'

import fragmentShader from './shaders/work-plane/fragment.glsl'
import vertexShader from './shaders/work-plane/vertex.glsl'

const IMAGE_PLACEHOLDER: THREE.Texture = (() => {
  const texture = new THREE.DataTexture(
    new Uint8Array([255, 255, 255, 255]),
    1,
    1,
    THREE.RGBAFormat,
  )
  texture.needsUpdate = true
  return texture
})()

const VECTOR_PLACEHOLDER: THREE.Texture = (() => {
  const texture = new THREE.DataTexture(
    new Uint8Array([128, 128, 255, 255]),
    1,
    1,
    THREE.RGBAFormat,
  )
  texture.needsUpdate = true
  return texture
})()

export const GLSLStretchWaveMaterial = shaderMaterial(
  {
    uDisplacement: 0.8,
    uFrost: VECTOR_PLACEHOLDER,
    uFrostAmount: 0.23,
    uFluidLine: 0.8,
    uFluid: 0.3,
    uHover: 0,
    uHoverTime: 0,
    uIndex: 0,
    uLines: 22,
    uMapSize: new THREE.Vector2(1, 1),
    uMobile: 0,
    uOffset: 0,
    uPortrait: 0,
    uRadius: 0,
    uResolution: new THREE.Vector2(1, 1),
    uScale: new THREE.Vector2(1, 1),
    tFluid: VECTOR_PLACEHOLDER,
    uMap: IMAGE_PLACEHOLDER,
    uTime: 0,
    uVelocity: 0,
    uVelocityFactor: 1,
    uViewport: 0,
  },
  vertexShader,
  fragmentShader,
)

export type GLSLStretchWaveMaterialInstance = THREE.ShaderMaterial & {
  uniforms: Record<string, THREE.IUniform>
}

export function createGLSLStretchWaveMaterial({
  texture: sourceTexture,
}: {
  texture: THREE.Texture
}): GLSLStretchWaveMaterialInstance {
  const material =
    new GLSLStretchWaveMaterial() as GLSLStretchWaveMaterialInstance

  material.defines = { USE_FLUID: '' }
  material.side = THREE.DoubleSide
  material.transparent = true
  material.uniforms.uMap.value = sourceTexture

  return material
}
