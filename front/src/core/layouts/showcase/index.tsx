import React from 'react'
import { Helmet } from 'react-helmet'
import { useLocation } from 'react-router-dom'

/* import '@/styles/tailwind.css'
import '@/styles/application.css' */

interface Props {
  children: React.ReactNode
  title?: string
}

export default function Showcase({ title, children }: Props): JSX.Element {
  const { pathname } = useLocation()

  const pathNameWithoutHeader: string[] = ['/']

  return (
    <>
      <Helmet>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta charSet='utf-8' />
        <title>{title || 'SocketGame'}</title>
      </Helmet>

      <main className='w-full h-screen my-0 mx-auto block bg-blue-200'>
        <div className="p-6 h-full flex flex-col items-center justify-center">
          {children}
        </div>
      </main>
    </>
  )
}