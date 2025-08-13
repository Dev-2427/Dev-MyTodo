'use client'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import Navbar from "@/components/Navbar"

function verifyEmail() {

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

            const response = await axios.post('/api/verifyEmail', { code: data.code })

            if (response.data.success) {
                toast.success(response.data.message, { duration: 7000 })

                router.replace('/password-reset')
            }


            setIsSubmitting(false)
        } catch (error) {
            console.log("error on verify email:", error)
            setIsSubmitting(false)

            if (axios.isAxiosError(error)) {
                toast.warning(error.response?.data.message, { duration: 7000 })
            } else {
                toast.warning("Something went wrong", { duration: 7000 })
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a] dark:text-slate-200 xl:px-32 lg:px-10 px-5 [font-family:var(--font-inter)]">

            <div className="h-10 ">
                <Navbar />
            </div>
            
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-2.5rem)]">
                <div className="w-full max-w-md p-8 mx-auto space-y-8 bg-[#ffffff] dark:bg-[#1e293b] rounded-lg shadow-md">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight lg:text-2xl py-4 ">
                            Verify Email
                        </h1>

                        <p className="mb-4 font-semibold dark:text-slate-400 text-slate-500">
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
                                            <Input className="dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-400" placeholder="Code" {...field}

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

export default verifyEmail
