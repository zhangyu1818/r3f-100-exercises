'use client'

import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { Perf } from 'r3f-perf'

import { DefaultLayout } from '@/components/layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout>
      <Canvas camera={{ fov: 45, position: [1.5, 2, 2] }}>
        <OrbitControls maxPolarAngle={Math.PI / 2.5} />
        <Perf position='top-left' />
        {children}
      </Canvas>
    </DefaultLayout>
  )
}
