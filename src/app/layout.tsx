import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { clsx } from 'clsx'

import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

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
      <body
        className={clsx(
          geistSans.variable,
          geistMono.variable,
          'antialiased',
          'h-svh w-svw',
        )}
      >
        {children}
      </body>
    </html>
  )
}
