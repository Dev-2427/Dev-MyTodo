'use client'

import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CredentialContext } from "@/context/credentialProvider"
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useContext, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

function verify() {

    const [isSubmitting, setIsSubmitting] = useState(false)

    const router = useRouter()

    const params = useParams<{ username: string }>()

    const credential = useContext(CredentialContext)

    const form = useForm<z.infer<typeof verifyCodeSchema>>({
        resolver: zodResolver(verifyCodeSchema),
        defaultValues: {
            code: ""
        },
    })


    async function onSubmit(data: z.Infer<typeof verifyCodeSchema>) {
        setIsSubmitting(true)
        try {

            const response = await axios.post('/api/verifyCode', { username: params.username, code: data.code })

            if (response.data.success) {
                toast.success(response.data.message, { duration: 7000 })

                const result = await signIn('credentials', {
                    redirect: false,
                    identifier: params.username,
                    password: credential.credential
                })

                if (result?.error) {
                    setIsSubmitting(false)
                    toast.warning('Incorrect username or password', { duration: 7000 })
                }

                if (result?.url) {
                    toast.success('Signed in successfully', { duration: 5000 })
                    credential.removeCredential()
                    router.push("/dashboard")

                }
            }

            // router.replace(`/login-with-token?token=${response.data.token}&username=${params.username}`)

            setIsSubmitting(false)
        } catch (error) {
            console.log("Something went wrong", error)
            setIsSubmitting(false)

            if (axios.isAxiosError(error)) {
                toast.warning(error.response?.data.message, { duration: 7000 })
            } else {
                toast.warning("Something went wrong", { duration: 7000 })
            }

            router.push('/login')
        }
    }

    return (
        <div>
            <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-[#0f172a] dark:text-slate-200 [font-family:var(--font-inter)] xl:px-32 lg:px-10 px-5">

                <div className="h-10 w-full">
                    <Navbar />
                </div>

                <div className="flex flex-grow justify-center items-center py-8">
                    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-[#1e293b] rounded-lg shadow-md">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl py-4 ">
                                Welcome to MyTodo
                            </h1>

                            <p className="mb-4 font-semibold dark:text-slate-400 text-slate-500">
                                Join MyTodo and start turning plans into progress.
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Verification Code</FormLabel>
                                            <FormControl>
                                                <Input className="dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-400" placeholder="Code" {...field}

                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 cursor-pointer dark:bg-blue-500 dark:hover:bg-blue-600 text-white " disabled={isSubmitting}>

                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> please wait
                                        </>
                                    ) : ('Submit')}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default verify
