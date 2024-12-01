'use client'

import { useMemo, useRef, useState } from 'react'

import * as THREE from 'three'

import {
  PerspectiveCamera,
  RenderTexture,
  Text,
  useCursor,
  useGLTF,
  useTexture,
} from '@react-three/drei'
import {
  extend,
  useFrame,
  useThree,
  type MaterialNode,
  type Object3DNode,
} from '@react-three/fiber'
import {
  BallCollider,
  CuboidCollider,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from '@react-three/rapier'

import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

import type { GLTF } from 'three-stdlib'

extend({ MeshLineGeometry, MeshLineMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>
  }
}

type CardHolderGLTF = GLTF & {
  materials: unknown
  nodes: {
    card: THREE.Mesh
    holder: THREE.Mesh
    mask: THREE.Mesh
    ring: THREE.Mesh
    top: THREE.Mesh
  }
}

/**
 * The original article is here:
 * https://vercel.com/blog/building-an-interactive-3d-event-badge-with-react-three-fiber
 */

export default function Page() {
  // real mesh node
  const band = useRef<THREE.Mesh<MeshLineGeometry>>(null)

  // rigid bodies for physics simulation
  // Imagine a band with 4 joints, with the topmost joint fixed
  //   || fixed
  //   || joint1
  //   || joint2
  //   || joint3
  // ｜———｜ card
  // ｜___｜
  const fixed = useRef<RapierRigidBody>(null)
  const joint1 = useRef<RapierRigidBody>(null)
  const joint2 = useRef<RapierRigidBody>(null)
  const joint3 = useRef<RapierRigidBody>(null)

  const card = useRef<RapierRigidBody>(null)

  const [vec, ang, rot, dir] = useMemo(
    () => [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ],
    [],
  )

  const [dragStart, setDragStart] = useState<false | THREE.Vector3>(false)
  const [hover, setHover] = useState(false)

  useCursor(hover)

  const { height, width } = useThree((state) => state.size)

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
    [],
  )

  // bind joints between the joints using rope joints
  // [0, 0, 0] anchor point on joint1 in local space
  // [0, 0, 0] anchor point on joint2 in local space
  // 1 is the max length, when length is greater than 1 it will create a spring effect
  useRopeJoint(fixed, joint1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(joint1, joint2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(joint2, joint3, [[0, 0, 0], [0, 0, 0], 1])

  useSphericalJoint(joint3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ])

  useFrame((state) => {
    if (dragStart) {
      // convert the 2d pointer position to 3d position
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      // direction vector from camera position to pointer 3d position
      dir.copy(vec).sub(state.camera.position).normalize()
      // pointer's real 3d position in world space
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      // wake up the rigidBodies
      ;[card, joint1, joint2, joint3, fixed].forEach((ref) =>
        ref.current?.wakeUp(),
      )
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragStart.x,
        y: vec.y - dragStart.y,
        z: vec.z - dragStart.z,
      })
    }

    // sync the physic world joints position to the real world
    if (joint3.current && joint2.current && joint1.current && fixed.current) {
      curve.points[0].copy(joint3.current.translation())
      curve.points[1].copy(joint2.current.translation())
      curve.points[2].copy(joint1.current.translation())
      curve.points[3].copy(fixed.current.translation())
    }

    if (band.current) {
      band.current.geometry.setPoints(curve.getPoints(32))
    }

    if (card.current) {
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel(
        { x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z },
        false,
      )
    }
  })

  const [braidedTexture] = useTexture(['/4/braided.webp'], ([texture]) => {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
  })

  const { nodes } = useGLTF('/4/card.glb') as CardHolderGLTF

  const segmentProps = {
    angularDamping: 2,
    canSleep: true,
    colliders: false,
    linearDamping: 3,
    type: 'dynamic',
  } as const

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type='fixed' />
        <RigidBody ref={joint1} {...segmentProps} position={[0.5, 0, 0]}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={joint2} {...segmentProps} position={[1, 0, 0]}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={joint3} {...segmentProps} position={[1.5, 0, 0]}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          ref={card}
          {...segmentProps}
          position={[2, 0, 0]}
          type={dragStart ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            dispose={null}
            position={[-0.02, 0.55, -0.1]}
            rotation-x={Math.PI / 2}
            scale={23}
            onPointerDown={(event) => {
              if (card.current) {
                // @ts-expect-error I don't know the correct type
                event.target.setPointerCapture(event.pointerId)
                event.stopPropagation()

                const dargStartPosition = event.point
                  .clone()
                  .sub(card.current.translation())

                setDragStart(dargStartPosition)
              }
            }}
            onPointerEnter={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            onPointerUp={(event) => {
              setDragStart(false)
              // @ts-expect-error I don't know the correct type
              event.target.releasePointerCapture(event.pointerId)
            }}
          >
            <group position={[0, 0, 0.031]}>
              <mesh
                geometry={nodes.card.geometry}
                position={[0.001, 0.003, -0.008]}
                scale={[6.9, 6.772, 10.543]}
              >
                <meshStandardMaterial>
                  <RenderTexture attach='map'>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <color args={['black']} attach='background' />
                    <group
                      position={[0, 0, 0]}
                      rotation-y={Math.PI}
                      rotation-z={Math.PI}
                      scale={[0.3, 0.15, 0.3]}
                    >
                      <Text fontSize={2} fontWeight={700} position-y={-1}>
                        ZHANGYU
                      </Text>
                      <Text fontWeight={600} position-y={-3}>
                        @zhangyu1818
                      </Text>
                    </group>
                  </RenderTexture>
                </meshStandardMaterial>
              </mesh>
              <mesh
                geometry={nodes.holder.geometry}
                position={[0.001, 0.003, -0.008]}
                scale={[6.9, 6.772, 10.543]}
              >
                <meshStandardMaterial
                  color='#222'
                  metalness={0.2}
                  roughness={0.8}
                />
              </mesh>
              <mesh
                geometry={nodes.mask.geometry}
                position={[0.001, 0.004, -0.008]}
                scale={[6.9, 6.772, 10.543]}
              >
                <meshPhysicalMaterial
                  transparent
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  envMapIntensity={1.5}
                  metalness={1}
                  opacity={0.1}
                  reflectivity={0.9}
                  roughness={0.1}
                />
              </mesh>
              <mesh
                geometry={nodes.ring.geometry}
                position={[0.001, 0.0048, -0.064]}
                rotation={[-0.192, 0, 0]}
                scale={[1.253, 1.006, 1.03]}
              >
                <meshStandardMaterial
                  color='#666'
                  envMapIntensity={1.2}
                  metalness={0.6}
                  roughness={0.3}
                />
              </mesh>
              <mesh
                geometry={nodes.top.geometry}
                position={[0.001, 0.004, -0.008]}
              >
                <meshStandardMaterial
                  color='#333'
                  metalness={0.3}
                  roughness={0.7}
                />
              </mesh>
            </group>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color='#454545'
          depthTest={false}
          lineWidth={1}
          map={braidedTexture}
          // @ts-expect-error type error
          repeat={[15, 1]}
          // @ts-expect-error type error
          resolution={[width, height]}
          useMap={1}
        />
      </mesh>
    </>
  )
}

useGLTF.preload('/4/card.glb')
