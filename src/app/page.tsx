import Link from 'next/link'

export default function Home() {
  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <Link className='text-2xl underline' href='/1'>
        Exercise 1 - Floating MacBook
      </Link>
      <Link className='text-2xl underline' href='/2'>
        Exercise 2 - Circular Carousel
      </Link>
      <Link className='text-2xl underline' href='/3'>
        Exercise 3 - Video Reflection
      </Link>
      <Link className='text-2xl underline' href='/4'>
        Exercise 4 - 3D Card
      </Link>
    </div>
  )
}
