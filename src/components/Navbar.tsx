import React from 'react'
import { signOut, useSession } from "next-auth/react";
import {
    Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger,
} from "@/components/ui/menubar"
import Link from 'next/link';
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from './ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SettingIcon from '../../icons/SettingIcon';

function Navbar() {

    const { data: session } = useSession()
    const { setTheme } = useTheme()

    return (
        <nav className='flex justify-between items-center py-4'>
            <Link href={session ? "/dashboard" : "/"}>
                <button className="flex justify-center items-center gap-2 cursor-pointer">

                    <img width={25} src="/favicon.ico" />

                    <h1 className='font-bold text-xl text-[#2f3c4a] dark:text-[#F8FAFC]'>My Todo</h1>
                </button>
            </Link>

            <div className="flex justify-center items-center gap-5">
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className='cursor-pointer' variant="link" size="icon">
                                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div>

                    {session &&
                        <Menubar className='bg-transparent shadow-none border-none p-0 m-0'>
                            <MenubarMenu>
                                <MenubarTrigger className='cursor-pointer bg-transparent text-inherit shadow-none border-none outline-none ring-0 hover:bg-transparent focus:bg-transparent p-0 m-0 h-auto w-auto min-w-0 min-h-0 rounded-none data-[state=open]:bg-transparent data-[state=open]:text-black dark:data-[state=open]:bg-transparent dark:data-[state=open]:text-white'
                                > <SettingIcon /></MenubarTrigger>

                                <MenubarContent align='end'>

                                    <Link href='/account'><MenubarItem className='cursor-pointer'>Account Settings </MenubarItem></Link>
                                    <MenubarSeparator />
                                    <MenubarItem className='w-full cursor-pointer' onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</MenubarItem>
                                </MenubarContent>

                            </MenubarMenu>
                        </Menubar>
                    }
                </div>
            </div>
        </nav>
    )
}

export default Navbar
