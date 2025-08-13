'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'

nprogress.configure({ showSpinner: false, trickleSpeed: 100 })

export default function NProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    nprogress.start()
    const timeout = setTimeout(() => {
      nprogress.done()
    }, 300)

    return () => {
      clearTimeout(timeout)
      nprogress.done()
    }
  }, [pathname])

  return <>{children}</>
}
