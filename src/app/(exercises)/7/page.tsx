'use client'

import { useMemo, useRef } from 'react'

import * as THREE from 'three'

import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

import { useControls } from 'leva'

import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

/**
 * Learn from https://threejs-journey.com/lessons/shaders#
 */
export default function Page() {
  const material = useRef<THREE.RawShaderMaterial>(null)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { frequencyX, frequencyY } = useControls({
    frequencyX: {
      max: 500,
      min: 0,
      step: 1,
      value: 10,
      onChange(value) {
        material.current!.uniforms.frequency.value.x = value
      },
    },
    frequencyY: {
      max: 500,
      min: 0,
      step: 1,
      value: 5,
      onChange(value) {
        material.current!.uniforms.frequency.value.y = value
      },
    },
  })

  const defaultFrequency = useMemo(
    () => new THREE.Vector2(frequencyX, frequencyY),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    material.current!.uniforms.time.value = time
  })

  const [texture] = useTexture(['4/avatar.jpeg'])

  return (
    <mesh>
      <planeGeometry args={[1, 0.5, 64, 64]} />
      <rawShaderMaterial
        ref={material}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
        uniforms={{
          frequency: { value: defaultFrequency },
          texture: { value: texture },
          time: { value: 0 },
        }}
        vertexShader={vertexShader}
      />
    </mesh>
  )
}
