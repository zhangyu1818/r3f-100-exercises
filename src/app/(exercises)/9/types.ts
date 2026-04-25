import type { RefObject } from 'react'

import type * as THREE from 'three/webgpu'

import type { SourceFluid, SourceFluidConfig } from './fluid-core'

export interface StretchPaneState extends SourceFluidConfig {
  baseDark: number
  displacement: number
  fluid: number
  fluidLine: number
  frostAmount: number
  hoverDelay: number
  hoverDuration: number
  lines: number
  scrollClamp: number
  velocityFactor: number
}

export interface SharedMotion {
  shaderOffset: RefObject<number>
  velocity: RefObject<number>
  velocityFactor: RefObject<number>
}

export interface PreviewMetrics {
  baseLeft: number
  height: number
  lastTx: number
  progress: number
  tx: number
  visible: boolean
  width: number
  y: number
}

export interface WorkPlaneProps {
  fluid: SourceFluid
  frostTexture: THREE.Texture
  hoveredPreview: RefObject<number | null>
  index: number
  paneState: RefObject<StretchPaneState>
  previewData: RefObject<PreviewMetrics[]>
  sharedMotion: SharedMotion
  texture: THREE.Texture
}
