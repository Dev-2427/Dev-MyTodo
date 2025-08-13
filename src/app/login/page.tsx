'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signinSchema } from "@/schemas/signinSchema";
import { signIn } from "next-auth/react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import axios from "axios";
import { emailSchema } from "@/schemas/signupSchema";
import Navbar from "@/components/Navbar";



function login() {

    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitting2, setIsSubmitting2] = useState(false)

    const form = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            identifier: "",
            password: ""
        },
    })

    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(data: z.Infer<typeof signinSchema>) {
        setIsSubmitting(true)
        try {
            const result = await signIn('credentials', {
                redirect: false,
                identifier: data.identifier,
                password: data.password
            })

            if (result?.error) {
                setIsSubmitting(false)
                toast.warning('Incorrect username or password', { duration: 7000 })
            }

            if (result?.url) {
                toast.success('Signed in successfully', { duration: 5000 })
                router.push("/dashboard")

            }

        } catch (error) {
            setIsSubmitting(false)
            toast.warning("Something went wrong", { duration: 7000 })
        }
    }

    async function onEmailSubmit(data: z.infer<typeof emailSchema>) {
        setIsSubmitting2(true)

        try {
            const result = await axios.patch('/api/forgotOldPasswordForLogin', data)

            if (result.data.success) {
                toast.success(result.data.message)
                router.push(`/email-verification?email=${encodeURIComponent(data.email)}`)
            } else {
                toast.error(result.data.message || "Something went wrong")
            }

        } catch (error) {
            toast.error('Server error')
        } finally {
            setIsSubmitting2(false)
        }
    }

    return (
        <div className="[font-family:var(--font-inter)] ">
            <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-[#0f172a] dark:text-slate-200 xl:px-32 lg:px-10 px-5">

                <div className="h-10 w-full"> <Navbar /></div>

                <div className="flex flex-grow justify-center items-center py-8">
                    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-[#1e293b] rounded-lg shadow-md">

                        <div className="text-center">
                            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl py-4 ">
                                Welcome Back
                            </h1>

                            <p className="mb-4 font-semibold text-slate-500 dark:text-gray-400">
                                Ready to crush your tasks?
                            </p>
                        </div>

                        <div>
                            <button
                                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                                className="flex items-center justify-center w-full px-4 py-2 border rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700  transition-colors duration-200 cursor-pointer"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 533.5 544.3"
                                >
                                    <path fill="#4285F4" d="M533.5 278.4c0-17.6-1.4-35-4.3-51.9H272v98.3h146.9c-6.4 34.6-25.4 63.9-54.4 83.4v68h87.7c51.3-47.2 81.3-116.8 81.3-197.8z" />
                                    <path fill="#34A853" d="M272 544.3c73.8 0 135.8-24.5 181-66.4l-87.7-68c-24.3 16.3-55.3 26-93.3 26-71.7 0-132.5-48.3-154.3-113.1H25.7v70.9C70.5 475.1 165.8 544.3 272 544.3z" />
                                    <path fill="#FBBC05" d="M117.7 322.8c-10.6-31.5-10.6-65.4 0-96.9V155H25.7c-36.1 71.5-36.1 157.8 0 229.3l92-61.5z" />
                                    <path fill="#EA4335" d="M272 107.1c39.9-.6 78.3 14 107.4 40.6l80.3-80.3C406.3 23.9 341.4-.2 272 0 165.8 0 70.5 69.2 25.7 173.1l92 70.9c21.8-64.8 82.6-113.1 154.3-113.1z" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>

                        <div className="flex items-center my-6">
                            <div className="flex-grow border-t border-gray-300 dark:border-slate-600"></div>
                            <span className="mx-2 text-sm text-gray-500 dark:text-slate-400">OR</span>
                            <div className="flex-grow border-t border-gray-300 dark:border-slate-600"></div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="identifier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email/Username</FormLabel>
                                            <FormControl>
                                                <Input className="dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-400" placeholder="Email / Username" {...field}
                                                    spellCheck={false} />
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
                                                <Input className="dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-400" placeholder="Password" type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <span className='text-blue-500 hover:underline text-sm p-1 cursor-pointer   w-fit'>Forgot password?</span>
                                                </DialogTrigger>

                                                <Form {...emailForm}>
                                                    <DialogContent className="sm:max-w-[425px] dark:bg-slate-800 dark:text-slate-200  dark:border-slate-700">

                                                        <DialogHeader>
                                                            <DialogTitle>Verify email</DialogTitle>
                                                            <DialogDescription className="text-slate-500 dark:text-gray-400">A verification code will be sent to your email address.</DialogDescription>
                                                        </DialogHeader>
                                                        <FormField
                                                            control={emailForm.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Email</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            className="dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-400"
                                                                            placeholder="Enter your email" type='email' spellCheck={false} {...field}
                                                                        />
                                                                    </FormControl>

                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />


                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button className='cursor-pointer dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600' variant="outline">Cancel</Button>
                                                            </DialogClose>
                                                            <Button onClick={emailForm.handleSubmit(onEmailSubmit)}
                                                                className='bg-blue-500 hover:bg-blue-600 cursor-pointer dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white'
                                                                type="submit"
                                                                disabled={isSubmitting2}>
                                                                {isSubmitting2 ? (
                                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> please wait</>
                                                                ) : ('Send')}</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Form>
                                            </Dialog>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 cursor-pointer dark:bg-blue-500 dark:hover:bg-blue-600 text-white" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> please wait</>
                                    ) : ('Signin')}
                                </Button>
                            </form>
                        </Form>

                        <div className="flex gap-2 justify-center items-center">
                            <p className="cursor-default text-[0.95rem]">Not a user?</p>
                            <Link href="/signup" className="text-blue-500 hover:text-blue-600 text-[0.95rem]">Sign up</Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default login
