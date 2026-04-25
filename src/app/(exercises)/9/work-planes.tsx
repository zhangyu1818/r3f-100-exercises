import { Suspense, type RefObject } from 'react'

import * as THREE from 'three/webgpu'

import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

import { PREVIEW_LAYOUTS } from './constants'
import { useHomeCarousel } from './use-home-carousel'
import { useSourceFluid } from './use-source-fluid'
import { WorkPlane } from './work-plane'

import type { PreviewMetrics, SharedMotion, StretchPaneState } from './types'

export function WorkPlanes({
  advanceMotion,
  containerRef,
  hoveredPreview,
  paneState,
  previewRefs,
}: {
  advanceMotion?: boolean
  containerRef: RefObject<HTMLElement | null>
  hoveredPreview: RefObject<number | null>
  paneState: RefObject<StretchPaneState>
  previewRefs: RefObject<(HTMLElement | null)[]>
}) {
  const { gl, size } = useThree()
  const renderer = gl as unknown as THREE.WebGPURenderer
  const fluid = useSourceFluid(renderer, size, paneState)
  const { previewData, shaderOffset, velocity, velocityFactor } =
    useHomeCarousel({
      advanceMotion,
      containerRef,
      fluid,
      paneState,
      previewRefs,
      size,
    })

  return (
    <Suspense fallback={null}>
      <TexturedWorkPlanes
        fluid={fluid}
        gl={renderer}
        hoveredPreview={hoveredPreview}
        paneState={paneState}
        previewData={previewData}
        sharedMotion={{ shaderOffset, velocity, velocityFactor }}
      />
    </Suspense>
  )
}

function TexturedWorkPlanes({
  fluid,
  gl,
  hoveredPreview,
  paneState,
  previewData,
  sharedMotion,
}: {
  fluid: ReturnType<typeof useSourceFluid>
  gl: THREE.WebGPURenderer
  hoveredPreview: RefObject<number | null>
  paneState: RefObject<StretchPaneState>
  previewData: RefObject<PreviewMetrics[]>
  sharedMotion: SharedMotion
}) {
  const textures = useTexture(
    PREVIEW_LAYOUTS.map((layout) => layout.image),
  ) as THREE.Texture[]
  const frostTexture = useTexture('/9/ice-normals.jpg') as THREE.Texture
  const anisotropy = gl.getMaxAnisotropy()

  ;[...textures, frostTexture].forEach((sourceTexture) => {
    sourceTexture.anisotropy = anisotropy
    sourceTexture.colorSpace = THREE.NoColorSpace
    sourceTexture.generateMipmaps = false
    sourceTexture.magFilter = THREE.LinearFilter
    sourceTexture.minFilter = THREE.LinearFilter
    sourceTexture.wrapS = THREE.ClampToEdgeWrapping
    sourceTexture.wrapT = THREE.ClampToEdgeWrapping
    sourceTexture.needsUpdate = true
  })

  return (
    <>
      {PREVIEW_LAYOUTS.map((layout, index) => (
        <WorkPlane
          key={layout.id}
          fluid={fluid}
          frostTexture={frostTexture}
          hoveredPreview={hoveredPreview}
          index={index}
          paneState={paneState}
          previewData={previewData}
          sharedMotion={sharedMotion}
          texture={textures[index]}
        />
      ))}
    </>
  )
}
