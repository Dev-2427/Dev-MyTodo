'use client'
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { changeUsernameSchema } from "@/schemas/signupSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useDebounceCallback } from "usehooks-ts"
import z from "zod"

function setUsername() {

    const [username, setUsername] = useState("")
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [usernameMessage, setUsernameMessage] = useState("")


    const { data: session, update } = useSession()

    const debounced = useDebounceCallback(setUsername, 500)

    const router = useRouter()

    const form = useForm<z.infer<typeof changeUsernameSchema>>({
        resolver: zodResolver(changeUsernameSchema),
        defaultValues: {
            username: "",
        },
    });

    useEffect(() => {
        async function checkUniqueUsername() {

            if (!username) return;
            setIsCheckingUsername(true);
            setUsernameMessage("");

            try {
                const result = await axios.get(`/api/checkUsernameUnique?username=${username}`)
                setUsernameMessage(result.data.message)
            } catch (error) {
                console.log("error checking username:", error)

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


    async function onSubmit(data: z.Infer<typeof changeUsernameSchema>) {
        setIsSubmitting(true)
        try {

            const response = await axios.patch('/api/updateUsername', data)

            if (response.data.success) {
                toast.success(response.data.message, { duration: 5000 })
                await update({ username: data.username })
                router.replace('/dashboard')
                setIsSubmitting(false)
                form.reset()
                setUsername("")
            } else {
                toast.error(response.data.message, { duration: 5000 })
                setIsSubmitting(false)
                form.reset()
                setUsername("")
            }

        } catch (error) {
            console.log("error on set username", error)
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
                                Set Your Username
                            </h1>

                            <p className="mb-4 font-semibold text-slate-500 dark:text-slate-400">
                                Pick a unique name for your profile.
                            </p>
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

                                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> please wait</>
                                    ) : ('Submit')}</Button>
                            </form>
                        </Form>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default setUsername
