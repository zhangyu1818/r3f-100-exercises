'use client'

import { ScrollControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { DefaultLayout } from '@/components/layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout date='2024年12月1日' message='Scroll Up & Down'>
      <Canvas camera={{ fov: 15, position: [0, 0, 15] }}>
        <ScrollControls infinite pages={5}>
          {children}
        </ScrollControls>
      </Canvas>
    </DefaultLayout>
  )
}
