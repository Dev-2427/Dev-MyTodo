'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signupSchema } from "@/schemas/signupSchema";
import axios from 'axios'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { signIn } from "next-auth/react";



function signup() {
    const [username, setUsername] = useState("")
    const [usernameMessage, setUsernameMessage] = useState("")
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const router = useRouter()

    const debounced = useDebounceCallback(setUsername, 500)

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            username: "",
            email: "",
            password: ""
        },
    })

    useEffect(() => {

        async function checkUniqueUsername() {

            if (!username) return;
            setIsCheckingUsername(true);
            setUsernameMessage("");

            try {
                const result = await axios.get(`/api/checkUsernameUnique?username=${username}`)
                setUsernameMessage(result.data.message)
            } catch (error) {

                if (axios.isAxiosError(error)) {
                    setUsernameMessage(error.response?.data.message ?? "Error checking username");
                } else {
                    setUsernameMessage("Something went wrong");
                }
            } finally {
                setIsCheckingUsername(false)
            }
        }

        checkUniqueUsername()
    }, [username])

    async function onSubmit(data: z.Infer<typeof signupSchema>) {
        setIsSubmitting(true)
        try {

            const response = await axios.post('/api/signup', data)

            toast.success(response.data.message, { duration: 7000 })

            router.replace(`/verify/${username}`)

            setIsSubmitting(false)
        } catch (error) {
            console.log("error on verifying from frontend", error)
            setIsSubmitting(false)

            if (axios.isAxiosError(error)) {
                toast.warning(error.response?.data.message, { duration: 7000 })
            } else {
                toast.warning("Something went wrong", { duration: 7000 })
            }
        }
    }

    return (
        <div className="[font-family:var(--font-inter)] ">
            <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-[#0f172a] dark:text-slate-200 xl:px-32 lg:px-10 px-5">

                <div className="h-10 w-full">
                    <Navbar />
                </div>

                <div className="flex flex-grow justify-center items-center py-8">
                    <div className="w-full max-w-md p-8 xl:space-y-6 space-y-8 bg-white dark:bg-[#1e293b] rounded-lg shadow-md">

                        <div className="text-center">
                            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl py-4 ">
                                Welcome to MyTodo
                            </h1>

                            <p className="mb-4 font-semibold text-slate-500 dark:text-slate-400">
                                Join MyTodo and start turning plans into progress.
                            </p>
                        </div>

                        <div className="mb-6">
                            <button
                                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                                className="flex items-center justify-center w-full px-4 py-2 border rounded-md dark:shadow-md bg-white text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 533.5 544.3"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M533.5 278.4c0-17.6-1.4-35-4.3-51.9H272v98.3h146.9c-6.4 34.6-25.4 63.9-54.4 83.4v68h87.7c51.3-47.2 81.3-116.8 81.3-197.8z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M272 544.3c73.8 0 135.8-24.5 181-66.4l-87.7-68c-24.3 16.3-55.3 26-93.3 26-71.7 0-132.5-48.3-154.3-113.1H25.7v70.9C70.5 475.1 165.8 544.3 272 544.3z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M117.7 322.8c-10.6-31.5-10.6-65.4 0-96.9V155H25.7c-36.1 71.5-36.1 157.8 0 229.3l92-61.5z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M272 107.1c39.9-.6 78.3 14 107.4 40.6l80.3-80.3C406.3 23.9 341.4-.2 272 0 165.8 0 70.5 69.2 25.7 173.1l92 70.9c21.8-64.8 82.6-113.1 154.3-113.1z"
                                    />
                                </svg>
                                Continue with Google
                            </button>
                        </div>

                        <div className="flex items-center my-4">
                            <div className="flex-grow border-t border-gray-300 dark:border-slate-600"></div>
                            <span className="mx-2 text-sm text-gray-500 dark:text-slate-400">OR</span>
                            <div className="flex-grow border-t border-gray-300 dark:border-slate-600"></div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input className="dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-400"
                                                    placeholder="Username" spellCheck={false} {...field}
                                                    onChange={(e) => { field.onChange(e), debounced(e.target.value) }}
                                                />
                                            </FormControl>
                                            {isCheckingUsername && <Loader2 className="animate-spin" />}

                                            <p className={` text-sm ${usernameMessage === "Username is available" ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>{usernameMessage}</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-400"
                                                    placeholder="Email" type="email" spellCheck={false} {...field}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-400"
                                                    placeholder="Password" type="password" {...field} />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> please wait</>
                                    ) : ('Signup')}</Button>
                            </form>
                        </Form>

                        <div className="flex gap-2 justify-center items-center mb-2">
                            <p className="cursor-default">Already a member?</p>
                            <Link href="/login" className="text-blue-600 dark:text-blue-500 dark:hover:text-blue-600">Login</Link>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default signup
