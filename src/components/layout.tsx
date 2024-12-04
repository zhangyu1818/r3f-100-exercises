import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { IconArrowLeft, IconHome } from '@tabler/icons-react'
import { twMerge } from 'tailwind-merge'

interface DefaultLayoutProps {
  children: React.ReactNode
  className?: string
  date?: string
  message?: string
}

export const DefaultLayout = (props: DefaultLayoutProps) => {
  const { children, className, date, message } = props
  const sourceCodeCount = usePathname().split('/').at(-1)
  return (
    <div className={twMerge('size-full bg-zinc-100', className)}>
      {message && (
        <div className='absolute left-8 top-8 z-10 text-xl font-semibold mix-blend-difference'>
          {message}
        </div>
      )}
      <Link
        className='absolute bottom-8 left-8 z-10 text-sm underline mix-blend-difference'
        href={`https://github.com/zhangyu1818/r3f-100-exercises/tree/main/src/app/(exercises)/${sourceCodeCount}`}
        rel='noreferrer'
        target='_blank'
      >
        Source Code
      </Link>
      <p className='absolute bottom-8 right-8 z-10 gap-1 text-end font-serif mix-blend-difference'>
        {date && <span className='block'>{date}</span>}
        <Link
          className='underline'
          href='https://github.com/zhangyu1818'
          rel='noreferrer'
          target='_blank'
        >
          <small>zhangyu1818</small>
        </Link>
      </p>
      {children}
      <div className='absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-4'>
        {Number(sourceCodeCount) > 1 && (
          <Link
            className='rounded-full bg-black/20 p-2 shadow backdrop-blur'
            href={`/${Number(sourceCodeCount) - 1}`}
          >
            <IconArrowLeft size={16} />
          </Link>
        )}
        <Link
          className='rounded-full bg-black/20 p-2 shadow backdrop-blur'
          href='/'
        >
          <IconHome size={16} />
        </Link>
      </div>
    </div>
  )
}
