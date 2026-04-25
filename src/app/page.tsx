import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-black">
      {[
        'Exercise 1 - Floating MacBook',
        'Exercise 2 - Circular Carousel',
        'Exercise 3 - Video Reflection',
        'Exercise 4 - 3D Card',
        'Exercise 5 - Ring Shaped Card',
        'Exercise 6 - Infinite Falling Blocks',
        'Exercise 7 - Shader Banner',
        'Exercise 8 - Raging Sea',
        'Exercise 9 - Fluid Stretch',
        'Exercise 10 - Elastic Blob',
      ].map((title, index) => (
        <Link
          key={title}
          className="text-2xl underline"
          href={`/${index + 1}`}
        >
          {title}
        </Link>
      ))}
    </div>
  )
}
