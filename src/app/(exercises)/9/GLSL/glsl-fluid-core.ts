import type { RefObject } from 'react'

import * as THREE from 'three'

import {
  createGLSLFluidMaterials,
  GLSLDoubleTarget,
  FULLSCREEN_POSITIONS,
  FULLSCREEN_UVS,
  type PointerSize,
  type SourceFluidConfig,
} from './glsl-fluid-utils'

interface Splat {
  dx: number
  dy: number
  x: number
  y: number
}
export type { PointerSize, SourceFluidConfig } from './glsl-fluid-utils'

export class GLSLSourceFluid {
  private readonly camera = new THREE.OrthographicCamera(
    -0.5,
    0.5,
    0.5,
    -0.5,
    0,
    1,
  )
  private readonly curl: THREE.WebGLRenderTarget
  private readonly density: GLSLDoubleTarget
  private readonly divergence: THREE.WebGLRenderTarget
  private readonly geometry = new THREE.BufferGeometry()
  private readonly gl: THREE.WebGLRenderer
  private readonly pressure: GLSLDoubleTarget
  private readonly scene = new THREE.Scene()
  private readonly configRef: RefObject<SourceFluidConfig>
  private readonly sizeRef: RefObject<PointerSize>
  private readonly splats: Splat[] = []
  private readonly velocity: GLSLDoubleTarget
  private readonly advectionMaterial: THREE.ShaderMaterial
  private readonly clearMaterial: THREE.ShaderMaterial
  private readonly curlMaterial: THREE.ShaderMaterial
  private readonly divergenceMaterial: THREE.ShaderMaterial
  private readonly gradientMaterial: THREE.ShaderMaterial
  private readonly mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  private readonly pressureMaterial: THREE.ShaderMaterial
  private readonly splatMaterial: THREE.ShaderMaterial
  private readonly vorticityMaterial: THREE.ShaderMaterial
  private readonly lastMouse = new THREE.Vector2()
  private readonly updateMouseBound: (event: MouseEvent | TouchEvent) => void
  private binded = false
  private lastMouseInitialized = false

  constructor(
    gl: THREE.WebGLRenderer,
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
      type: THREE.HalfFloatType,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    }
    const nearestTargetOptions: THREE.RenderTargetOptions = {
      ...linearTargetOptions,
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
    }
    const texelSize = new THREE.Vector2(1 / 64, 1 / 64)

    this.curl = new THREE.WebGLRenderTarget(64, 64, nearestTargetOptions)
    this.divergence = new THREE.WebGLRenderTarget(64, 64, nearestTargetOptions)
    this.density = new GLSLDoubleTarget(128, 128, linearTargetOptions)
    this.velocity = new GLSLDoubleTarget(64, 64, linearTargetOptions)
    this.pressure = new GLSLDoubleTarget(64, 64, nearestTargetOptions)
    const materials = createGLSLFluidMaterials(texelSize)
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
    this.advectionMaterial.uniforms.uDyeTexelSize.value.set(1 / 64, 1 / 64)
    this.advectionMaterial.uniforms.tVelocity.value = this.velocity.read.texture
    this.advectionMaterial.uniforms.tSource.value = this.velocity.read.texture
    this.advectionMaterial.uniforms.uDissipation.value =
      config.velocityDissipation
    this.render(this.velocity.write, this.advectionMaterial)
    this.velocity.swap()
    this.advectionMaterial.uniforms.uDyeTexelSize.value.set(1 / 128, 1 / 128)
    this.advectionMaterial.uniforms.tVelocity.value = this.velocity.read.texture
    this.advectionMaterial.uniforms.tSource.value = this.density.read.texture
    this.advectionMaterial.uniforms.uDissipation.value =
      config.densityDissipation
    this.render(this.density.write, this.advectionMaterial)
    this.density.swap()
    this.gl.setRenderTarget(previousTarget)
    this.gl.autoClear = previousAutoClear
  }

  private render(
    target: THREE.WebGLRenderTarget,
    material: THREE.ShaderMaterial,
  ) {
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
