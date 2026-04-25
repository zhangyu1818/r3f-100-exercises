'use client'

import {
  Suspense,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

import * as THREE from 'three/webgpu'

import { Canvas, type CanvasProps } from '@react-three/fiber'

import { DefaultLayout } from '@/components/layout'

import { GLSLWorkPlanes } from './GLSL/glsl-work-planes'
import { SOURCE_DEFAULTS } from './constants'
import { PreviewLayer } from './preview-layer'
import { useWorkPanePane, type ViewMode } from './use-work-pane-pane'
import { WorkPlanes } from './work-planes'

import type { StretchPaneState } from './types'

const createWebGPURenderer = (async ({ canvas }) => {
  const renderer = new THREE.WebGPURenderer({
    alpha: true,
    antialias: false,
    canvas: canvas as HTMLCanvasElement,
    powerPreference: 'high-performance',
  })

  renderer.outputColorSpace = THREE.LinearSRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping

  await renderer.init()

  return renderer
}) as NonNullable<CanvasProps['gl']>

export default function Page() {
  return <ComparisonScene />
}

function ComparisonScene() {
  const [viewMode, setViewMode] = useState<ViewMode>('both')
  const paneState = useRef<StretchPaneState>({ ...SOURCE_DEFAULTS })
  const glslContainerRef = useRef<HTMLElement | null>(null)
  const tslContainerRef = useRef<HTMLElement | null>(null)
  const glslPreviewRefs = useRef<(HTMLElement | null)[]>([])
  const tslPreviewRefs = useRef<(HTMLElement | null)[]>([])
  const glslHoveredPreview = useRef<number | null>(null)
  const tslHoveredPreview = useRef<number | null>(null)
  const clickOrigin = useRef({ time: 0, x: 0, y: 0 })

  useWorkPanePane(paneState, setViewMode)

  const showGLSL = viewMode !== 'tsl'
  const showTSL = viewMode !== 'glsl'
  const isSingle = viewMode !== 'both'

  const handlePreviewPointerDown = (event: PointerEvent<HTMLElement>) => {
    clickOrigin.current = {
      time: Date.now(),
      x: event.clientX,
      y: event.clientY,
    }
  }

  const handlePreviewClick = (event: MouseEvent<HTMLElement>) => {
    const origin = clickOrigin.current

    if (origin.time === 0) {
      return
    }

    const moved =
      Math.abs(event.clientX - origin.x) > 4 ||
      Math.abs(event.clientY - origin.y) > 4
    const pressedFor = Date.now() - origin.time
    clickOrigin.current.time = 0

    if (moved || pressedFor > 350) {
      event.preventDefault()
    }
  }

  return (
    <DefaultLayout
      className="relative size-full overflow-hidden bg-black text-white"
      author="Patrick Heng"
      authorLink="https://www.commarts.com/webpicks/steviaplease"
    >
      <div
        className={[
          'absolute inset-0 grid overflow-hidden bg-black',
          viewMode === 'both' ? 'grid-rows-2' : 'grid-rows-1',
        ].join(' ')}
      >
        {showGLSL && (
          <section
            ref={glslContainerRef}
            className={[
              'relative min-h-0 overflow-hidden',
              viewMode === 'both' ? 'border-b border-white/15' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <PaneLabel>GLSL</PaneLabel>
            <Canvas
              camera={{ fov: 45, position: [0, 0, 10] }}
              dpr={[1, 1.5]}
              flat
              linear
              gl={{
                alpha: true,
                antialias: false,
                autoClear: true,
                powerPreference: 'high-performance',
              }}
              style={{
                inset: 0,
                pointerEvents: 'none',
                position: 'absolute',
                touchAction: 'none',
              }}
            >
              <Suspense fallback={null}>
                <GLSLWorkPlanes
                  advanceMotion
                  containerRef={glslContainerRef}
                  hoveredPreview={glslHoveredPreview}
                  paneState={paneState}
                  previewRefs={glslPreviewRefs}
                />
              </Suspense>
            </Canvas>
            <PreviewLayer
              fullscreen={isSingle}
              hoveredPreview={glslHoveredPreview}
              onPreviewClick={handlePreviewClick}
              onPreviewPointerDown={handlePreviewPointerDown}
              previewRefs={glslPreviewRefs}
            />
          </section>
        )}
        {showTSL && (
          <section
            ref={tslContainerRef}
            className="relative min-h-0 overflow-hidden"
          >
            <PaneLabel>TSL</PaneLabel>
            <Canvas
              camera={{ fov: 45, position: [0, 0, 10] }}
              dpr={[1, 1.5]}
              flat
              linear
              gl={createWebGPURenderer}
              style={{
                inset: 0,
                pointerEvents: 'none',
                position: 'absolute',
                touchAction: 'none',
              }}
            >
              <Suspense fallback={null}>
                <WorkPlanes
                  advanceMotion
                  containerRef={tslContainerRef}
                  hoveredPreview={tslHoveredPreview}
                  paneState={paneState}
                  previewRefs={tslPreviewRefs}
                />
              </Suspense>
            </Canvas>
            <PreviewLayer
              fullscreen={isSingle}
              hoveredPreview={tslHoveredPreview}
              onPreviewClick={handlePreviewClick}
              onPreviewPointerDown={handlePreviewPointerDown}
              previewRefs={tslPreviewRefs}
            />
          </section>
        )}
      </div>
    </DefaultLayout>
  )
}

function PaneLabel({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute top-4 left-4 z-30 rounded-full bg-black/30 px-3 py-1 text-xs font-medium tracking-[0.16em] text-white backdrop-blur">
      {children}
    </div>
  )
}
