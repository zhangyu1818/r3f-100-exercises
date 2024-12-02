'use client'

import { Environment, Lightformer } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'

import { DefaultLayout } from '@/components/layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout date='2024年12月1日'>
      <Canvas camera={{ fov: 25, position: [0, 0, 15] }}>
        <color args={['black']} attach='background' />
        <ambientLight intensity={0.5} />
        <spotLight
          angle={0.28}
          intensity={180}
          penumbra={0.5}
          position={[-2, 3, 3]}
        />
        <Environment background blur={1} resolution={256}>
          <color args={['black']} attach='background' />
          <Lightformer
            color='white'
            intensity={0.2}
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 4]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color='white'
            intensity={0.5}
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 4]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color='white'
            intensity={1}
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 4]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color='white'
            intensity={2}
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 4]}
            scale={[100, 10, 1]}
          />
        </Environment>
        <Physics gravity={[0, -40, 0]}>{children}</Physics>
      </Canvas>
    </DefaultLayout>
  )
}
