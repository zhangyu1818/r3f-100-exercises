'use client'

import { startTransition, useMemo, useRef, useState } from 'react'

import * as THREE from 'three'

import {
  Image,
  Text,
  useCursor,
  useScroll,
  type ImageProps,
} from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

import { animated, useSpring } from '@react-spring/three'
import { chunk, shuffle } from 'lodash-es'
import { nanoid } from 'nanoid'

interface ImageData {
  id: string
  url: string
}

const AnimatedImage = animated(Image)
const AnimatedText = animated(Text)

const imageChunks = chunk(
  shuffle(
    Array.from({ length: 120 }, (_, i) => ({
      id: nanoid(),
      url: `/2/images/${(i % 10) + 1}.jpg`,
    })),
  ),
  15,
) as ImageData[][]

const groupGap = 12 * (Math.PI / 180)
const totalGroups = imageChunks.length
const effectiveAnglePerGroup =
  (2 * Math.PI - groupGap * totalGroups) / totalGroups

/**
 * Inspired by https://codesandbox.io/p/sandbox/dc5fjy
 */

export default function Page() {
  const groupRef = useRef<THREE.Group>(null)
  const scroll = useScroll()
  const [hoverImage, setHoverImage] = useState<ImageData | null>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -scroll.offset * Math.PI * 2
    }
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      state.pointer.y * 3 + 5,
      0.3,
    )
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      -state.pointer.x * 4,
      0.3,
    )
    state.camera.lookAt(0, 0, 0)
    state.events.update?.()
  })

  const content = useMemo(
    () =>
      imageChunks.map((images, groupIndex) => {
        const startAngle = groupIndex * (effectiveAnglePerGroup + groupGap)
        return (
          <ImageGroup
            // eslint-disable-next-line react/no-array-index-key
            key={groupIndex}
            groupIndex={groupIndex}
            images={images}
            startAngle={startAngle}
            onHover={setHoverImage}
          />
        )
      }),
    [],
  )

  return (
    <>
      <group ref={groupRef} position={[0, -2, 0]}>
        {content}
      </group>
      <HoveredImage image={hoverImage} />
    </>
  )
}

interface ImageGroupProps {
  groupIndex: number
  images: ImageData[]
  onHover: (image: ImageData | null) => void
  startAngle: number
}

function ImageGroup(props: ImageGroupProps) {
  const { groupIndex, images, onHover, startAngle } = props
  const [hovered, setHovered] = useState<ImageData | null>(null)

  const content = useMemo(
    () =>
      images.map((image, imageIndex) => {
        const distance = 12
        const angle =
          startAngle + (imageIndex * effectiveAnglePerGroup) / images.length
        const x = Math.cos(angle) * distance
        const z = Math.sin(angle) * distance

        return (
          <ImageCard
            key={image.id}
            transparent
            active={hovered?.id === image.id}
            hovered={!!hovered}
            position-x={x}
            position-z={z}
            rotation-y={-angle}
            side={THREE.DoubleSide}
            url={image.url}
            onPointerEnter={(e) => {
              startTransition(() => {
                setHovered(image)
                onHover(image)
                e.stopPropagation()
              })
            }}
            onPointerOut={() => {
              startTransition(() => {
                setHovered(null)
                onHover(null)
              })
            }}
          />
        )
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hovered?.id],
  )

  return (
    <group key={groupIndex} position-y={groupIndex * 0.4}>
      {content}
    </group>
  )
}

type ImageCardProps = ImageProps & {
  active: boolean
  hovered: boolean
}

const defaultScale = [5.3, 3]

function ImageCard(props: ImageCardProps) {
  const { active, hovered, ...restProps } = props

  const imageRef = useRef<THREE.Mesh>(null)

  const [defaultScaleX, defaultScaleY] = defaultScale

  const { positionY, scaleX, scaleY } = useSpring({
    positionY: active ? 1.5 : 0,
    scaleX: active
      ? 1.3 * defaultScaleX
      : hovered
        ? 1.2 * defaultScaleX
        : defaultScaleX,
    scaleY: active
      ? 1.3 * defaultScaleY
      : hovered
        ? 1.2 * defaultScaleY
        : defaultScaleY,
  })

  return (
    <AnimatedImage
      ref={imageRef}
      {...restProps}
      position-y={positionY}
      radius={0.1}
      scale-x={scaleX}
      scale-y={scaleY}
      side={THREE.DoubleSide}
    />
  )
}

interface HoveredImageProps {
  image: ImageData | null
}

function HoveredImage(props: HoveredImageProps) {
  const { image } = props

  const { opacity, zoom } = useSpring({
    opacity: image ? 1 : 0,
    zoom: image ? 1.2 : 1,
  })

  useCursor(!!image)

  const renderImage = image ?? imageChunks[0][0]

  return (
    <group position-y={3.5}>
      <AnimatedImage
        transparent
        material-opacity={opacity}
        material-zoom={zoom}
        radius={0.5}
        scale={[7.2, 12.8]}
        url={renderImage.url}
      />
      <AnimatedText material-opacity={opacity} position-z={1} scale={zoom}>
        {renderImage.id}
      </AnimatedText>
    </group>
  )
}
