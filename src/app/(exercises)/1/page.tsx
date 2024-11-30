'use client'

import { useState } from 'react'

import { ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { clsx } from 'clsx'

import { MacBook } from './macbook'

export default function Page() {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={clsx(
        'size-full transition-colors duration-700',
        open ? 'bg-orange-400' : 'bg-zinc-50',
      )}
    >
      <p
        className={clsx(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[72px] font-bold text-black transition-opacity',
          open ? 'opacity-0' : 'opacity-100',
        )}
      >
        Click ⬇️
      </p>
      <Canvas camera={{ fov: 30, position: [0, 0, 1] }} className='touch-none'>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxAzimuthAngle={0.8}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-0.8}
          minPolarAngle={Math.PI / 4}
        />
        <ambientLight intensity={4.5} />
        <directionalLight intensity={6} position={[2, 5, -5]} />
        <MacBook
          open={open}
          position={[0, -0.15, 0]}
          onClick={(e) => {
            e.stopPropagation()
            setOpen(!open)
          }}
        />
        <Environment preset='city' />
        <ContactShadows
          blur={1.5}
          opacity={0.6}
          position={[0, -0.151, 0]}
          scale={1.2}
        />
      </Canvas>
    </div>
  )
}
