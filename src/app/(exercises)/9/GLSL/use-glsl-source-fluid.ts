import { useEffect, useRef, type RefObject } from 'react'

import type { WebGLRenderer } from 'three'

import { GLSLSourceFluid, type SourceFluidConfig } from './glsl-fluid-core'

interface PointerSize {
  height: number
  width: number
}

export function useGLSLSourceFluid<T extends SourceFluidConfig>(
  gl: WebGLRenderer,
  size: PointerSize,
  configRef: RefObject<T>,
) {
  const sizeRef = useRef<PointerSize>(size)
  const fluidRef = useRef<GLSLSourceFluid | null>(null)

  sizeRef.current = size
  const fluid =
    fluidRef.current ??
    (fluidRef.current = new GLSLSourceFluid(gl, sizeRef, configRef))

  useEffect(() => {
    fluid.bind()

    return () => {
      fluid.dispose()
    }
  }, [])

  return fluid
}
