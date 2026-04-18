'use client'

import { ScrollControls, StatsGl } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { DefaultLayout } from '@/components/layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout date="2024年12月2日" message="Scroll Up & Down">
      <Canvas camera={{ fov: 45, position: [0, 5, 30] }}>
        <StatsGl className="stats-gl-top-right" />
        <ScrollControls infinite pages={5}>
          {children}
        </ScrollControls>
      </Canvas>
    </DefaultLayout>
  )
}
