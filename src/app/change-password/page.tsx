'use client'
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { forgotPasswordSchema } from "@/schemas/signupSchema";
import axios from 'axios'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import z from "zod";
import Navbar from "@/components/Navbar";

function changePassword() {

  const params = useSearchParams()
  const email = params.get('email')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: ""
    },
  })

  async function onSubmit(data: z.Infer<typeof forgotPasswordSchema>) {
    setIsSubmitting(true)
    try {
      if (data.newPassword !== data.confirmNewPassword) {
        toast.warning("Passwords do not match", { duration: 7000 })
        setIsSubmitting(false)
        return
      }
      const response = await axios.post('/api/createNewPassword', {
        email,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword
      })

      if (response.data.success) {
        toast.success(response.data.message, { duration: 5000 })
        router.push("/login")
      } else {
        toast.error(response.data.message, { duration: 5000 })
      }

      setIsSubmitting(false)
    } catch (error) {
      console.log("error on changing password", error)
      setIsSubmitting(false)

      if (axios.isAxiosError(error)) {
        toast.warning(error.response?.data.message, { duration: 7000 })
      } else {
        toast.warning("Something went wrong", { duration: 7000 })
      }
    }
  }


  return (
    <div className="bg-gray-100 min-h-screen xl:px-32 lg:px-10 px-5 [font-family:var(--font-inter)] dark:bg-[#0f172a] dark:text-slate-200">

 <div className="h-10"> <Navbar /></div>

      <div className="flex justify-center items-center min-h-[calc(100vh-40px)] ">
        <div className="w-full max-w-md p-8 space-y-8 bg-[#ffffff] rounded-lg shadow-md py-2 dark:bg-[#1e293b] dark:text-slate-200">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight lg:text-3xl py-4 ">
              Create a New Password
            </h1>

            <p className="mb-4 font-semibold text-slate-500 dark:text-gray-400">
              Your new password should be strong and unique.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input className="dark:placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-600 "
                        placeholder="Enter new password" type="password" {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Confirm New Password</FormLabel>
                    <FormControl>
                      <Input className="dark:placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-600"
                       placeholder="Re-enter new password" type="password" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-blue-500 hover:bg-blue-700 cursor-pointer dark:bg-blue-500 dark:hover:bg-blue-600 text-white" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...</>
                ) : ('Submit')}</Button>
            </form>
          </Form>

        </div>
      </div>

    </div>
  )
}

export default changePassword
