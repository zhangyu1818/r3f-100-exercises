import {
  Fn,
  If,
  abs,
  dot,
  exp,
  float,
  floor,
  fract,
  length,
  mix,
  texture,
  uniform,
  uv,
  vec2,
  vec4,
} from 'three/tsl'
import * as THREE from 'three/webgpu'

import { VECTOR_PLACEHOLDER } from './material-uniforms'

// oxlint-disable-next-line no-explicit-any -- TSL proxied node chaining defies precise typing
type N = any
// oxlint-disable-next-line no-explicit-any -- TSL proxied texture node defies precise typing
type TslTexture = any
type UniformMap = Record<string, { value: unknown }>

const sampleRenderTarget = Fn<[TslTexture, N], N>(([sourceTexture, sourceUv]) =>
  sourceTexture.sample(vec2(sourceUv.x, float(1).sub(sourceUv.y))),
)

const bilerp = Fn<[TslTexture, N, N], N>(
  ([sourceTexture, sourceUv, texelSize]) => {
    const st = sourceUv.div(texelSize).sub(0.5)
    const iuv = floor(st)
    const fuv = fract(st) as N
    const a = sampleRenderTarget(
      sourceTexture,
      iuv.add(vec2(0.5, 0.5)).mul(texelSize),
    )
    const b = sampleRenderTarget(
      sourceTexture,
      iuv.add(vec2(1.5, 0.5)).mul(texelSize),
    )
    const c = sampleRenderTarget(
      sourceTexture,
      iuv.add(vec2(0.5, 1.5)).mul(texelSize),
    )
    const d = sampleRenderTarget(
      sourceTexture,
      iuv.add(vec2(1.5, 1.5)).mul(texelSize),
    )

    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y)
  },
)

function createNodeMaterial<U extends UniformMap>(
  uniforms: U,
  fragmentNode: THREE.Node,
) {
  const material = new THREE.MeshBasicNodeMaterial({
    depthTest: false,
    depthWrite: false,
    transparent: false,
  }) as THREE.MeshBasicNodeMaterial & { uniforms: U }

  material.uniforms = uniforms
  material.fragmentNode = fragmentNode

  return material
}

function createAdvectionMaterial(texelSize: THREE.Vector2) {
  const uniforms = {
    tSource: texture(VECTOR_PLACEHOLDER),
    tVelocity: texture(VECTOR_PLACEHOLDER),
    uDissipation: uniform(1),
    uDt: uniform(0.016),
    uDyeTexelSize: uniform(new THREE.Vector2(1 / 128, 1 / 128)),
    uTexelSize: uniform(texelSize.clone()),
  }
  const fragmentNode = Fn(() => {
    const sourceUv = uv()
    const coord = sourceUv.sub(
      uniforms.uDt
        .mul(bilerp(uniforms.tVelocity, sourceUv, uniforms.uTexelSize).xy)
        .mul(uniforms.uTexelSize),
    )
    const texel = uniforms.uDissipation
      .mul(bilerp(uniforms.tSource, coord, uniforms.uDyeTexelSize))
      .toVar() as N

    texel.a.assign(1)

    return texel
  })()

  return createNodeMaterial(uniforms, fragmentNode)
}

function createClearMaterial(texelSize: THREE.Vector2) {
  const uniforms = {
    tDiffuse: texture(VECTOR_PLACEHOLDER),
    uDissipation: uniform(0.4),
    uTexelSize: uniform(texelSize.clone()),
  }
  const fragmentNode = Fn(() =>
    uniforms.uDissipation.mul(sampleRenderTarget(uniforms.tDiffuse, uv())),
  )()

  return createNodeMaterial(uniforms, fragmentNode)
}

function getNeighborUvs(texelSize: N) {
  const sourceUv = uv()

  return {
    sourceUv,
    vB: sourceUv.sub(vec2(0, texelSize.y)),
    vL: sourceUv.sub(vec2(texelSize.x, 0)),
    vR: sourceUv.add(vec2(texelSize.x, 0)),
    vT: sourceUv.add(vec2(0, texelSize.y)),
  }
}

function createCurlMaterial(texelSize: THREE.Vector2) {
  const uniforms = {
    tVelocity: texture(VECTOR_PLACEHOLDER),
    uTexelSize: uniform(texelSize.clone()),
  }
  const fragmentNode = Fn(() => {
    const { vB, vL, vR, vT } = getNeighborUvs(uniforms.uTexelSize)
    const l = sampleRenderTarget(uniforms.tVelocity, vL).y
    const r = sampleRenderTarget(uniforms.tVelocity, vR).y
    const t = sampleRenderTarget(uniforms.tVelocity, vT).x
    const b = sampleRenderTarget(uniforms.tVelocity, vB).x
    const vorticity = r.sub(l).sub(t).add(b)

    return vec4(vorticity.mul(0.5), 0, 0, 1)
  })()

  return createNodeMaterial(uniforms, fragmentNode)
}

function createDivergenceMaterial(texelSize: THREE.Vector2) {
  const uniforms = {
    tVelocity: texture(VECTOR_PLACEHOLDER),
    uTexelSize: uniform(texelSize.clone()),
  }
  const fragmentNode = Fn(() => {
    const { sourceUv, vB, vL, vR, vT } = getNeighborUvs(uniforms.uTexelSize)
    const l = sampleRenderTarget(uniforms.tVelocity, vL).x.toVar()
    const r = sampleRenderTarget(uniforms.tVelocity, vR).x.toVar()
    const t = sampleRenderTarget(uniforms.tVelocity, vT).y.toVar()
    const b = sampleRenderTarget(uniforms.tVelocity, vB).y.toVar()
    const center = sampleRenderTarget(uniforms.tVelocity, sourceUv).xy

    If(vL.x.lessThan(0), () => {
      l.assign(center.x.negate())
    })
    If(vR.x.greaterThan(1), () => {
      r.assign(center.x.negate())
    })
    If(vT.y.greaterThan(1), () => {
      t.assign(center.y.negate())
    })
    If(vB.y.lessThan(0), () => {
      b.assign(center.y.negate())
    })

    const divergence = r.sub(l).add(t).sub(b).mul(0.5)

    return vec4(divergence, 0, 0, 1)
  })()

  return createNodeMaterial(uniforms, fragmentNode)
}

function createGradientMaterial(texelSize: THREE.Vector2) {
  const uniforms = {
    tPressure: texture(VECTOR_PLACEHOLDER),
    tVelocity: texture(VECTOR_PLACEHOLDER),
    uTexelSize: uniform(texelSize.clone()),
  }
  const fragmentNode = Fn(() => {
    const { sourceUv, vB, vL, vR, vT } = getNeighborUvs(uniforms.uTexelSize)
    const l = sampleRenderTarget(uniforms.tPressure, vL).x
    const r = sampleRenderTarget(uniforms.tPressure, vR).x
    const t = sampleRenderTarget(uniforms.tPressure, vT).x
    const b = sampleRenderTarget(uniforms.tPressure, vB).x
    const velocity = sampleRenderTarget(uniforms.tVelocity, sourceUv).xy.toVar()

    velocity.subAssign(vec2(r.sub(l), t.sub(b)))

    return vec4(velocity, 0, 1)
  })()

  return createNodeMaterial(uniforms, fragmentNode)
}

function createPressureMaterial(texelSize: THREE.Vector2) {
  const uniforms = {
    tDivergence: texture(VECTOR_PLACEHOLDER),
    tPressure: texture(VECTOR_PLACEHOLDER),
    uTexelSize: uniform(texelSize.clone()),
  }
  const fragmentNode = Fn(() => {
    const { sourceUv, vB, vL, vR, vT } = getNeighborUvs(uniforms.uTexelSize)
    const l = sampleRenderTarget(uniforms.tPressure, vL).x
    const r = sampleRenderTarget(uniforms.tPressure, vR).x
    const t = sampleRenderTarget(uniforms.tPressure, vT).x
    const b = sampleRenderTarget(uniforms.tPressure, vB).x
    const divergence = sampleRenderTarget(uniforms.tDivergence, sourceUv).x
    const pressure = l.add(r).add(b).add(t).sub(divergence).mul(0.25)

    return vec4(pressure, 0, 0, 1)
  })()

  return createNodeMaterial(uniforms, fragmentNode)
}

function createSplatMaterial() {
  const uniforms = {
    tTarget: texture(VECTOR_PLACEHOLDER),
    uAspectRatio: uniform(1),
    uColor: uniform(new THREE.Vector3()),
    uPoint: uniform(new THREE.Vector2()),
    uRadius: uniform(1),
  }
  const fragmentNode = Fn(() => {
    const sourceUv = uv()
    const p = sourceUv.sub(uniforms.uPoint.xy)
    const splat = exp(dot(p, p).negate().div(uniforms.uRadius)).mul(
      uniforms.uColor,
    )
    const base = sampleRenderTarget(uniforms.tTarget, sourceUv).xyz

    return vec4(base.add(splat), 1)
  })()

  return createNodeMaterial(uniforms, fragmentNode)
}

function createVorticityMaterial(texelSize: THREE.Vector2) {
  const uniforms = {
    tCurl: texture(VECTOR_PLACEHOLDER),
    tVelocity: texture(VECTOR_PLACEHOLDER),
    uCurl: uniform(2.2),
    uDt: uniform(0.016),
    uTexelSize: uniform(texelSize.clone()),
  }
  const fragmentNode = Fn(() => {
    const { sourceUv, vB, vL, vR, vT } = getNeighborUvs(uniforms.uTexelSize)
    const l = sampleRenderTarget(uniforms.tCurl, vL).x
    const r = sampleRenderTarget(uniforms.tCurl, vR).x
    const t = sampleRenderTarget(uniforms.tCurl, vT).x
    const b = sampleRenderTarget(uniforms.tCurl, vB).x
    const center = sampleRenderTarget(uniforms.tCurl, sourceUv).x
    const force = vec2(abs(t).sub(abs(b)), abs(r).sub(abs(l)))
      .mul(0.5)
      .toVar()

    force.divAssign(length(force).add(0.0001))
    force.mulAssign(uniforms.uCurl.mul(center))
    force.y.mulAssign(-1)

    const velocity = sampleRenderTarget(uniforms.tVelocity, sourceUv).xy

    return vec4(velocity.add(force.mul(uniforms.uDt)), 0, 1)
  })()

  return createNodeMaterial(uniforms, fragmentNode)
}

export function createFluidMaterials(texelSize: THREE.Vector2) {
  return {
    advectionMaterial: createAdvectionMaterial(texelSize),
    clearMaterial: createClearMaterial(texelSize),
    curlMaterial: createCurlMaterial(texelSize),
    divergenceMaterial: createDivergenceMaterial(texelSize),
    gradientMaterial: createGradientMaterial(texelSize),
    pressureMaterial: createPressureMaterial(texelSize),
    splatMaterial: createSplatMaterial(),
    vorticityMaterial: createVorticityMaterial(texelSize),
  }
}

export type FluidMaterials = ReturnType<typeof createFluidMaterials>
export type FluidMaterial = FluidMaterials[keyof FluidMaterials]
