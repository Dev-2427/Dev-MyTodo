'use client'

import Navbar from '../components/Navbar' 
import { useEffect, useState } from 'react'

export default function Loading() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen xl:px-32 lg:px-10 px-5 font-sans dark:bg-[#0f172a] dark:text-slate-200 flex flex-col">
      <div className="h-10">
        <Navbar />
      </div>

      <main className="flex-grow flex flex-col justify-center items-center px-4 text-center space-y-8">

        <svg
          className="animate-spin h-20 w-20 text-blue-600 dark:text-blue-400 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading spinner"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>

        <svg
          className="w-40 h-40 text-blue-300 dark:text-blue-700 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <rect
            x="12"
            y="8"
            width="40"
            height="48"
            rx="6"
            ry="6"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <line
            x1="20"
            y1="22"
            x2="44"
            y2="22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="20"
            y1="32"
            x2="44"
            y2="32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="20"
            y1="42"
            x2="44"
            y2="42"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <polyline
            points="16 22 18 24 22 20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h2 className="text-3xl font-semibold text-blue-700 dark:text-blue-400">
        Loading your content{dots}
        </h2>

        <p className="max-w-md text-gray-700 dark:text-slate-400">
         Sit tight while we get things ready.
        </p>
      </main>
    </div>
  )
}
