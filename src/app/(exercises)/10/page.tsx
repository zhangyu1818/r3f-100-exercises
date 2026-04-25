'use client'

import { ElasticBlob } from './elastic-blob'

export default function Page() {
  return (
    <>
      <ElasticBlob position={[0, 0, 0]} size={3.0} />
      <ElasticBlob position={[2.3, 1.4, 0]} size={0.9} />
      <ElasticBlob position={[-2.5, -1.6, 0]} size={0.5} />
    </>
  )
}
