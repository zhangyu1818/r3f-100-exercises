import * as THREE from 'three'

import advectionFragmentShader from './shaders/fluid/advection.fragment.glsl'
import clearFragmentShader from './shaders/fluid/clear.fragment.glsl'
import curlFragmentShader from './shaders/fluid/curl.fragment.glsl'
import divergenceFragmentShader from './shaders/fluid/divergence.fragment.glsl'
import fluidVertexShader from './shaders/fluid/fluid.vertex.glsl'
import fullscreenVertexShader from './shaders/fluid/fullscreen.vertex.glsl'
import gradientFragmentShader from './shaders/fluid/gradient.fragment.glsl'
import pressureFragmentShader from './shaders/fluid/pressure.fragment.glsl'
import splatFragmentShader from './shaders/fluid/splat.fragment.glsl'
import vorticityFragmentShader from './shaders/fluid/vorticity.fragment.glsl'

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

export class GLSLDoubleTarget {
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

function createShaderMaterial(
  vertexShader: string,
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>,
) {
  return new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    fragmentShader,
    transparent: false,
    uniforms,
    vertexShader,
  })
}

export function createGLSLFluidMaterials(texelSize: THREE.Vector2) {
  return {
    advectionMaterial: createShaderMaterial(
      fullscreenVertexShader,
      advectionFragmentShader,
      {
        tSource: { value: null },
        tVelocity: { value: null },
        uDissipation: { value: 1 },
        uDt: { value: 0.016 },
        uDyeTexelSize: { value: new THREE.Vector2(1 / 128, 1 / 128) },
        uTexelSize: { value: texelSize.clone() },
      },
    ),
    clearMaterial: createShaderMaterial(
      fluidVertexShader,
      clearFragmentShader,
      {
        tDiffuse: { value: null },
        uDissipation: { value: 0.4 },
        uTexelSize: { value: texelSize.clone() },
      },
    ),
    curlMaterial: createShaderMaterial(fluidVertexShader, curlFragmentShader, {
      tVelocity: { value: null },
      uTexelSize: { value: texelSize.clone() },
    }),
    divergenceMaterial: createShaderMaterial(
      fluidVertexShader,
      divergenceFragmentShader,
      { tVelocity: { value: null }, uTexelSize: { value: texelSize.clone() } },
    ),
    gradientMaterial: createShaderMaterial(
      fluidVertexShader,
      gradientFragmentShader,
      {
        tPressure: { value: null },
        tVelocity: { value: null },
        uTexelSize: { value: texelSize.clone() },
      },
    ),
    pressureMaterial: createShaderMaterial(
      fluidVertexShader,
      pressureFragmentShader,
      {
        tDivergence: { value: null },
        tPressure: { value: null },
        uTexelSize: { value: texelSize.clone() },
      },
    ),
    splatMaterial: createShaderMaterial(
      fullscreenVertexShader,
      splatFragmentShader,
      {
        tTarget: { value: null },
        uAspectRatio: { value: 1 },
        uColor: { value: new THREE.Vector3() },
        uPoint: { value: new THREE.Vector2() },
        uRadius: { value: 1 },
      },
    ),
    vorticityMaterial: createShaderMaterial(
      fluidVertexShader,
      vorticityFragmentShader,
      {
        tCurl: { value: null },
        tVelocity: { value: null },
        uCurl: { value: 2.2 },
        uDt: { value: 0.016 },
        uTexelSize: { value: texelSize.clone() },
      },
    ),
  }
}

export type GLSLFluidMaterials = ReturnType<typeof createGLSLFluidMaterials>
export type GLSLFluidMaterial = GLSLFluidMaterials[keyof GLSLFluidMaterials]
