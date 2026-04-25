import { texture, uniform } from 'three/tsl'
import * as THREE from 'three/webgpu'

export const IMAGE_PLACEHOLDER: THREE.Texture = (() => {
  const sourceTexture = new THREE.DataTexture(
    new Uint8Array([255, 255, 255, 255]),
    1,
    1,
    THREE.RGBAFormat,
  )
  sourceTexture.needsUpdate = true
  return sourceTexture
})()

export const VECTOR_PLACEHOLDER: THREE.Texture = (() => {
  const sourceTexture = new THREE.DataTexture(
    new Uint8Array([128, 128, 255, 255]),
    1,
    1,
    THREE.RGBAFormat,
  )
  sourceTexture.needsUpdate = true
  return sourceTexture
})()

export const STRETCH_WAVE_UNIFORM_DEFAULTS = {
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
}

export function createStretchWaveUniforms() {
  return {
    uDisplacement: uniform(0.8),
    uFrost: texture(VECTOR_PLACEHOLDER),
    uFrostAmount: uniform(0.23),
    uFluidLine: uniform(0.8),
    uFluid: uniform(0.3),
    uHover: uniform(0),
    uHoverTime: uniform(0),
    uIndex: uniform(0),
    uLines: uniform(22),
    uMapSize: uniform(new THREE.Vector2(1, 1)),
    uMobile: uniform(0),
    uOffset: uniform(0),
    uPortrait: uniform(0),
    uRadius: uniform(0),
    uResolution: uniform(new THREE.Vector2(1, 1)),
    uScale: uniform(new THREE.Vector2(1, 1)),
    tFluid: texture(VECTOR_PLACEHOLDER),
    uMap: texture(IMAGE_PLACEHOLDER),
    uTime: uniform(0),
    uVelocity: uniform(0),
    uVelocityFactor: uniform(1),
    uViewport: uniform(0),
  }
}

export type StretchWaveUniforms = ReturnType<typeof createStretchWaveUniforms>
