import { Suspense, type RefObject } from 'react'

import * as THREE from 'three'

import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

import { PREVIEW_LAYOUTS } from '../constants'
import { GLSLWorkPlane } from './glsl-work-plane'
import { useGLSLHomeCarousel } from './use-glsl-home-carousel'
import { useGLSLSourceFluid } from './use-glsl-source-fluid'

import type {
  PreviewMetrics,
  SharedMotion,
  StretchPaneState,
} from './glsl-types'

export function GLSLWorkPlanes({
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
  const fluid = useGLSLSourceFluid(gl, size, paneState)
  const { previewData, shaderOffset, velocity, velocityFactor } =
    useGLSLHomeCarousel({
      advanceMotion,
      containerRef,
      fluid,
      paneState,
      previewRefs,
      size,
    })

  return (
    <Suspense fallback={null}>
      <GLSLTexturedWorkPlanes
        fluid={fluid}
        gl={gl}
        hoveredPreview={hoveredPreview}
        paneState={paneState}
        previewData={previewData}
        sharedMotion={{ shaderOffset, velocity, velocityFactor }}
      />
    </Suspense>
  )
}

function GLSLTexturedWorkPlanes({
  fluid,
  gl,
  hoveredPreview,
  paneState,
  previewData,
  sharedMotion,
}: {
  fluid: ReturnType<typeof useGLSLSourceFluid>
  gl: THREE.WebGLRenderer
  hoveredPreview: RefObject<number | null>
  paneState: RefObject<StretchPaneState>
  previewData: RefObject<PreviewMetrics[]>
  sharedMotion: SharedMotion
}) {
  const textures = useTexture(
    PREVIEW_LAYOUTS.map((layout) => layout.image),
  ) as THREE.Texture[]
  const frostTexture = useTexture('/9/ice-normals.jpg') as THREE.Texture
  const anisotropy = gl.capabilities.getMaxAnisotropy()

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
        <GLSLWorkPlane
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
