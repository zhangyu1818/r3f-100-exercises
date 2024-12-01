import * as THREE from 'three'

import { extend, type BufferGeometryNode } from '@react-three/fiber'

// Paul West @prisoner849 https://discourse.threejs.org/u/prisoner849
// https://discourse.threejs.org/t/simple-curved-plane/26647/10
class BentPlaneGeometry extends THREE.PlaneGeometry {
  public constructor(radius: number, ...args: number[]) {
    super(...args)

    const p = this.parameters
    const hw = p.width * 0.5
    const a = new THREE.Vector2(-hw, 0)
    const b = new THREE.Vector2(0, radius)
    const c = new THREE.Vector2(hw, 0)

    const ab = new THREE.Vector2().subVectors(a, b)
    const bc = new THREE.Vector2().subVectors(b, c)
    const ac = new THREE.Vector2().subVectors(a, c)
    const r =
      (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)))

    const center = new THREE.Vector2(0, radius - r)
    const baseV = new THREE.Vector2().subVectors(a, center)
    const baseAngle = baseV.angle() - Math.PI * 0.5
    const arc = baseAngle * 2
    const uv = this.attributes.uv
    const pos = this.attributes.position
    const mainV = new THREE.Vector2()
    for (let i = 0; i < uv.count; i++) {
      const uvRatio = 1 - uv.getX(i)
      const y = pos.getY(i)
      mainV.copy(c).rotateAround(center, arc * uvRatio)
      pos.setXYZ(i, mainV.x, y, -mainV.y)
    }
    pos.needsUpdate = true
  }
}

extend({ BentPlaneGeometry })

declare module '@react-three/fiber' {
  interface ThreeElements {
    bentPlaneGeometry: BufferGeometryNode<
      BentPlaneGeometry,
      typeof BentPlaneGeometry
    >
  }
}
