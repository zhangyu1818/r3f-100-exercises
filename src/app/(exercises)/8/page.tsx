'use client'

import { startTransition, useEffect, useRef, useState } from 'react'

import * as THREE from 'three'

import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame, type MaterialNode } from '@react-three/fiber'

import { Pane } from 'tweakpane'

import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

const WaveShaderMaterial = shaderMaterial(
  {
    uElevation: 0.2,
    uFrequency: new THREE.Vector2(4, 1.5),
    uSpeed: 0.75,
    uTime: 0,

    uWaveElevation: 0.15,
    uWaveFrequency: 3.0,
    uWaveIterations: 4,
    uWaveSpeed: 0.2,

    uDepthColor: new THREE.Color(0.102, 0.239, 0.427),
    uSurfaceColor: new THREE.Color(0.31, 0.757, 0.71),

    uColorMultiplier: 5,
    uColorOffset: 0.08,
  },
  vertexShader,
  fragmentShader,
)

extend({ WaveShaderMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    waveShaderMaterial: MaterialNode<
      THREE.ShaderMaterial,
      typeof WaveShaderMaterial
    >
  }
}

/*
 * https://threejs-journey.com/lessons/raging-sea
 */
export default function Page() {
  const material = useRef<THREE.ShaderMaterial>(null)

  const [segments, setSegments] = useState(256)

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime()
    material.current!.uniforms.uTime.value = elapsedTime
  })

  useEffect(() => {
    const pane = new Pane()
    pane.addBinding(material.current!.uniforms.uElevation, 'value', {
      label: 'Elevation',
      max: 1,
      min: 0,
    })

    pane.addBinding(material.current!.uniforms.uFrequency, 'value', {
      label: 'Frequency',
      max: 10,
      min: 0,
    })

    pane.addBinding(material.current!.uniforms.uSpeed, 'value', {
      label: 'Speed',
      max: 10,
      min: 0,
    })

    pane.addBinding(material.current!.uniforms.uDepthColor, 'value', {
      color: { type: 'float' },
      label: 'Depth',
    })

    pane.addBinding(material.current!.uniforms.uSurfaceColor, 'value', {
      color: { type: 'float' },
      label: 'Surface',
    })

    pane.addBinding(material.current!.uniforms.uColorMultiplier, 'value', {
      label: 'Color Multiplier',
      max: 10,
      min: 0,
    })

    pane.addBinding(material.current!.uniforms.uColorOffset, 'value', {
      label: 'Color Offset',
      max: 1,
      min: 0,
    })

    pane.addBinding(material.current!.uniforms.uWaveElevation, 'value', {
      label: 'Wave Elevation',
      max: 1,
      min: 0,
    })

    pane.addBinding(material.current!.uniforms.uWaveFrequency, 'value', {
      label: 'Wave Frequency',
      max: 10,
      min: 0,
    })

    pane.addBinding(material.current!.uniforms.uWaveIterations, 'value', {
      label: 'Wave Iterations',
      max: 10,
      min: 0,
    })

    pane.addBinding(material.current!.uniforms.uWaveSpeed, 'value', {
      label: 'Wave Speed',
      max: 1,
      min: 0,
    })

    pane
      .addBinding({ segments }, 'segments', {
        label: 'Segments',
        max: 1024,
        min: 1,
        step: 2,
      })
      .on('change', ({ value }) => {
        startTransition(() => {
          setSegments(value)
        })
      })

    pane.addBinding(material.current!, 'wireframe', {
      label: 'Wireframe',
    })

    return () => {
      pane.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <mesh rotation-x={-Math.PI / 2}>
      <planeGeometry args={[2, 2, segments, segments]} />
      <waveShaderMaterial key={WaveShaderMaterial.key} ref={material} />
    </mesh>
  )
}
