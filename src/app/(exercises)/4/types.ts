import type * as THREE from 'three'

import type { GLTF } from 'three-stdlib'

export type CardHolderGLTF = GLTF & {
  materials: unknown
  nodes: {
    card: THREE.Mesh
    content: THREE.Mesh
    holder: THREE.Mesh
    mask: THREE.Mesh
    ring: THREE.Mesh
    top: THREE.Mesh
  }
}
