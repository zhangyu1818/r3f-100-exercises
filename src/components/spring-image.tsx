'use client'

import type { ReactNode } from 'react'

import type * as THREE from 'three'

import { Image } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'

export interface SpringImageProps {
  children?: ReactNode
  grayscale?: number
  opacity?: number
  radius?: number
  scale?: number | [number, number]
  side?: THREE.Side
  toneMapped?: boolean
  transparent?: boolean
  url: string
  zoom?: number
  onPointerEnter?: (event: ThreeEvent<PointerEvent>) => void
  onPointerLeave?: (event: ThreeEvent<PointerEvent>) => void
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void
  position?: [number, number, number]
  rotation?: [number, number, number]
  'material-opacity'?: number
  'material-radius'?: number
  'material-zoom'?: number
  'position-x'?: number
  'position-y'?: number
  'position-z'?: number
  'rotation-x'?: number
  'rotation-y'?: number
  'rotation-z'?: number
}

export function SpringImage(props: SpringImageProps) {
  const {
    opacity,
    radius,
    zoom,
    'material-opacity': materialOpacity,
    'material-radius': materialRadius,
    'material-zoom': materialZoom,
    ...restProps
  } = props

  return (
    <Image
      {...restProps}
      opacity={materialOpacity ?? opacity}
      radius={materialRadius ?? radius}
      zoom={materialZoom ?? zoom}
    />
  )
}
