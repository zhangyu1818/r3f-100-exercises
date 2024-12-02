'use client'

import { CameraShake } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'

import { DefaultLayout } from '@/components/layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout date='2024年12月2日'>
      <Canvas shadows camera={{ fov: 45, position: [10, 10, 10] }}>
        <color args={['lightpink']} attach='background' />
        <ambientLight intensity={0.2} />
        <spotLight
          castShadow
          angle={0.6}
          decay={0}
          intensity={5}
          penumbra={1}
          position={[8, 10, 5]}
          shadow-mapSize={[2048, 2048]}
        />
        <fog args={['lightpink', 12, 25]} attach='fog' />
        <Physics timeStep='vary'>{children}</Physics>
        <CameraShake
          maxPitch={0.01}
          maxRoll={0.01}
          maxYaw={0.01}
          pitchFrequency={0.5}
          rollFrequency={0.4}
          yawFrequency={0.5}
        />
      </Canvas>
    </DefaultLayout>
  )
}
