import {
  If,
  Fn,
  abs,
  cameraProjectionMatrix,
  ceil,
  clamp,
  dot,
  float,
  fract,
  length,
  max,
  min,
  mix,
  mod,
  modelViewMatrix,
  positionLocal,
  screenCoordinate,
  sin,
  smoothstep,
  sqrt,
  step,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'
import * as THREE from 'three/webgpu'

import {
  createStretchWaveUniforms,
  type StretchWaveUniforms,
} from './material-uniforms'

// oxlint-disable-next-line no-explicit-any -- TSL proxied node chaining defies precise typing
type N = any

const sampleRenderTarget = Fn<[N, N], N>(([sourceTexture, sourceUv]) =>
  sourceTexture.sample(vec2(sourceUv.x, float(1).sub(sourceUv.y))),
)

const sampleFluidBilerp = Fn<[N, N, N], N>(
  ([sourceTexture, sourceUv, texelSize]) => {
    const st = sourceUv.div(texelSize).sub(0.5)
    const iuv = st.floor()
    const fuv = st.fract()
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

const random = Fn<[N, N], N>(([n, offset]) =>
  float(0.5).sub(
    fract(
      sin(dot(n.xy.add(vec2(offset, 0)), vec2(12.9898, 78.233))).mul(
        43758.5453,
      ),
    ),
  ),
)

const cmap = Fn<[N, N, N, N, N], N>(([value, inMin, inMax, outMin, outMax]) =>
  outMin.add(outMax.sub(outMin).mul(value.sub(inMin).div(inMax.sub(inMin)))),
)

const scaleUV = Fn<[N, N], N>(([sourceUv, scale]) =>
  sourceUv.sub(0.5).div(scale).add(0.5),
)

const uvFromTextureSize = Fn<[N, N, N], N>(
  ([sourceUv, mapSize, viewportSize]) => {
    const textureAspect = mapSize.x.div(mapSize.y)
    const viewportAspect = viewportSize.x.div(viewportSize.y)
    const ratio = vec2(1).toVar()

    If(textureAspect.greaterThan(viewportAspect), () => {
      ratio.x.assign(viewportAspect.div(textureAspect))
    }).Else(() => {
      ratio.y.assign(textureAspect.div(viewportAspect))
    })

    return sourceUv.sub(0.5).mul(ratio).add(0.5)
  },
)

const roundedBoxSdf = Fn<[N, N, N], N>(([center, size, radius]) =>
  length(max(abs(center).sub(size).add(radius), 0)).sub(radius),
)

const mirror = Fn<[N], N>(([value]) => {
  const mirrored = mod(value, 2)
  return mix(mirrored, float(2).sub(mirrored), step(1, mirrored))
})

const circularIn = Fn<[N], N>(([value]) =>
  float(1).sub(sqrt(float(1).sub(value.mul(value)))),
)

const blendScreenChannel = Fn<[N, N], N>(([base, blend]) =>
  float(1).sub(float(1).sub(base).mul(float(1).sub(blend))),
)

const blendScreenColor = Fn<[N, N, N], N>(([base, blend, opacity]) => {
  const screened = vec3(
    blendScreenChannel(base.r, blend.r),
    blendScreenChannel(base.g, blend.g),
    blendScreenChannel(base.b, blend.b),
  )

  return screened.mul(opacity).add(base.mul(float(1).sub(opacity)))
})

function createDispUv(uniforms: StretchWaveUniforms) {
  return Fn<[N, N, N, N, N, N], N>(
    ([sourceUv, randomValue, dx, dix, frost, fluid]) => {
      const nextUv = vec2(sourceUv).toVar()
      const fX = cmap(frost.x, 0, 1, -1, 1)
      const fY = cmap(frost.y, 0, 1, -1, 1)

      nextUv.x.addAssign(dx.mul(0.7))
      nextUv.x.addAssign(dx.mul(fX).mul(0.2))
      nextUv.y.addAssign(dx.mul(fY).mul(0.2))
      nextUv.x.addAssign(
        fluid.x
          .mul(uniforms.uHover)
          .mul(uniforms.uFluidLine)
          .mul(randomValue)
          .mul(1.3)
          .mul(0.01),
      )
      nextUv.x.addAssign(randomValue.mul(uniforms.uVelocity).mul(0.0001))
      nextUv.x.addAssign(dix.mul(randomValue).mul(uniforms.uHover).mul(0.7))
      nextUv.x.addAssign(
        fX
          .mul(cmap(uniforms.uHover, 0, 1, 0, 2))
          .mul(dix)
          .mul(
            uniforms.uFrostAmount
              .mul(0.1)
              .add(fluid.x.mul(0.0043))
              .add(uniforms.uVelocity.mul(0.003)),
          ),
      )
      nextUv.x.addAssign(
        fX
          .mul(fluid.x)
          .mul(0.005)
          .mul(cmap(uniforms.uHover, 0, 1, 0.5, 1)),
      )
      nextUv.y.addAssign(fY.mul(fluid.y.mul(0.002)))

      return nextUv
    },
  )
}

function createVertexNode(uniforms: StretchWaveUniforms) {
  return Fn<N>(() => {
    const pos = modelViewMatrix.mul(vec4(positionLocal, 1)).toVar()
    const offsetZLandscape = sin(pos.x.mul(0.25).add(uniforms.uTime)).mul(0.12)
    const offsetZPortrait = sin(pos.y.mul(0.5).add(uniforms.uTime)).mul(0.1)
    const offsetZ = mix(offsetZLandscape, offsetZPortrait, uniforms.uPortrait)

    pos.y.addAssign(
      offsetZ
        .mul(
          uniforms.uVelocity.mul(uniforms.uVelocityFactor).mul(0.003).add(0.4),
        )
        .mul(0.7)
        .add(offsetZ.mul(0.1)),
    )
    pos.z.addAssign(
      offsetZ
        .mul(uniforms.uVelocity.mul(uniforms.uVelocityFactor).mul(0.02).add(1))
        .mul(0.7)
        .add(offsetZ.mul(0.1)),
    )

    return cameraProjectionMatrix.mul(pos)
  })()
}

function createFragmentNode(uniforms: StretchWaveUniforms) {
  const dispUv = createDispUv(uniforms)

  return Fn<N>(() => {
    const st = screenCoordinate.div(uniforms.uResolution).flipY()
    const surfaceUv = uv()
    const frostUv = vec2(surfaceUv).toVar()

    frostUv.x.mulAssign(uniforms.uScale.x.div(uniforms.uScale.y))
    frostUv.x.assign(mod(frostUv.x, 1))

    const frost = uniforms.uFrost.sample(frostUv)
    const index = ceil(surfaceUv.x.mul(uniforms.uLines))
    const x = ceil(surfaceUv.x.mul(uniforms.uLines)).div(uniforms.uLines)
    const fluid = sampleFluidBilerp(
      uniforms.tFluid,
      st,
      vec2(1 / 256, 1 / 256),
    ).toVar()

    fluid.xy.mulAssign(vec2(uniforms.uFluid))

    const tUv = scaleUV(
      uvFromTextureSize(surfaceUv, uniforms.uMapSize, uniforms.uScale),
      vec2(1.1),
    ).toVar()

    tUv.x.addAssign(cmap(uniforms.uViewport, 0, 1, -1, 1).mul(0.02))

    const randomOffset = random(vec2(index), index)
    const combinedTime = uniforms.uTime.add(uniforms.uHoverTime)
    const offset = float(-0.7).mul(uniforms.uIndex).mul(uniforms.uPortrait)
    const mask = circularIn(
      cmap(sin(st.x.mul(5).sub(combinedTime.mul(0.8)).add(offset)), 0, 1, 0, 1),
    )
    const maskInner = circularIn(
      cmap(
        sin(surfaceUv.x.mul(1.5).sub(combinedTime.mul(3)).add(offset)),
        0,
        1,
        0,
        1,
      ),
    )
    const dispX = mask.mul(abs(x.sub(0.5))).mul(0.6)
    const dispInX = maskInner.mul(abs(x.sub(0.5)))

    tUv.assign(dispUv(tUv, randomOffset, dispX, dispInX, frost, fluid))

    const texel = uniforms.uMap.sample(mirror(tUv)).toVar()

    const edgeSoftness = float(0.001)
    const radius = uniforms.uRadius
    const ratio = uniforms.uScale.x.div(uniforms.uScale.y)
    const rectUv = vec2(surfaceUv).toVar()

    rectUv.assign(rectUv.mul(2).sub(1))
    rectUv.y.divAssign(ratio)
    rectUv.assign(rectUv.mul(0.5).add(0.5))

    const dist = roundedBoxSdf(
      rectUv.xy.sub(vec2(0.5)),
      vec2(0.5, float(0.5).div(ratio)),
      radius,
    )
    const smoothedAlpha = float(1).sub(
      smoothstep(edgeSoftness.negate(), edgeSoftness, dist),
    )

    texel.a.mulAssign(smoothedAlpha)

    const colorize = blendScreenColor(
      texel.rgb,
      texel.rgb,
      float(0.5).add(clamp(fluid.z.mul(0.1), 0, 0.25)),
    )

    texel.rgb.assign(mix(texel.rgb, colorize, min(1, uniforms.uHover).mul(1.2)))

    const darkMix = uniforms.uHover.mul(0.54).toVar()

    darkMix.addAssign(uniforms.uMobile.mul(0.6))

    texel.rgb.assign(
      mix(
        texel.rgb,
        vec3(0),
        darkMix.mul(cmap(float(1).sub(surfaceUv.y), 0.4, 1, 0, 1)) as N,
      ),
    )

    return texel
  })()
}

export class StretchWaveNodeMaterial extends THREE.MeshBasicNodeMaterial {
  uniforms: StretchWaveUniforms

  constructor() {
    super({
      side: THREE.DoubleSide,
      transparent: true,
    })

    this.uniforms = createStretchWaveUniforms()
    this.vertexNode = createVertexNode(this.uniforms)
    this.fragmentNode = createFragmentNode(this.uniforms)
  }
}
