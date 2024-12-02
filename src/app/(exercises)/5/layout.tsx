'use client'

import { ScrollControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { Perf } from 'r3f-perf'

import { DefaultLayout } from '@/components/layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout
      date='2024年12月2日'
      message='Scroll Up & Down'
      sourceCodeCount={5}
    >
      <Canvas camera={{ fov: 45, position: [0, 5, 30] }}>
        <Perf />
        <ScrollControls infinite pages={5}>
          {children}
        </ScrollControls>
      </Canvas>
    </DefaultLayout>
  )
}
