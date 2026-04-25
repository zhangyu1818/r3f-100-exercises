import { useEffect, useRef } from 'react'

import type * as THREE from 'three'

import { useFrame, useThree } from '@react-three/fiber'

import { gsap } from 'gsap'

import { PREVIEW_LAYOUTS } from '../constants'
import { getProjectedPlane } from '../utils'
import {
  createGLSLStretchWaveMaterial,
  type GLSLStretchWaveMaterialInstance,
} from './glsl-material'

import type { GLSLWorkPlaneProps } from './glsl-types'

export function GLSLWorkPlane(props: GLSLWorkPlaneProps) {
  const {
    fluid,
    frostTexture,
    hoveredPreview,
    index,
    paneState,
    previewData,
    sharedMotion,
    texture,
  } = props
  const materialRef = useRef<GLSLStretchWaveMaterialInstance | null>(null)

  if (materialRef.current === null) {
    materialRef.current = createGLSLStretchWaveMaterial({ texture })
  }

  const material = materialRef.current
  const mesh = useRef<THREE.Mesh>(null)
  const hoverDelay = useRef<number | null>(null)
  const isHovered = useRef(false)
  const { camera, gl, size } = useThree()
  const image = texture.image as { height: number; width: number }
  const radius = PREVIEW_LAYOUTS[index]?.format === 'rectangle' ? 0.04 : 0.05

  const clearHoverDelay = () => {
    if (hoverDelay.current === null) {
      return
    }

    clearTimeout(hoverDelay.current)
    hoverDelay.current = null
  }

  const hoverIn = () => {
    clearHoverDelay()

    hoverDelay.current = window.setTimeout(() => {
      gsap.killTweensOf(material.uniforms.uHover)
      gsap.to(material.uniforms.uHover, {
        delay: 0,
        duration: paneState.current.hoverDuration,
        ease: 'cubic.out',
        value: 1,
      })
      hoverDelay.current = null
    }, paneState.current.hoverDelay)
  }

  const hoverOut = () => {
    clearHoverDelay()

    gsap.killTweensOf(material.uniforms.uHover)
    gsap.to(material.uniforms.uHover, {
      duration: paneState.current.hoverDuration,
      ease: 'cubic.in',
      value: 0,
    })
  }

  useEffect(() => {
    window.addEventListener('blur', hoverOut)

    return () => {
      clearHoverDelay()
      window.removeEventListener('blur', hoverOut)

      gsap.killTweensOf(material.uniforms.uHover)
      material.dispose()
    }
  }, [])

  useFrame((state) => {
    const metrics = previewData.current[index]

    if (!mesh.current) {
      return
    }

    const projectedPlane = getProjectedPlane(
      camera as THREE.PerspectiveCamera,
      size.width / size.height,
    )
    const scaleX = (metrics.width / size.width) * projectedPlane.width
    const scaleY = (metrics.height / size.height) * projectedPlane.height
    const settings = paneState.current
    const nextHovered = hoveredPreview.current === index

    if (nextHovered !== isHovered.current) {
      isHovered.current = nextHovered

      if (nextHovered) {
        hoverIn()
      } else {
        hoverOut()
      }
    }

    mesh.current.visible = metrics.visible
    mesh.current.scale.set(scaleX, scaleY, 1)
    mesh.current.position.x =
      (metrics.tx / size.width) * projectedPlane.width -
      projectedPlane.width / 2 +
      scaleX / 2
    mesh.current.position.y =
      (-metrics.y / size.height) * projectedPlane.height +
      projectedPlane.height / 2 -
      scaleY / 2

    material.uniforms.uDisplacement.value = settings.displacement
    material.uniforms.uFrost.value = frostTexture
    material.uniforms.uFrostAmount.value = settings.frostAmount
    material.uniforms.uFluid.value = settings.fluid
    material.uniforms.uFluidLine.value = settings.fluidLine
    material.uniforms.uHoverTime.value = sharedMotion.shaderOffset.current
    material.uniforms.uIndex.value = index
    material.uniforms.uLines.value = settings.lines
    material.uniforms.uMapSize.value.set(image.width, image.height)
    material.uniforms.uMobile.value =
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
        ? 1
        : 0
    material.uniforms.uOffset.value = sharedMotion.shaderOffset.current
    material.uniforms.uPortrait.value = size.height > size.width ? 1 : 0
    material.uniforms.uRadius.value = radius
    material.uniforms.uResolution.value.set(
      size.width * gl.getPixelRatio(),
      size.height * gl.getPixelRatio(),
    )
    material.uniforms.uScale.value.set(scaleX, scaleY)
    material.uniforms.tFluid.value = fluid.texture
    material.uniforms.uTime.value = state.clock.getElapsedTime()
    material.uniforms.uVelocity.value = sharedMotion.velocity.current
    material.uniforms.uVelocityFactor.value =
      sharedMotion.velocityFactor.current
    material.uniforms.uViewport.value = metrics.progress
  })

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1, 1, 20, 5]} />
      <primitive attach="material" object={material} />
    </mesh>
  )
}
