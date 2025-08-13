'use client'
import Hero from "@/components/Hero"
import Navbar from "@/components/Navbar"
import Todos from "@/components/Todos";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

function page() {

  const { data: session, update } = useSession()

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
        console.log("Error updating session",error)
      }
    }

    updateSession()
  }, [session, update])

  return (

    <div className="[font-family:var(--font-inter)] bg-gray-100 dark:bg-[#0f172a] min-h-screen xl:px-32 lg:px-10 md:px-8 px-5 transition-colors duration-300 radix-tooltip-conten">
      <Navbar />
      <Hero />
      <Todos />
    </div>

  );

}

export default page
