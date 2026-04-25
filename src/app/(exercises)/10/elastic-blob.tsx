'use client'

import { useEffect, useRef, useState } from 'react'

import * as THREE from 'three'

import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame, type ThreeElement } from '@react-three/fiber'

import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

const SPRING_COEF = 0.65
const SPRING_LERP = 0.14
const PULL_COEF = -0.4

const BlobMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#111111'),
    uRadius: 0.5,
  },
  vertexShader,
  fragmentShader,
)

extend({ BlobMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    blobMaterial: ThreeElement<typeof BlobMaterial>
  }
}

interface ElasticBlobProps {
  size: number
  color?: string
  position?: [number, number, number]
}

export function ElasticBlob({
  size,
  color = '#111111',
  position = [0, 0, 0],
}: ElasticBlobProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const hasMoved = useRef(false)

  const segments = Math.min(32, Math.max(12, Math.ceil(size * 10)))
  const range = size * 0.3

  const [{ geometry, springs, offsetAttr }] = useState(() => {
    const geom = new THREE.PlaneGeometry(size, size, segments, segments)
    const count = geom.attributes.position.count
    const offset = new THREE.BufferAttribute(new Float32Array(count * 2), 2)
    offset.setUsage(THREE.DynamicDrawUsage)
    geom.setAttribute('offset', offset)
    return {
      geometry: geom,
      offsetAttr: offset,
      springs: new Float32Array(count * 2),
    }
  })

  useEffect(() => {
    const onMove = () => {
      hasMoved.current = true
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      geometry.dispose()
    }
  }, [])

  useFrame((state) => {
    const positions = geometry.attributes.position.array as Float32Array
    const offsets = offsetAttr.array as Float32Array
    const count = geometry.attributes.position.count

    let mouseX = 1e6
    let mouseY = 1e6
    if (hasMoved.current) {
      mouseX = state.pointer.x * (state.viewport.width / 2)
      mouseY = state.pointer.y * (state.viewport.height / 2)
    }

    const meshX = meshRef.current.position.x
    const meshY = meshRef.current.position.y

    let dirty = false
    for (let i = 0; i < count; i++) {
      const px = positions[i * 3] + meshX
      const py = positions[i * 3 + 1] + meshY

      const dx = px - mouseX
      const dy = py - mouseY
      const d = Math.hypot(dx, dy)

      let tx = 0
      let ty = 0
      if (d < range) {
        const k = 1 - d / range
        tx = dx * PULL_COEF * k
        ty = dy * PULL_COEF * k
      }

      const curOx = offsets[i * 2]
      const curOy = offsets[i * 2 + 1]
      const vx = springs[i * 2]
      const vy = springs[i * 2 + 1]

      const newVx = vx + ((tx - curOx) * SPRING_COEF - vx) * SPRING_LERP
      const newVy = vy + ((ty - curOy) * SPRING_COEF - vy) * SPRING_LERP

      springs[i * 2] = newVx
      springs[i * 2 + 1] = newVy

      offsets[i * 2] = curOx + newVx
      offsets[i * 2 + 1] = curOy + newVy

      if (Math.abs(newVx) > 1e-5 || Math.abs(newVy) > 1e-5) {
        dirty = true
      }
    }

    if (dirty) {
      offsetAttr.needsUpdate = true
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={position}>
      <blobMaterial
        key={BlobMaterial.key}
        transparent
        uColor={new THREE.Color(color)}
        uRadius={0.5}
      />
    </mesh>
  )
}
