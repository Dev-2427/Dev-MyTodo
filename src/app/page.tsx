'use client'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function page() {
  const [mounted, setMounted] = useState(false)
  const { theme, systemTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentTheme = theme === "system" ? systemTheme : theme

  const handleSignup = () => {
    router.push('/signup')
  }
  const handleLogin = () => {
    router.push('/login')
  }

  return (
    <div className='[font-family:var(--font-inter)] bg-gray-100 dark:bg-[#0f172a] h-screen overflow-hidden xl:px-32 lg:px-10 px-5'>

      <Navbar />

      <div className="flex flex-col-reverse lg:flex-row lg:justify-between justify-center items-center lg:gap-10 xl:px-20 lg:px-14 lg:h-[calc(100vh-80px)] h-[calc(100vh-130px)] md:pb-0 pb-3">

        <div className='flex flex-col lg:items-start items-center gap-6 max-w-xl text-center lg:text-left'>
          <h1 className='text-black font-bold md:text-5xl text-4xl leading-tight dark:text-white'>
            Stay organized and focused.
          </h1>
          <p className='text-gray-600 text-lg leading-relaxed dark:text-gray-300'>
            One task at a time.
          </p>

          <div className="flex gap-4">

            <Button onClick={handleLogin} className='bg-blue-500 text-white hover:bg-blue-600 cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-700'>
              Login
            </Button>

            <Button onClick={handleSignup} className='bg-white text-black border border-gray-300 hover:bg-gray-100 cursor-pointer dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700'>
              Sign Up
            </Button>

          </div>
        </div>

        <div className="w-full max-w-[300px] md:max-w-[400px]">
          <img src={currentTheme === "dark" ? '/todo-dark.png' : "/todo.png"} loading='lazy' alt="Todo Illustration" className='w-full object-contain' />
        </div>
      </div>
    </div>


  )
}

export default page
