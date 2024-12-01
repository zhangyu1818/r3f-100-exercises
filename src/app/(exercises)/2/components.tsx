import { useRef, useState } from 'react'

import * as THREE from 'three'

import { Image, useScroll, type ImageProps } from '@react-three/drei'
import { useFrame, type GroupProps } from '@react-three/fiber'

import { animated, useSpring } from '@react-spring/three'

export const Rotate = (props: GroupProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const scroll = useScroll()

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = -scroll.offset * Math.PI * 2
    state.events.update?.()
  })
  return <group ref={groupRef} {...props} />
}

const AnimatedImage = animated(Image)

export const Card = (props: ImageProps) => {
  const [hovered, setHovered] = useState(false)

  const { radius, scale, zoom } = useSpring({
    radius: hovered ? 0.2 : 0.1,
    scale: hovered ? 1.2 : 1,
    zoom: hovered ? 1.2 : 1,
  })

  return (
    <AnimatedImage
      transparent
      material-radius={radius}
      material-zoom={zoom}
      scale={scale}
      side={THREE.DoubleSide}
      onPointerEnter={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerLeave={(e) => {
        e.stopPropagation()
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
      {...props}
    >
      <bentPlaneGeometry args={[0.1, 1.1, 1.1, 16, 16]} />
    </AnimatedImage>
  )
}

interface CarouselProps {
  radius: number
}

export const Carousel = (props: CarouselProps) => {
  const { radius } = props

  const images = Array.from({ length: 10 }).map(
    (_, index) => `/2/images/${index + 1}.jpg`,
  )
  return images.map((url, index) => (
    <Card
      // eslint-disable-next-line react/no-array-index-key
      key={index}
      position={[
        Math.sin((index / 10) * Math.PI * 2) * radius,
        0,
        Math.cos((index / 10) * Math.PI * 2) * radius,
      ]}
      rotation={[0, Math.PI + (index / 10) * Math.PI * 2, 0]}
      url={url}
    />
  ))
}
