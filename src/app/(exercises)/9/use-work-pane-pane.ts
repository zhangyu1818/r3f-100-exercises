import { useEffect, useRef, type RefObject } from 'react'

import { Pane } from 'tweakpane'

import { SOURCE_DEFAULTS } from './constants'

import type { StretchPaneState } from './types'

export type ViewMode = 'both' | 'glsl' | 'tsl'

export function useWorkPanePane(
  paneState: RefObject<StretchPaneState>,
  onViewChange?: (mode: ViewMode) => void,
) {
  const onViewChangeRef = useRef(onViewChange)
  onViewChangeRef.current = onViewChange

  useEffect(() => {
    const container = document.createElement('div')
    container.style.pointerEvents = 'auto'
    container.style.position = 'fixed'
    container.style.right = '16px'
    container.style.top = '16px'
    container.style.width = 'fit-content'
    container.style.zIndex = '60'
    document.body.appendChild(container)

    const pane = new Pane({ container, title: 'Work Plane' })

    const viewParams = { view: 'both' as ViewMode }
    pane
      .addBinding(viewParams, 'view', {
        label: 'View',
        options: {
          Both: 'both',
          GLSL: 'glsl',
          TSL: 'tsl',
        },
      })
      .on('change', (ev) => {
        onViewChangeRef.current?.(ev.value)
      })

    const planeFolder = pane.addFolder({ title: 'Plane', expanded: true })
    const hoverFolder = pane.addFolder({ title: 'Hover', expanded: false })
    const fluidFolder = pane.addFolder({ title: 'Fluid', expanded: false })

    planeFolder.addBinding(paneState.current, 'lines', {
      label: 'Lines',
      max: 60,
      min: 1,
      step: 1,
    })
    planeFolder.addBinding(paneState.current, 'frostAmount', {
      label: 'Frost',
      max: 1,
      min: 0,
      step: 0.01,
    })
    planeFolder.addBinding(paneState.current, 'displacement', {
      label: 'Displace',
      max: 2,
      min: 0,
      step: 0.01,
    })
    planeFolder.addBinding(paneState.current, 'fluidLine', {
      label: 'Fluid Line',
      max: 2,
      min: 0,
      step: 0.01,
    })
    planeFolder.addBinding(paneState.current, 'fluid', {
      label: 'Fluid',
      max: 1,
      min: 0,
      step: 0.01,
    })
    planeFolder.addBinding(paneState.current, 'velocityFactor', {
      label: 'Velocity',
      max: 4,
      min: 0,
      step: 0.01,
    })
    planeFolder.addBinding(paneState.current, 'baseDark', {
      label: 'Base Dark',
      max: 1,
      min: 0,
      step: 0.01,
    })

    hoverFolder.addBinding(paneState.current, 'hoverDelay', {
      label: 'Delay',
      max: 300,
      min: 0,
      step: 1,
    })
    hoverFolder.addBinding(paneState.current, 'hoverDuration', {
      label: 'Duration',
      max: 1,
      min: 0.05,
      step: 0.01,
    })

    planeFolder.addBinding(paneState.current, 'scrollClamp', {
      label: 'Clamp',
      max: 1200,
      min: 50,
      step: 1,
    })

    fluidFolder.addBinding(paneState.current, 'curlStrength', {
      label: 'Curl',
      max: 5,
      min: 0,
      step: 0.01,
    })
    fluidFolder.addBinding(paneState.current, 'velocityDissipation', {
      label: 'Vel Diss',
      max: 1,
      min: 0.8,
      step: 0.001,
    })
    fluidFolder.addBinding(paneState.current, 'densityDissipation', {
      label: 'Dye Diss',
      max: 1,
      min: 0.8,
      step: 0.001,
    })
    fluidFolder.addBinding(paneState.current, 'pressureDissipation', {
      label: 'Pressure',
      max: 1,
      min: 0,
      step: 0.001,
    })
    fluidFolder.addBinding(paneState.current, 'pressureIterations', {
      label: 'Iterations',
      max: 20,
      min: 1,
      step: 1,
    })
    fluidFolder.addBinding(paneState.current, 'splatForce', {
      label: 'Splat Force',
      max: 20,
      min: 0,
      step: 0.1,
    })
    fluidFolder.addBinding(paneState.current, 'splatRadius', {
      label: 'Splat Radius',
      max: 0.01,
      min: 0.0001,
      step: 0.0001,
    })

    pane.addButton({ title: 'Reset Source' }).on('click', () => {
      Object.assign(paneState.current, SOURCE_DEFAULTS)
      pane.refresh()
    })

    return () => {
      pane.dispose()
      container.remove()
    }
  }, [])
}
