'use client'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { toast } from 'sonner'

function loginWithTokenPage() {

    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')
        const username = searchParams.get('username')

        if (!token || !username) {
            toast.error('Missing token or username')
            router.replace('/login')
            return
        }

        async function loginWithToken() {
            try {
                const res = await signIn('credentials', {
                   identifier: username,
                    password: token,
                    redirect: false
                })

                if (res?.ok) {
                    router.replace('/dashboard')
                } else {
                    toast.error("Token login failed")
                    router.replace('/login')
                }
            } catch (error) {
                toast.error("Unexpected error during login")
                router.replace('/login')
            }
        }

        loginWithToken()

    }, [router, searchParams])



    return (
        <div>
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-600 dark:text-gray-300">Logging you in securely...</p>
            </div>
        </div>
    )
}

export default loginWithTokenPage
