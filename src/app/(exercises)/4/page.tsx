'use client'

import { useRef, useState, type RefObject } from 'react'

import * as THREE from 'three'

import { useCursor, useGLTF, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BallCollider,
  CuboidCollider,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from '@react-three/rapier'

import { BadgeCard } from './badge-card'

import type { MeshLineGeometry } from 'meshline'

import type { CardHolderGLTF } from './types'

import './meshline'

export default function Page() {
  const band = useRef<THREE.Mesh<MeshLineGeometry>>(null)
  const fixed = useRef<RapierRigidBody>(null)
  const joint1 = useRef<RapierRigidBody>(null)
  const joint2 = useRef<RapierRigidBody>(null)
  const joint3 = useRef<RapierRigidBody>(null)
  const card = useRef<RapierRigidBody>(null)

  const fixedJointRef = fixed as RefObject<RapierRigidBody>
  const joint1Ref = joint1 as RefObject<RapierRigidBody>
  const joint2Ref = joint2 as RefObject<RapierRigidBody>
  const joint3Ref = joint3 as RefObject<RapierRigidBody>
  const cardRef = card as RefObject<RapierRigidBody>
  const vectorsRef = useRef<
    [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3] | null
  >(null)
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null)

  if (!vectorsRef.current) {
    vectorsRef.current = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]
  }

  if (!curveRef.current) {
    curveRef.current = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ])
  }

  const [vec, ang, rot, dir] = vectorsRef.current
  const curve = curveRef.current
  const [dragStart, setDragStart] = useState<false | THREE.Vector3>(false)
  const [hover, setHover] = useState(false)
  const { height, width } = useThree((state) => state.size)

  useCursor(hover)
  useRopeJoint(fixedJointRef, joint1Ref, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(joint1Ref, joint2Ref, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(joint2Ref, joint3Ref, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(joint3Ref, cardRef, [
    [0, 0, 0],
    [0, 1.45, 0],
  ])

  useFrame((state) => {
    if (dragStart) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, joint1, joint2, joint3, fixed].forEach((ref) =>
        ref.current?.wakeUp(),
      )
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragStart.x,
        y: vec.y - dragStart.y,
        z: vec.z - dragStart.z,
      })
    }

    if (joint3.current && joint2.current && joint1.current && fixed.current) {
      curve.points[0].copy(joint3.current.translation())
      curve.points[1].copy(joint2.current.translation())
      curve.points[2].copy(joint1.current.translation())
      curve.points[3].copy(fixed.current.translation())
    }

    band.current?.geometry.setPoints(curve.getPoints(32))

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
  const { nodes } = useGLTF('/4/card.glb') as unknown as CardHolderGLTF

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
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
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
          <BadgeCard
            card={cardRef}
            nodes={nodes}
            setDragStart={setDragStart}
            setHover={setHover}
          />
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[{ resolution: new THREE.Vector2(width, height) }]}
          color="#565656"
          depthTest={false}
          lineWidth={1}
          map={braidedTexture}
          repeat={[15, 1]}
          resolution={[width, height]}
          useMap={1}
        />
      </mesh>
    </>
  )
}

useGLTF.preload('/4/card.glb')
