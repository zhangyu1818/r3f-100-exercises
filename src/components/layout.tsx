import { clsx } from 'clsx'

interface DefaultLayoutProps {
  children: React.ReactNode
  className?: string
  date?: string
  message?: string
  sourceCodeCount?: number
}

export const DefaultLayout = (props: DefaultLayoutProps) => {
  const { children, className, date, message, sourceCodeCount } = props
  return (
    <div className={clsx('size-full bg-zinc-100', className)}>
      {message && (
        <div className='absolute left-8 top-8 z-10 text-xl font-semibold mix-blend-difference'>
          {message}
        </div>
      )}
      {sourceCodeCount && (
        <a
          className='absolute bottom-8 left-8 z-10 text-sm underline mix-blend-difference'
          href={`https://github.com/zhangyu1818/r3f-100-exercises/tree/main/src/app/(exercises)/${sourceCodeCount}`}
        >
          Source Code
        </a>
      )}
      <p className='absolute bottom-8 right-8 z-10 gap-1 text-end font-serif mix-blend-difference'>
        {date && <span className='block'>{date}</span>}
        <a className='underline' href='https://github.com/zhangyu1818'>
          <small>zhangyu1818</small>
        </a>
      </p>
      {children}
    </div>
  )
}
