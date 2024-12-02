'use client'

import { useState } from 'react'

import * as THREE from 'three'

import { Reflector, Text, useTexture, useVideoTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

/**
 * Inspired by https://codesandbox.io/p/sandbox/bfplr
 */
export default function Page() {
  const [vec] = useState(() => new THREE.Vector3())

  const [displacement, normal, roughness] = useTexture([
    '/3/Muddy Ground_Displacement.jpg',
    '/3/Muddy Ground_Normal.jpg',
    '/3/Muddy Ground_Roughness.jpg',
  ])

  const video = useVideoTexture('/3/video.mp4', {
    loop: true,
    muted: true,
  })

  useFrame((state) => {
    state.camera.position.lerp(
      vec.set(state.pointer.x * 5, 3 + state.pointer.y * 2, 14),
      0.1,
    )
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <group position-y={-0.5}>
      <Reflector
        args={[20, 20]}
        blur={[400, 100]}
        mirror={0.5}
        mixBlur={6}
        mixStrength={1.5}
        resolution={512}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      >
        {(Material, props) => (
          <Material
            color='#a0a0a0'
            displacementMap={displacement}
            metalness={0.4}
            normalMap={normal}
            roughnessMap={roughness}
            {...props}
          />
        )}
      </Reflector>
      <Text fontSize={3} fontWeight={900} position={[0, 1.2, -2]}>
        R3F100
        <meshStandardMaterial
          emissive='white'
          emissiveIntensity={4}
          emissiveMap={video}
          toneMapped={false}
        />
      </Text>
    </group>
  )
}
