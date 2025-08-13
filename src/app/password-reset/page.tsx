'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { forgotPasswordSchema } from "@/schemas/signupSchema";
import axios from 'axios'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { signOut } from "next-auth/react";

function PasswordReset() {

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
      const response = await axios.post('/api/newPassword', data)

      if (response.data.success) {
        toast.success(response.data.message, { duration: 7000 })
       await signOut({redirect: false})
        router.push("/login")
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
    <div className="bg-gray-100 dark:bg-[#0f172a] dark:text-slate-200 min-h-screen xl:px-32 lg:px-10 px-5 [font-family:var(--font-inter)]">

      <div className="h-10">
        <Navbar />
      </div>

      <div className="flex justify-center items-center min-h-[calc(100vh-2.5rem)]">
        <div className="w-full max-w-md p-8 space-y-8 bg-[#ffffff] dark:bg-[#1e293b] rounded-lg shadow-md py-2">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight lg:text-3xl py-4 ">
              Create a New Password
            </h1>

            <p className="mb-4 font-semibold text-slate-500 dark:text-slate-400">
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
                      <Input className="dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-400"
                       placeholder="Enter new password" type="password" {...field} />
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
                      <Input className="dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-400"
                       placeholder="Re-enter new password" type="password" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer" disabled={isSubmitting}>
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

export default PasswordReset
