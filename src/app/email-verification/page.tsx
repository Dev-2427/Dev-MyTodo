'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema";
import Navbar from "@/components/Navbar";


function emailVerification() {

    const params = useSearchParams()
    const email = params.get('email')

    const [isSubmitting, setIsSubmitting] = useState(false)

    const router = useRouter()

    const form = useForm<z.infer<typeof verifyCodeSchema>>({
        resolver: zodResolver(verifyCodeSchema),
        defaultValues: {
            code: ""
        },
    })

    async function onSubmit(data: z.Infer<typeof verifyCodeSchema>) {
        setIsSubmitting(true)
        try {

            const result = await axios.post('/api/email-verification', {
                email, code: data.code
            })

            if (result.data.success) {
                toast.success(result.data.message, { duration: 5000 })
                router.push(`/change-password?email=${decodeURIComponent(email || '')}`)
            } else {
                toast.error(result.data.message, { duration: 5000 })
            }

        } catch (error) {
            console.log("error on signin", error)
            toast.warning("Something went wrong", { duration: 7000 })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a]  text-black dark:text-slate-200 xl:px-32 lg:px-10 px-5 [font-family:var(--font-inter)]">

            <div className="h-10"> <Navbar /></div>

            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-40px)]">
                <div className="w-full max-w-md p-8 mx-auto space-y-8 bg-[#ffffff] dark:bg-[#1e293b] dark:text-slate-200 rounded-lg shadow-md py-2">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight lg:text-2xl py-4 ">
                            Verify Email
                        </h1>

                        <p className="mb-4 font-semibold text-slate-500 dark:text-gray-400">
                            Verify email to set new password
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
                                            <Input className="dark:placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-600"
                                                placeholder="Code" {...field}

                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer" disabled={isSubmitting}>

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
    )
}

export default emailVerification
