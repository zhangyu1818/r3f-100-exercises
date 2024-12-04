'use client'

import { useEffect, useMemo, useRef } from 'react'

import * as THREE from 'three'

import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

import { Pane } from 'tweakpane'

import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

/**
 * Learn from https://threejs-journey.com/lessons/shaders#
 */
export default function Page() {
  const material = useRef<THREE.RawShaderMaterial>(null)

  const frequency = useMemo(() => new THREE.Vector2(10, 5), [])

  useEffect(() => {
    const pane = new Pane()
    pane.addBinding(material.current!.uniforms.frequency, 'value', {
      label: 'Frequency',
    })
  }, [])

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
          frequency: { value: frequency },
          texture: { value: texture },
          time: { value: 0 },
        }}
        vertexShader={vertexShader}
      />
    </mesh>
  )
}
