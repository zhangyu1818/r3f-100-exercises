import type { RefObject } from 'react'

import type * as THREE from 'three'

import type { PreviewMetrics, SharedMotion, StretchPaneState } from '../types'
import type { GLSLSourceFluid } from './glsl-fluid-core'

export type { PreviewMetrics, SharedMotion, StretchPaneState } from '../types'

export interface GLSLWorkPlaneProps {
  fluid: GLSLSourceFluid
  frostTexture: THREE.Texture
  hoveredPreview: RefObject<number | null>
  index: number
  paneState: RefObject<StretchPaneState>
  previewData: RefObject<PreviewMetrics[]>
  sharedMotion: SharedMotion
  texture: THREE.Texture
}
