import type { RefObject } from 'react'

import * as THREE from 'three/webgpu'

import {
  createFluidMaterials,
  DoubleTarget,
  FULLSCREEN_POSITIONS,
  FULLSCREEN_UVS,
  type FluidMaterial,
  type FluidMaterials,
  type PointerSize,
  type SourceFluidConfig,
} from './fluid-utils'

interface Splat {
  dx: number
  dy: number
  x: number
  y: number
}
export type { PointerSize, SourceFluidConfig } from './fluid-utils'

export class SourceFluid {
  private readonly camera = new THREE.OrthographicCamera(
    -0.5,
    0.5,
    0.5,
    -0.5,
    0,
    1,
  )
  private readonly curl: THREE.WebGLRenderTarget
  private readonly density: DoubleTarget
  private readonly divergence: THREE.WebGLRenderTarget
  private readonly geometry = new THREE.BufferGeometry()
  private readonly gl: THREE.WebGPURenderer
  private readonly pressure: DoubleTarget
  private readonly scene = new THREE.Scene()
  private readonly configRef: RefObject<SourceFluidConfig>
  private readonly sizeRef: RefObject<PointerSize>
  private readonly splats: Splat[] = []
  private readonly velocity: DoubleTarget
  private readonly advectionMaterial: FluidMaterials['advectionMaterial']
  private readonly clearMaterial: FluidMaterials['clearMaterial']
  private readonly curlMaterial: FluidMaterials['curlMaterial']
  private readonly divergenceMaterial: FluidMaterials['divergenceMaterial']
  private readonly gradientMaterial: FluidMaterials['gradientMaterial']
  private readonly mesh: THREE.Mesh<THREE.BufferGeometry, FluidMaterial>
  private readonly pressureMaterial: FluidMaterials['pressureMaterial']
  private readonly splatMaterial: FluidMaterials['splatMaterial']
  private readonly vorticityMaterial: FluidMaterials['vorticityMaterial']
  private readonly lastMouse = new THREE.Vector2()
  private readonly updateMouseBound: (event: MouseEvent | TouchEvent) => void
  private binded = false
  private lastMouseInitialized = false

  constructor(
    gl: THREE.WebGPURenderer,
    sizeRef: RefObject<PointerSize>,
    configRef: RefObject<SourceFluidConfig>,
  ) {
    this.gl = gl
    this.sizeRef = sizeRef
    this.configRef = configRef
    this.camera.position.z = 1
    this.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(FULLSCREEN_POSITIONS, 3),
    )
    this.geometry.setAttribute(
      'uv',
      new THREE.Float32BufferAttribute(FULLSCREEN_UVS, 2),
    )

    const linearTargetOptions: THREE.RenderTargetOptions = {
      depthBuffer: false,
      format: THREE.RGBAFormat,
      generateMipmaps: false,
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter,
      stencilBuffer: false,
      type: THREE.FloatType,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    }
    const nearestTargetOptions: THREE.RenderTargetOptions = {
      ...linearTargetOptions,
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
      type: THREE.HalfFloatType,
    }
    const SIM_RES = 128
    const DYE_RES = 256
    const texelSize = new THREE.Vector2(1 / SIM_RES, 1 / SIM_RES)

    this.curl = new THREE.WebGLRenderTarget(SIM_RES, SIM_RES, nearestTargetOptions)
    this.divergence = new THREE.WebGLRenderTarget(
      SIM_RES,
      SIM_RES,
      nearestTargetOptions,
    )
    this.density = new DoubleTarget(DYE_RES, DYE_RES, linearTargetOptions)
    this.velocity = new DoubleTarget(SIM_RES, SIM_RES, linearTargetOptions)
    this.pressure = new DoubleTarget(SIM_RES, SIM_RES, nearestTargetOptions)
    const materials = createFluidMaterials(texelSize)
    this.advectionMaterial = materials.advectionMaterial
    this.clearMaterial = materials.clearMaterial
    this.curlMaterial = materials.curlMaterial
    this.divergenceMaterial = materials.divergenceMaterial
    this.gradientMaterial = materials.gradientMaterial
    this.pressureMaterial = materials.pressureMaterial
    this.splatMaterial = materials.splatMaterial
    this.vorticityMaterial = materials.vorticityMaterial

    this.mesh = new THREE.Mesh(this.geometry, this.splatMaterial)
    this.mesh.frustumCulled = false
    this.scene.add(this.mesh)
    this.updateMouseBound = this.updateMouse.bind(this)
  }

  get texture() {
    return this.density.read.texture
  }

  bind() {
    if (this.binded) return
    this.binded = true
    if ('ontouchstart' in window) {
      window.addEventListener('touchstart', this.updateMouseBound, false)
      window.addEventListener('touchmove', this.updateMouseBound, false)
      return
    }
    window.addEventListener('mousemove', this.updateMouseBound, false)
  }

  dispose() {
    this.unbind()
    this.curl.dispose()
    this.divergence.dispose()
    this.density.dispose()
    this.velocity.dispose()
    this.pressure.dispose()
    this.geometry.dispose()
    this.splatMaterial.dispose()
    this.curlMaterial.dispose()
    this.vorticityMaterial.dispose()
    this.divergenceMaterial.dispose()
    this.clearMaterial.dispose()
    this.pressureMaterial.dispose()
    this.gradientMaterial.dispose()
    this.advectionMaterial.dispose()
  }

  unbind() {
    if (!this.binded) return
    this.binded = false
    this.lastMouseInitialized = false
    if ('ontouchstart' in window) {
      window.removeEventListener('touchstart', this.updateMouseBound, false)
      window.removeEventListener('touchmove', this.updateMouseBound, false)
      return
    }
    window.removeEventListener('mousemove', this.updateMouseBound, false)
  }

  update() {
    const config = this.configRef.current
    const previousAutoClear = this.gl.autoClear
    const previousTarget = this.gl.getRenderTarget()
    this.gl.autoClear = false

    for (let index = this.splats.length - 1; index >= 0; index -= 1) {
      this.updateSplat(this.splats.splice(index, 1)[0])
    }

    this.curlMaterial.uniforms.tVelocity.value = this.velocity.read.texture
    this.render(this.curl, this.curlMaterial)
    this.vorticityMaterial.uniforms.tVelocity.value = this.velocity.read.texture
    this.vorticityMaterial.uniforms.tCurl.value = this.curl.texture
    this.vorticityMaterial.uniforms.uCurl.value = config.curlStrength
    this.render(this.velocity.write, this.vorticityMaterial)
    this.velocity.swap()
    this.divergenceMaterial.uniforms.tVelocity.value =
      this.velocity.read.texture
    this.render(this.divergence, this.divergenceMaterial)
    this.clearMaterial.uniforms.tDiffuse.value = this.pressure.read.texture
    this.clearMaterial.uniforms.uDissipation.value = config.pressureDissipation
    this.render(this.pressure.write, this.clearMaterial)
    this.pressure.swap()
    this.pressureMaterial.uniforms.tDivergence.value = this.divergence.texture

    for (
      let index = 0;
      index < Math.max(1, Math.round(config.pressureIterations));
      index += 1
    ) {
      this.pressureMaterial.uniforms.tPressure.value =
        this.pressure.read.texture
      this.render(this.pressure.write, this.pressureMaterial)
      this.pressure.swap()
    }

    this.gradientMaterial.uniforms.tPressure.value = this.pressure.read.texture
    this.gradientMaterial.uniforms.tVelocity.value = this.velocity.read.texture
    this.render(this.velocity.write, this.gradientMaterial)
    this.velocity.swap()
    this.advectionMaterial.uniforms.uDyeTexelSize.value.set(1 / 128, 1 / 128)
    this.advectionMaterial.uniforms.tVelocity.value = this.velocity.read.texture
    this.advectionMaterial.uniforms.tSource.value = this.velocity.read.texture
    this.advectionMaterial.uniforms.uDissipation.value =
      config.velocityDissipation
    this.render(this.velocity.write, this.advectionMaterial)
    this.velocity.swap()
    this.advectionMaterial.uniforms.uDyeTexelSize.value.set(1 / 256, 1 / 256)
    this.advectionMaterial.uniforms.tVelocity.value = this.velocity.read.texture
    this.advectionMaterial.uniforms.tSource.value = this.density.read.texture
    this.advectionMaterial.uniforms.uDissipation.value =
      config.densityDissipation
    this.render(this.density.write, this.advectionMaterial)
    this.density.swap()
    this.gl.setRenderTarget(previousTarget)
    this.gl.autoClear = previousAutoClear
  }

  private render(target: THREE.RenderTarget, material: FluidMaterial) {
    this.mesh.material = material
    this.gl.setRenderTarget(target)
    this.gl.render(this.scene, this.camera)
  }

  private updateMouse(event: MouseEvent | TouchEvent) {
    const target = (
      'changedTouches' in event && event.changedTouches.length !== 0
        ? event.changedTouches[0]
        : event
    ) as {
      clientX?: number
      clientY?: number
      pageX?: number
      pageY?: number
    }
    const rect = this.gl.domElement.getBoundingClientRect()
    const width = rect.width || this.sizeRef.current.width
    const height = rect.height || this.sizeRef.current.height
    const pointerX =
      target.clientX !== undefined
        ? target.clientX
        : target.pageX !== undefined
          ? target.pageX - window.scrollX
          : 0
    const pointerY =
      target.clientY !== undefined
        ? target.clientY
        : target.pageY !== undefined
          ? target.pageY - window.scrollY
          : 0
    const nextX = pointerX - rect.left
    const nextY = pointerY - rect.top

    if (width === 0 || height === 0) return
    if (!this.lastMouseInitialized) {
      this.lastMouseInitialized = true
      this.lastMouse.set(nextX, nextY)
      return
    }

    const dx = nextX - this.lastMouse.x
    const dy = nextY - this.lastMouse.y
    const force = this.configRef.current.splatForce
    this.lastMouse.set(nextX, nextY)
    if (Math.abs(dx) === 0 && Math.abs(dy) === 0) return
    this.splats.push({
      dx: dx * force,
      dy: dy * -force,
      x: nextX / width,
      y: 1 - nextY / height,
    })
  }

  private updateSplat(splat: Splat) {
    this.splatMaterial.uniforms.tTarget.value = this.velocity.read.texture
    this.splatMaterial.uniforms.uAspectRatio.value =
      this.sizeRef.current.width / this.sizeRef.current.height
    this.splatMaterial.uniforms.uPoint.value.set(splat.x, splat.y)
    this.splatMaterial.uniforms.uColor.value.set(splat.dx, splat.dy, 1)
    this.splatMaterial.uniforms.uRadius.value =
      this.configRef.current.splatRadius
    this.render(this.velocity.write, this.splatMaterial)
    this.velocity.swap()
    this.splatMaterial.uniforms.tTarget.value = this.density.read.texture
    this.render(this.density.write, this.splatMaterial)
    this.density.swap()
  }
}
