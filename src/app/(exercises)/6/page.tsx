'use client'

import { useMemo, useRef } from 'react'

import * as THREE from 'three'

import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  euler,
  InstancedRigidBodies,
  quat,
  RigidBody,
  type InstancedRigidBodyProps,
  type RapierRigidBody,
} from '@react-three/rapier'

import { nanoid } from 'nanoid'

const COUNT = 200

const getRandomPosition = () => {
  const angle = Math.random() * 2 * Math.PI
  const r = 3
  const x = r * Math.cos(angle)
  const z = r * Math.sin(angle)
  return [x, Math.random() * 15, z] as const
}

const reInitialBody = (body: RapierRigidBody) => {
  const [x, y, z] = getRandomPosition()
  body.setTranslation({ x, y, z }, false)
  body.setRotation(
    {
      w: Math.random(),
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
    },
    false,
  )
  body.applyImpulse({ x: 0, y: -20, z: 0 }, true)
}

/**
 * Ins by https://cannon.pmnd.rs/#/demo/CubeHeap
 */
export default function Page() {
  const rigidBodies = useRef<RapierRigidBody[]>(null)
  const planeBody = useRef<RapierRigidBody>(null)

  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = []

    for (let i = 0; i < COUNT; i++) {
      const [x, , z] = getRandomPosition()
      const yLevel = Math.floor(i / 3) * 3 + 10
      instances.push({
        key: nanoid(),
        position: [x, yLevel, z],
        rotation: [Math.random(), Math.random(), Math.random()],
      })
    }

    return instances
  }, [])

  const colors = useMemo(() => {
    const array = new Float32Array(COUNT * 3)
    const color = new THREE.Color()
    for (let i = 0; i < COUNT; i++)
      color
        .set(
          [0xffb6c1, 0xffc0cb, 0xdda0dd, 0xd8bfd8, 0xe6e6fa, 0xf8b3d9][
            Math.floor(Math.random() * 6)
          ],
        )
        .convertSRGBToLinear()
        .toArray(array, i * 3)
    return array
  }, [])

  useFrame((state) => {
    const xRotation = -Math.PI / 2 - state.pointer.y * 0.2
    const yRotation = state.pointer.x * 0.2

    if (planeBody.current) {
      const { x, y } = euler().setFromQuaternion(
        quat(planeBody.current.rotation()),
      )

      const targetX = THREE.MathUtils.lerp(x, xRotation, 0.1)
      const targetY = THREE.MathUtils.lerp(y, yRotation, 0.1)

      planeBody.current.setRotation(
        quat().setFromEuler(new THREE.Euler(targetX, targetY, 0)),
        false,
      )
    }

    rigidBodies.current?.forEach((body) => {
      const isSleeping = body.isSleeping()
      const isInvisible = body.translation().y < -10

      if (isSleeping || isInvisible) {
        reInitialBody(body)
      }
    })
  })

  return (
    <>
      <InstancedRigidBodies
        ref={rigidBodies}
        colliders='cuboid'
        instances={instances}
      >
        <instancedMesh
          castShadow
          receiveShadow
          // eslint-disable-next-line no-sparse-arrays
          args={[, , COUNT]}
          count={COUNT}
        >
          <boxGeometry>
            <instancedBufferAttribute
              args={[colors, 3]}
              attach='attributes-color'
            />
          </boxGeometry>
          <meshStandardMaterial vertexColors />
        </instancedMesh>
      </InstancedRigidBodies>
      <RigidBody ref={planeBody} rotation-x={-Math.PI / 2} type='fixed'>
        <RoundedBox receiveShadow args={[10, 10, 0.2]} radius={0.1}>
          <meshStandardMaterial color='lightpink' metalness={0} roughness={1} />
        </RoundedBox>
      </RigidBody>
    </>
  )
}
