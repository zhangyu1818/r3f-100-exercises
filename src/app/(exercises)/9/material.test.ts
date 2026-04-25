import * as THREE from 'three/webgpu'

import { describe, expect, it } from 'vitest'

import { createFluidMaterials } from './fluid-utils'
import { createStretchWaveMaterial, StretchWaveNodeMaterial } from './material'

describe('exercise 9 work-plane material', () => {
  it('creates a TSL NodeMaterial with the uniform update surface', () => {
    const texture = new THREE.Texture()
    const material = createStretchWaveMaterial({ texture })
    const flags = material as { isNodeMaterial?: boolean }

    expect(material).toBeInstanceOf(StretchWaveNodeMaterial)
    expect(flags.isNodeMaterial).toBe(true)
    expect(material.transparent).toBe(true)
    expect(material.side).toBe(THREE.DoubleSide)
    expect(material.uniforms.uMap.value).toBe(texture)
    expect(material.uniforms.uHover.value).toBe(0)
  })

  it('creates TSL NodeMaterials for every fluid pass', () => {
    const materials = createFluidMaterials(new THREE.Vector2(1 / 64, 1 / 64))
    const entries = Object.values(materials)

    expect(entries).toHaveLength(8)

    for (const material of entries) {
      const flags = material as {
        isNodeMaterial?: boolean
      }

      expect(flags.isNodeMaterial).toBe(true)
      expect(material.fragmentNode).toBeTruthy()
    }
  })
})
