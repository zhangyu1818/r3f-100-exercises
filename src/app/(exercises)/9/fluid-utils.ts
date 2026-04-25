import * as THREE from 'three/webgpu'

export {
  createFluidMaterials,
  type FluidMaterial,
  type FluidMaterials,
} from './fluid-materials-tsl'

export interface PointerSize {
  height: number
  width: number
}

export interface SourceFluidConfig {
  curlStrength: number
  densityDissipation: number
  pressureDissipation: number
  pressureIterations: number
  splatForce: number
  splatRadius: number
  velocityDissipation: number
}

export const FULLSCREEN_POSITIONS = new Float32Array([
  -0.5, -0.5, 0, 1.5, -0.5, 0, -0.5, 1.5, 0,
])
export const FULLSCREEN_UVS = new Float32Array([0, 0, 2, 0, 0, 2])

export class DoubleTarget {
  read: THREE.WebGLRenderTarget
  write: THREE.WebGLRenderTarget

  constructor(
    width: number,
    height: number,
    options: THREE.RenderTargetOptions,
  ) {
    this.read = new THREE.WebGLRenderTarget(width, height, options)
    this.write = new THREE.WebGLRenderTarget(width, height, options)
  }

  dispose() {
    this.read.dispose()
    this.write.dispose()
  }

  swap() {
    const next = this.read
    this.read = this.write
    this.write = next
  }
}
