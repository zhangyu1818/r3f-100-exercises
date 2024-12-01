'use client'

import { Canvas } from '@react-three/fiber'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='size-full'>
      <Canvas camera={{ fov: 15, position: [0, 0, 12] }}>
        <color args={['black']} attach='background' />
        <fog args={['black', 15, 20]} attach='fog' />
        <ambientLight intensity={0.5} />
        <directionalLight intensity={0.7} position={[-50, 0, -40]} />
        {children}
      </Canvas>
    </div>
  )
}
