'use client'
import Hero from "@/components/Hero"
import Navbar from "@/components/Navbar"
import Todos from "@/components/Todos";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import axios from "axios";
import { LogIn, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function page() {

  const { data: session, update, status } = useSession()
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function updateSession() {
      try {
        const result = await axios.get('/api/user-info')

        if (result.data.success) {
          if (session?.user?.username !== result.data.username) {
            await update({ username: result.data.username })
          }
        }
      } catch (error) {
        console.log("Error updating session", error)
      }
    }

    updateSession()
  }, [session, update])

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowSessionDialog(true)
    } else if (status === "authenticated") {
      setShowSessionDialog(false)
    }

  }, [status])

  const handleLoginRedirect = () => {
    setShowSessionDialog(false)
    router.push('/login')
  }


  return (

    <div className="[font-family:var(--font-inter)] bg-gray-100 dark:bg-[#0f172a] min-h-screen xl:px-32 lg:px-10 md:px-8 px-5 transition-colors duration-300 radix-tooltip-conten">
      <Navbar />
      <Hero />
      <Todos />

      <AlertDialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <LogOut className="h-5 w-5" />
              Session Expired
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Your session has timed out for security reasons. Please sign in again to continue using your todos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">


            <AlertDialogAction
              onClick={handleLoginRedirect}
              className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>

  );

}

export default page
