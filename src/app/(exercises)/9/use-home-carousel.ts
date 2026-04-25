import { useEffect, useRef, type RefObject } from 'react'

import * as THREE from 'three/webgpu'

import { useFrame } from '@react-three/fiber'

import { gsap } from 'gsap'

import { useCarouselMotionState } from './carousel-motion'
import { PREVIEW_LAYOUTS, PREVIEW_SPACING } from './constants'
import { wrapPosition } from './utils'

import type { SourceFluid } from './fluid-core'
import type { PreviewMetrics, StretchPaneState } from './types'

interface UseHomeCarouselArgs {
  advanceMotion?: boolean
  containerRef?: RefObject<HTMLElement | null>
  fluid: SourceFluid
  paneState: RefObject<StretchPaneState>
  previewRefs: RefObject<(HTMLElement | null)[]>
  size: {
    height: number
    width: number
  }
}

export function useHomeCarousel({
  advanceMotion = true,
  containerRef,
  fluid,
  paneState,
  previewRefs,
  size,
}: UseHomeCarouselArgs) {
  const previewData = useRef<PreviewMetrics[]>(
    PREVIEW_LAYOUTS.map(() => ({
      baseLeft: 0,
      height: 0,
      lastTx: -1,
      progress: 0,
      tx: 0,
      visible: false,
      width: 0,
      y: 0,
    })),
  )
  const totalWidth = useRef(1)
  const motion = useCarouselMotionState()
  const {
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
  } = motion

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      let nextLeft = 0
      const containerRect = containerRef?.current?.getBoundingClientRect()
      const offsetY = containerRect?.y ?? 0

      previewData.current.forEach((metrics, index) => {
        const node = previewRefs.current[index]

        if (!node) {
          return
        }

        const rect = node.getBoundingClientRect()
        metrics.baseLeft = nextLeft
        metrics.height = rect.height
        metrics.width = rect.width
        metrics.y = rect.y - offsetY
        nextLeft += rect.width + PREVIEW_SPACING
      })

      totalWidth.current = Math.max(nextLeft, 1)
    }

    const scheduleMeasure = () => {
      if (frame !== 0) {
        return
      }

      frame = window.requestAnimationFrame(measure)
    }

    const observer = new ResizeObserver(() => {
      scheduleMeasure()
    })

    previewRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node)
      }
    })
    scheduleMeasure()

    window.addEventListener('resize', scheduleMeasure)

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
      }

      observer.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [])

  useEffect(() => {
    if (!advanceMotion) {
      return
    }

    let previousAnimatorIn = 0

    const handleWheel = (event: WheelEvent) => {
      let delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX * 1.1
          : event.deltaY * 1.1

      if (navigator.userAgent.toLowerCase().includes('windows')) {
        delta *= 1.05
      }

      if (navigator.userAgent.toLowerCase().includes('firefox')) {
        delta *= event.deltaMode === 1 ? 30 : 1.11
      }

      wheelDeltaX.current = delta
    }

    const handlePointerDown = (event: PointerEvent) => {
      pointerDown.current = true
      lastPointerX.current = event.clientX
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerDown.current || lastPointerX.current === null) {
        return
      }

      const deltaX = event.clientX - lastPointerX.current
      dragDeltaX.current = deltaX
      lastPointerX.current = event.clientX
    }

    const handlePointerUp = () => {
      pointerDown.current = false
      lastPointerX.current = null
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        homeScrollXTarget.current -= window.innerWidth * 0.2
      }

      if (event.key === 'ArrowRight') {
        homeScrollXTarget.current += window.innerWidth * 0.2
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    window.addEventListener('keydown', handleKeyDown)
    gsap.set(velocityBonus.current, { value: 2 })
    gsap.to(velocityBonus.current, {
      delay: 2,
      duration: 0.4,
      value: 1,
    })
    previousAnimatorIn = window.innerWidth * 4
    gsap.set(animatorIn.current, { value: previousAnimatorIn })
    gsap.to(animatorIn.current, {
      duration: 4,
      ease: 'expo.out',
      onComplete() {
        homeVelocityBonus.current = 0
      },
      onUpdate() {
        homeVelocityBonus.current =
          (previousAnimatorIn - animatorIn.current.value) * 5
        previousAnimatorIn = animatorIn.current.value
      },
      value: 0,
    })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      window.removeEventListener('keydown', handleKeyDown)
      gsap.killTweensOf(velocityBonus.current)
      gsap.killTweensOf(animatorIn.current)
    }
  }, [])

  useFrame((_, delta) => {
    const settings = paneState.current
    const total = totalWidth.current
    const deltaMs = delta * 1000
    const isPortrait = size.height > size.width
    const isMobileLike =
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches

    fluid.update()

    if (advanceMotion && !isPortrait) {
      let dragMultiplier = isMobileLike ? 1.3 : 1

      if (isMobileLike && size.width > 700) {
        dragMultiplier = size.width > size.height ? 0.85 : 0.8
      }

      homeScrollXTarget.current += wheelDeltaX.current * 1.22 * deltaMs * 0.07

      if (pointerDown.current) {
        homeScrollXTarget.current +=
          -dragDeltaX.current * 2 * dragMultiplier * deltaMs * 0.08
      }

      wheelDeltaX.current = 0
      dragDeltaX.current = 0

      const fps = delta > 0 ? 1 / delta : 60
      const scrollLerp = fps <= 65 ? 0.12 : 0.07

      homeScrollX.current +=
        (homeScrollXTarget.current - homeScrollX.current) * scrollLerp
    }

    if (advanceMotion) {
      const rawVelocity =
        homeScrollXTarget.current -
        homeScrollX.current +
        homeVelocityBonus.current * 1.7

      velocity.current += (rawVelocity - velocity.current) * 0.2

      const targetVelocityFactor = pointerDown.current
        ? isMobileLike
          ? 3.2
          : 3
        : settings.velocityFactor + velocityBonus.current.value
      const velocityFactorLerp = pointerDown.current ? 0.2 : 0.05

      velocityFactor.current = THREE.MathUtils.lerp(
        velocityFactor.current,
        targetVelocityFactor,
        velocityFactorLerp,
      )

      velocity.current = THREE.MathUtils.clamp(
        velocity.current,
        -settings.scrollClamp,
        settings.scrollClamp,
      )
      shaderOffset.current += velocity.current * 1e-4
    }

    const wrappedScroll =
      homeScrollX.current - animatorIn.current.value + total * 200

    previewData.current.forEach((metrics, index) => {
      const tx =
        wrapPosition(metrics.baseLeft - wrappedScroll + total * 0.3, total) -
        total * 0.3
      const maxVisibleX = metrics.baseLeft + size.width

      metrics.progress = THREE.MathUtils.clamp(
        (maxVisibleX - tx) / (maxVisibleX + metrics.width),
        0,
        1,
      )
      metrics.tx = tx
      metrics.visible = tx >= -metrics.width && tx <= maxVisibleX
      metrics.lastTx = tx

      const node = previewRefs.current[index]

      if (node) {
        node.style.transform = `translate3d(${tx}px, -50%, 0)`
        node.style.visibility = metrics.visible ? '' : 'hidden'
      }
    })

    if (advanceMotion && !isPortrait) {
      const autoStep = 0.014 * deltaMs

      homeScrollX.current += autoStep
      homeScrollXTarget.current += autoStep
    }
  })

  return {
    previewData,
    shaderOffset,
    velocity,
    velocityFactor,
  }
}
