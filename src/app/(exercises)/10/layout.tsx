'use client'

import { Canvas } from '@react-three/fiber'

import { DefaultLayout } from '@/components/layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout
      author="Patrick Heng"
      authorLink="https://patrickheng.com/"
      className="bg-[#F23912]"
    >
      <Canvas
        camera={{ fov: 45, position: [0, 0, 5] }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        {children}
      </Canvas>
    </DefaultLayout>
  )
}
