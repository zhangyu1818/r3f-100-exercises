import type { Dispatch, RefObject, SetStateAction } from 'react'

import type * as THREE from 'three'

import {
  Image,
  PerspectiveCamera,
  RenderTexture,
  Text,
} from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'

import type { CardHolderGLTF } from './types'

interface BadgeCardProps {
  card: RefObject<RapierRigidBody>
  nodes: CardHolderGLTF['nodes']
  setDragStart: Dispatch<SetStateAction<false | THREE.Vector3>>
  setHover: Dispatch<SetStateAction<boolean>>
}

type PointerCaptureTarget = EventTarget & {
  releasePointerCapture: (pointerId: number) => void
  setPointerCapture: (pointerId: number) => void
}

export function BadgeCard(props: BadgeCardProps) {
  const { card, nodes, setDragStart, setHover } = props

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    const target = event.target

    if (!target) {
      return
    }

    ;(target as PointerCaptureTarget).setPointerCapture(event.pointerId)
    event.stopPropagation()

    const dragStartPosition = event.point
      .clone()
      .sub(card.current.translation())
    setDragStart(dragStartPosition)
  }

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    const target = event.target

    setDragStart(false)

    if (!target) {
      return
    }

    ;(target as PointerCaptureTarget).releasePointerCapture(event.pointerId)
  }

  return (
    <group
      dispose={null}
      position={[-0.02, 0.55, -0.1]}
      rotation-x={Math.PI / 2}
      onPointerDown={handlePointerDown}
      onPointerEnter={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onPointerUp={handlePointerUp}
    >
      <group position={[0.015, 0, 0.1]}>
        <mesh geometry={nodes.top.geometry}>
          <meshStandardMaterial
            color="#3A1800"
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
        <mesh geometry={nodes.ring.geometry}>
          <meshStandardMaterial
            color="#2C2C2C"
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>
        <mesh geometry={nodes.holder.geometry}>
          <meshStandardMaterial
            color="#4A2000"
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
        <mesh geometry={nodes.card.geometry}>
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh geometry={nodes.content.geometry}>
          <meshPhysicalMaterial
            clearcoat={0.7}
            clearcoatRoughness={0.1}
            ior={1.49}
            metalness={0}
            roughness={1}
          >
            <RenderTexture attach="map">
              <PerspectiveCamera makeDefault position={[0, 0, 15]} />
              <color args={['#000']} attach="background" />
              <group
                position={[0, 0, 0]}
                rotation-y={Math.PI}
                rotation-z={Math.PI}
                scale-y={0.78}
              >
                <Image
                  transparent
                  position={[0, 4, 0]}
                  radius={2}
                  rotation-y={Math.PI}
                  rotation-z={Math.PI * 2}
                  scale={4}
                  url="/4/avatar.jpeg"
                />
                <Text
                  color="#a3a3a3"
                  fontSize={2}
                  fontWeight={700}
                  position-y={-1}
                >
                  ZHANGYU
                </Text>
                <Text color="#999" fontWeight={600} position-y={-3}>
                  @zhangyu1818
                </Text>
              </group>
            </RenderTexture>
          </meshPhysicalMaterial>
        </mesh>
      </group>
      <color args={['black']} attach="background" />
    </group>
  )
}
