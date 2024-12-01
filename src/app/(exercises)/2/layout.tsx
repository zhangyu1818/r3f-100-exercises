'use client'

import { ScrollControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='size-full bg-orange-200'>
      <Canvas camera={{ fov: 15, position: [0, 0, 15] }}>
        <ScrollControls infinite pages={5}>
          {children}
        </ScrollControls>
      </Canvas>
    </div>
  )
}
