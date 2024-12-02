import { usePathname } from 'next/navigation'

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
      <a
        className='absolute bottom-8 left-8 z-10 text-sm underline mix-blend-difference'
        href={`https://github.com/zhangyu1818/r3f-100-exercises/tree/main/src/app/(exercises)/${sourceCodeCount}`}
        rel='noreferrer'
        target='_blank'
      >
        Source Code
      </a>
      <p className='absolute bottom-8 right-8 z-10 gap-1 text-end font-serif mix-blend-difference'>
        {date && <span className='block'>{date}</span>}
        <a
          className='underline'
          href='https://github.com/zhangyu1818'
          rel='noreferrer'
          target='_blank'
        >
          <small>zhangyu1818</small>
        </a>
      </p>
      {children}
    </div>
  )
}
