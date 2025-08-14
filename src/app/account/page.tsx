'use client'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useDebounceCallback } from 'usehooks-ts'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema, changeUsernameSchema } from '@/schemas/signupSchema'
import z from 'zod'
import axios from 'axios'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"


function Account() {
  const [username, setUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitting2, setIsSubmitting2] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameMessage, setUsernameMessage] = useState("")

  const { data: session, update } = useSession()

  const debounce = useDebounceCallback(setUsername, 500)

  const route = useRouter()

  const form = useForm<z.infer<typeof changeUsernameSchema>>({
    resolver: zodResolver(changeUsernameSchema),
    defaultValues: {
      username: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: ""
    }
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

      toast.success(response.data.message, { duration: 7000 })
      await update({ username: data.username })
      setIsSubmitting(false)
      form.reset()
      setUsername("")


    } catch (error) {
      console.log("error on updating username", error)
      setIsSubmitting(false)

      if (axios.isAxiosError(error)) {
        toast.warning(error.response?.data.message, { duration: 7000 })
      } else {
        toast.warning("Something went wrong", { duration: 7000 })
      }
    }
  }

  async function onPasswordSubmit(data: z.Infer<typeof changePasswordSchema>) {
    setIsSubmitting(true)
    try {

      const response = await axios.patch('/api/changePassword', data)

      toast.success(response.data.message, { duration: 7000 })
      setIsSubmitting(false)
      passwordForm.reset()
    } catch (error) {
      console.log("error on password change", error)
      setIsSubmitting(false)

      if (axios.isAxiosError(error)) {
        toast.warning(error.response?.data.message, { duration: 7000 })
      } else {
        toast.warning("Something went wrong", { duration: 7000 })
      }
    }
  }

  async function forgotPassword() {
    setIsSubmitting2(true)
    try {
      const res = await axios.patch("/api/forgotOldPassword")

      if (res.data.success) {
        toast.success(res.data.message)
        route.push("/verify-email")
      }
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting2(false)
    }
  }

  async function deleteAccount() {
    try {
      const result = await axios.delete("/api/delete-account")

      if (result.data.success) {
        toast.success(result.data.message)
        await signOut({callbackUrl: "/"})
    
      } else (
        toast.error(result.data.message)
      )
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong")
    }
  }

  return (
    <div className='[font-family:var(--font-inter)] bg-gray-100 dark:bg-[#0f172a]  text-black dark:text-slate-200 min-h-screen xl:px-32 lg:px-10 px-5 transition-colors duration-300'>
      <div className="h-10"> <Navbar /></div>

      <div className="min-h-[calc(100vh-40px)] flex justify-center items-center">
        <div className="container flex flex-col justify-between items-center mx-auto bg-[#ffffff] rounded-lg px-10 xl:w-[35vw] lg:w-[60vw] py-10 gap-6 shadow-lg dark:bg-[#1e293b] text-black dark:text-slate-200">

          <div className='font-bold text-[1.8rem] w-full text-left'>
            Account Details
          </div>

          <div className='inputs flex flex-col gap-5 w-full'>

            <div className="username relative w-full">
              <p className="p-1">Username</p>
              <Input
                readOnly
                className="pr-20 text-sm placeholder:text-black h-10 dark:placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-600 "
                placeholder={session?.user?.username || ""}
              />

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="absolute top-[40px] right-3 text-sm text-blue-500 dark:text-blue-400 hover:underline cursor-pointer "
                    type="button"
                  >
                    Change
                  </button>
                </DialogTrigger>
                <Form {...form}>
                  <DialogContent className="sm:max-w-[425px] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-lg fixed top-[30%] sm:top-1/2 ">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <DialogHeader>
                        <DialogTitle>Change Username</DialogTitle>
                        <DialogDescription className='text-slate-400'>Update your username here.</DialogDescription>
                      </DialogHeader>

                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input className='dark:placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600'
                                placeholder={session?.user.username || ""} spellCheck={false} {...field}
                                onChange={(e) => { field.onChange(e), debounce(e.target.value), setUsername(e.target.value) }}
                              />
                            </FormControl>
                            {isCheckingUsername && <Loader2 className="animate-spin" />}

                            <p className={` text-sm ${usernameMessage === "Username is available" ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>{usernameMessage}</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <DialogClose asChild>
                          <Button className='cursor-pointer dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600' variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          className='bg-[#4278d4] hover:bg-[#2f62b3] cursor-pointer dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white' type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> please wait</>
                          ) : ('Save')}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Form>
              </Dialog>
            </div>

            <div className="email w-full">
              <p className="p-1 ">Email</p>
              <Input
                readOnly
                className=" placeholder:text-black h-10  px-3 py-2 text-sm  overflow-auto dark:placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-600"
                placeholder={session?.user?.email}
              />
            </div>

            {session?.user.provider !== "google" && <div className="password relative w-full">
              <p className="p-1">Password</p>
              <Input
                readOnly
                className="pr-20 text-sm placeholder:text-black h-10 dark:placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-600"
                placeholder={session?.user && "••••••••••••"}
              />

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="absolute top-[40px] right-3 text-sm text-blue-500 dark:text-blue-400 hover:underline cursor-pointer"
                    type="button"
                  >
                    Change
                  </button>
                </DialogTrigger>

                <Form {...passwordForm}>
                  <DialogContent className="sm:max-w-[425px] dark:bg-slate-800 dark:text-slate-200  dark:border-slate-700 fixed top-[30%] sm:top-1/2">
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">



                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription className='text-slate-400'>Update your Password here.</DialogDescription>
                      </DialogHeader>
                      <FormField
                        control={passwordForm.control}
                        name="oldPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Old password</FormLabel>
                            <FormControl>
                              <Input className='dark:placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600'
                                placeholder="Old password" type='password' spellCheck={false} {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New password</FormLabel>
                            <FormControl>
                              <Input className='dark:placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600'
                                placeholder="New password" type="password" spellCheck={false} {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            <Dialog>
                              <DialogTrigger asChild>

                                <span className='text-blue-500 hover:underline text-sm p-1 cursor-pointer w-fit dark:text-blue-400'>Forgot password?</span>
                              </DialogTrigger>

                              <DialogContent className='sm:max-w-[425px] dark:bg-slate-800 dark:text-slate-200  dark:border-slate-700'>
                                <DialogHeader>
                                  <DialogTitle>Verify email</DialogTitle>
                                  <DialogDescription className='text-slate-400'>A verification code will be sent to your email address.</DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-3">
                                  <Label htmlFor="name-1">Email</Label>
                                  <Input
                                    id="name-1" name="name" placeholder={session?.user.email} className='placeholder:text-black dark:placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600' readOnly />

                                  <Button className='bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white cursor-pointer' onClick={() => forgotPassword()} disabled={isSubmitting2}>
                                    {isSubmitting2 ? (
                                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> please wait</>
                                    ) : ('Send')}
                                  </Button>
                                </div>


                              </DialogContent>
                            </Dialog>
                          </FormItem>
                        )}
                      />


                      <DialogFooter>
                        <DialogClose asChild>
                          <Button className='cursor-pointer dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600' variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button className='bg-blue-500 hover:bg-blue-600 cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white' type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> please wait</>
                          ) : ('Save')}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Form>
              </Dialog>
            </div>}

          </div>

          <div className='flex justify-between items-center w-full responsive-button-stack'>

            <Link className='button-width' href="/dashboard">
              <Button className='flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-700 text-white'>
                <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                Dashboard
              </Button>


            </Link>

            <div className='delete flex justify-center items-center gap-3'>
              <AlertDialog >
                <AlertDialogTrigger asChild>
                  <Button className='bg-[#f8f8f8] hover:bg-[#f0e9e9] border-red-500 border cursor-pointer text-red-500  dark:bg-red-800 dark:hover:bg-red-900    button-width dark:text-red-300 dark:border-red-800' >Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className='dark:bg-[#1e293b] dark:text-slate-200'>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are You Sure You Want to Leave?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is permanent and cannot be undone. All your data, including todos and account information, will be permanently removed from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className='dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 cursor-pointer'>Cancel</AlertDialogCancel>
                    <AlertDialogAction className='bg-[#f8f8f8] hover:bg-[#f0e9e9] dark:bg-[#dfc2c2] dark:hover:bg-[#baa7a7] border-red-500 border cursor-pointer text-red-500' onClick={() => deleteAccount()}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
