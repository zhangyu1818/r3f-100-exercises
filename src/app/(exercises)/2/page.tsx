'use client'

import { Carousel, Rotate } from './components'

import './extends'

export default function Page() {
  return (
    <Rotate rotation={[0, 0, 0.1]}>
      <Carousel radius={2} />
    </Rotate>
  )
}
