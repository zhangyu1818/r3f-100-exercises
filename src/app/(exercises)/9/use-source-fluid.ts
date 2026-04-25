import { useEffect, useRef, type RefObject } from 'react'

import type * as THREE from 'three/webgpu'

import { SourceFluid, type SourceFluidConfig } from './fluid-core'

interface PointerSize {
  height: number
  width: number
}

export function useSourceFluid<T extends SourceFluidConfig>(
  gl: THREE.WebGPURenderer,
  size: PointerSize,
  configRef: RefObject<T>,
) {
  const sizeRef = useRef<PointerSize>(size)
  const fluidRef = useRef<SourceFluid | null>(null)

  sizeRef.current = size
  const fluid =
    fluidRef.current ??
    (fluidRef.current = new SourceFluid(gl, sizeRef, configRef))

  useEffect(() => {
    fluid.bind()

    return () => {
      fluid.dispose()
    }
  }, [])

  return fluid
}
