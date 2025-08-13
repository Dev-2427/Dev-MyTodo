'use client'

import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="bg-gray-100 min-h-screen xl:px-32 lg:px-10 px-5 [font-family:var(--font-inter)] dark:bg-[#0f172a] dark:text-slate-200">

            <div className="h-10">
                <Navbar />
            </div>

            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-40px)] text-center space-y-6">
                <h1 className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">404</h1>
                <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
                <p className="max-w-md text-slate-600 dark:text-slate-400">
                    Sorry, the page you are looking for does not exist or has been moved.
                </p>
                <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold dark:bg-blue-500 dark:hover:bg-blue-600 transition">
                    Go to Homepage

                </Link>
            </div>

        </div>
    )
}
