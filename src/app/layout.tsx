import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  description: 'React Three Fiber Exercises',
  title: 'R3F Exercises',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className='h-svh w-svw antialiased'>{children}</body>
    </html>
  )
}
