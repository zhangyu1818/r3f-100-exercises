'use client'

import { Environment, Lightformer } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='size-full'>
      <Canvas camera={{ fov: 25, position: [0, 0, 15] }}>
        <ambientLight intensity={0.5} />
        <Environment background blur={0.75}>
          <color args={['black']} attach='background' />
          <Lightformer
            color='white'
            intensity={2}
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 4]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color='white'
            intensity={3}
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 4]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color='white'
            intensity={3}
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 4]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color='white'
            intensity={10}
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 4]}
            scale={[100, 10, 1]}
          />
        </Environment>
        <Physics gravity={[0, -40, 0]}>{children}</Physics>
      </Canvas>
    </div>
  )
}
