'use client'

import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { DefaultLayout } from '@/components/layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout date='2024年12月3日'>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <OrbitControls />
        {children}
      </Canvas>
    </DefaultLayout>
  )
}
