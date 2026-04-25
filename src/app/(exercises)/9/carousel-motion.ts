import { useRef, type RefObject } from 'react'

export interface CarouselMotionState {
  animatorIn: RefObject<{ value: number }>
  dragDeltaX: RefObject<number>
  homeScrollX: RefObject<number>
  homeScrollXTarget: RefObject<number>
  homeVelocityBonus: RefObject<number>
  lastPointerX: RefObject<number | null>
  pointerDown: RefObject<boolean>
  shaderOffset: RefObject<number>
  velocity: RefObject<number>
  velocityBonus: RefObject<{ value: number }>
  velocityFactor: RefObject<number>
  wheelDeltaX: RefObject<number>
}

export function useCarouselMotionState(): CarouselMotionState {
  const animatorIn = useRef({ value: 0 })
  const dragDeltaX = useRef(0)
  const homeScrollX = useRef(0)
  const homeScrollXTarget = useRef(0)
  const homeVelocityBonus = useRef(0)
  const lastPointerX = useRef<number | null>(null)
  const pointerDown = useRef(false)
  const shaderOffset = useRef(0)
  const velocity = useRef(0)
  const velocityBonus = useRef({ value: 0 })
  const velocityFactor = useRef(1)
  const wheelDeltaX = useRef(0)

  return {
    animatorIn,
    dragDeltaX,
    homeScrollX,
    homeScrollXTarget,
    homeVelocityBonus,
    lastPointerX,
    pointerDown,
    shaderOffset,
    velocity,
    velocityBonus,
    velocityFactor,
    wheelDeltaX,
  }
}
