'use client'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { createTodoSchema } from "@/schemas/createTodoSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useDebounceCallback } from 'usehooks-ts';
import { Toggle } from './ui/toggle';
import { Skeleton } from "@/components/ui/skeleton"
import { v4 as uuidv4 } from "uuid"
import { useTheme } from 'next-themes';

type Todo = {
    _id: string;
    title: string;
    isCompleted: boolean;
    isImportant: boolean;
    createdAt: string;
    updatedAt: string
};

type FetchTodosParams = {
    sort?: string;
    search?: string;
};

function Todos() {

    const [todos, setTodos] = useState<Todo[]>([])
    const [title, setTitle] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editable, setEditable] = useState<string | null>(null)
    const [isImportant, setIsImportant] = useState(false)
    const [option, setOption] = useState("newfirst")
    const [searchQuery, setSearchQuery] = useState("")
    const [noTodosFound, setNoTodosFound] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showImportantOnly, setShowImportantOnly] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [list, setList] = useState(false)

    function playSound(src: string) {
        const audio = new Audio(src);
        audio.play();
    }

    async function fetchTodos({ sort = option, search = searchQuery }: FetchTodosParams = {}) {

        setIsLoading(true)

        try {
            const res = await axios.get('/api/todo/getTodos', {
                params: { sort, search }
            })

            if (res.data.success) {
                setTodos(res.data.todos)

                if (search.trim() !== "" && res.data.todos.length === 0) {
                    setNoTodosFound(true);
                } else {
                    setNoTodosFound(false);
                }
            }

        } catch (error) {
            console.error('Failed to fetch todos:', error);

        } finally {
            setIsLoading(false)
        }
    }

    const visibleTodos = todos.filter((todo) => {
        if (showImportantOnly && !todo.isImportant) return false
        if (showCompleted && !todo.isCompleted) return false
        if (isPending && todo.isCompleted) return false
        return true
    }
    )

    useEffect(() => {
        fetchTodos({ sort: option });
    }, []);

    const resultsRef = useRef<HTMLDivElement>(null);

    const debouncedSearch = useDebounceCallback((query: string) => {
        fetchTodos({ sort: option, search: query })
        if (resultsRef.current) {
            const y = resultsRef.current.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    }, 300)


    async function deleteTodo(todoId: string) {

        setTodos((prev => prev.filter(todo => todo._id !== todoId)))
        playSound("sounds/delete.wav")
        try {
            const res = await axios.post('/api/todo/deleteTodo', { todoId })

            if (!res.data.success) {
                toast.error(res.data.message, { duration: 5000 })
                fetchTodos({ sort: option })
            }
        } catch (error) {
            toast.error("Something went wrong", { duration: 5000 })
            fetchTodos({ sort: option })
        }
    }

    async function editTodo(todoId: string, title: string, originalTitle: string) {

        const prevTodos = [...todos]

        const trimmedTitle = title.trim()

        if (!trimmedTitle || trimmedTitle === originalTitle.trim()) {
            return;
        }

        setTodos((prev) =>
            prev.map((todo) =>
                todo._id === todoId ? { ...todo, title, updatedAt: new Date().toISOString() } : todo
            )
        )

        try {
            const res = await axios.patch('/api/todo/todoTitle', { todoId, title })

            if (!res.data.success) {
                toast.error(res.data.message, { duration: 5000 })
                setTodos(prevTodos)
            }
        } catch (error) {
           toast.error("Something went wrong", { duration: 5000 })
            setTodos(prevTodos)
        }
    }

    async function setImportance(todoId: string, isImportant: boolean) {

        setTodos((prev) =>
            prev.map((todo) =>
                todo._id === todoId ? { ...todo, isImportant } : todo))

        playSound(isImportant ? "sounds/important.wav" : "sounds/important.wav")

        try {
            const res = await axios.patch('/api/todo/todoImportance', { todoId, isImportant })

            if (!res.data.success) {
                toast.error(res.data.message, { duration: 5000 })
                fetchTodos({ sort: option })
            }
        } catch (error) {
            toast.error("Something went wrong", { duration: 5000 })
            fetchTodos({ sort: option })
        }
    }

    async function setCompleted(todoId: string, isCompleted: boolean) {

        setTodos((prev) => prev.map((todo) => todo._id === todoId ? { ...todo, isCompleted } : todo))

        if (isCompleted && editable === todoId) {
            setEditable(null);
        }
        try {
            const res = await axios.patch('/api/todo/todoIsCompleted', { todoId, isCompleted })


            if (!res.data.success) {
                toast.error(res.data.message, { duration: 5000 })
                fetchTodos({ sort: option })
            }

        } catch (error) {
           toast.error("Something went wrong", { duration: 5000 })
            fetchTodos({ sort: option })
        }
    }

    const form = useForm<z.infer<typeof createTodoSchema>>({
        resolver: zodResolver(createTodoSchema),
        defaultValues: {
            title: "",
            isImportant: false
        },
    })

    async function onSubmit(data: z.Infer<typeof createTodoSchema>) {

        const tempId = uuidv4()

        const newTodo = {
            _id: tempId,
            title: data.title,
            isImportant,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        setTodos(prev => [newTodo, ...prev])
        setIsImportant(false)
        form.reset()

        try {

            const result = await axios.post('/api/todo/createTodo', { ...data, isImportant, _id: tempId })

            if (!result.data.success) {
                toast.error(result.data.message, { duration: 5000 })
                setTodos(prev => prev.filter(todo => todo._id !== tempId))
            }


        } catch (error) {
            toast.error("Something went wrong", { duration: 5000 })
            setTodos(prev => prev.filter(todo => todo._id !== tempId))
        }
    }


    const { theme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    const lightColors = ['#e8e3f8', '#dcf8fa', '#fce4f3', '#fcece4'];

    const darkColors = ["#112345", "#0c122a", "#191628", "#1d1c23",
    ];


    const currentTheme = theme === "system" ? systemTheme : theme

    const colors = currentTheme === "dark" ? darkColors : lightColors

    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) {
        return null
    }


    function renderContent() {

        if (isLoading) {
            return Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                    key={index}
                    className="h-32 rounded-lg bg-gray-200 dark:bg-gray-800"
                />
            ))
        }

        if (!isLoading && visibleTodos.length === 0) {
            return (
                <div className="col-span-full text-center text-gray-500 mt-10 text-lg">
                    No todos found.
                </div>
            );
        }

        if (noTodosFound) {
            return (
                <div className="col-span-full text-center text-gray-500 mt-10 text-lg">
                    No todos found.
                </div>
            )
        }

        return visibleTodos.map((todo, index) => (
            <motion.div
                layout
                layoutId={todo._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={todo._id} className={`flex flex-col justify-between rounded-lg overflow-hidden shadow-md ${list ? "h-fit" : "h-32"}`}
                style={{ backgroundColor: colors[index % colors.length] }}
            >

                <div className={`flex flex-col justify-between`}>
                    <textarea
                        onChange={(e) => { setTitle(e.target.value) }}
                        defaultValue={todo.title}
                        readOnly={editable !== todo._id}

                        className={`min-w-[200px] border-none rounded-lg px-4 py-2 text-base ${editable === todo._id && !todo.isCompleted ? " outline-none" : "focus-visible:ring-0 outline-none"} text-black dark:text-[#f8fafc] ${todo.isCompleted && "line-through opacity-50 dark:text-[#94a3b8]"} overflow-y-auto scrollbar-thin resize-none whitespace-pre-wrap break-words max-h-[55px] mb-4 custom-scrollbar`}

                    />

                    <div className="date text-gray-500 dark:text-[#e2e8f0] px-4 text-sm">
                        {new Date(todo.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        })}
                    </div>
                </div>

                <div className="flex gap-3 p-2 justify-between items-center">

                    <div className='flex items-center justify-center gap-3'>
                        {!todo.isCompleted && editable === todo._id ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button onClick={() => { editTodo(todo._id, title, todo.title), setEditable(null) }} className='cursor-pointer'>
                                        <svg width="17" height="17" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="stroke-black stroke-[0.5]">
                                            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                                        </svg>


                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className='hidden xl:flex'>
                                    <p>Save</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button onClick={() => {
                                        if (!todo.isCompleted) {
                                            setEditable(todo._id)
                                        }
                                    }
                                    }
                                        disabled={todo.isCompleted}
                                        className={` ${todo.isCompleted ? "opacity-50 cursor-not-allowed dark:text-[#cbd5e1]" : "cursor-pointer"}`}>
                                        <svg width="17"
                                            height="17" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>

                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className='hidden xl:flex'>
                                    <p>{todo.isCompleted ? "Cannot edit completed todo" : "Edit"}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}



                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button onClick={() => deleteTodo(todo._id)} className='cursor-pointer' >
                                    <svg width="17" height="17" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className='hidden xl:flex'>
                                <p>Delete</p>
                            </TooltipContent>
                        </Tooltip>

                    </div>

                    <div className='flex justify-center items-center gap-3'>


                        {todo.isImportant ? (

                            <Tooltip>
                                <TooltipTrigger asChild className='cursor-pointer'>
                                    <button onClick={() =>
                                        setImportance(todo._id, false)}>
                                        <svg width="17" height="17" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.22303 0.665992C7.32551 0.419604 7.67454 0.419604 7.77702 0.665992L9.41343 4.60039C9.45663 4.70426 9.55432 4.77523 9.66645 4.78422L13.914 5.12475C14.18 5.14607 14.2878 5.47802 14.0852 5.65162L10.849 8.42374C10.7636 8.49692 10.7263 8.61176 10.7524 8.72118L11.7411 12.866C11.803 13.1256 11.5206 13.3308 11.2929 13.1917L7.6564 10.9705C7.5604 10.9119 7.43965 10.9119 7.34365 10.9705L3.70718 13.1917C3.47945 13.3308 3.19708 13.1256 3.25899 12.866L4.24769 8.72118C4.2738 8.61176 4.23648 8.49692 4.15105 8.42374L0.914889 5.65162C0.712228 5.47802 0.820086 5.14607 1.08608 5.12475L5.3336 4.78422C5.44573 4.77523 5.54342 4.70426 5.58662 4.60039L7.22303 0.665992Z" fill="currentColor"></path></svg>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className='hidden xl:flex'>
                                    <p>Unmark as Important</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild className='cursor-pointer'>
                                    <button onClick={() => setImportance(todo._id, true)}>
                                        <svg width="17" height="17" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.97942 1.25171L6.9585 1.30199L5.58662 4.60039C5.54342 4.70426 5.44573 4.77523 5.3336 4.78422L1.7727 5.0697L1.71841 5.07405L1.38687 5.10063L1.08608 5.12475C0.820085 5.14607 0.712228 5.47802 0.914889 5.65162L1.14406 5.84793L1.39666 6.06431L1.43802 6.09974L4.15105 8.42374C4.23648 8.49692 4.2738 8.61176 4.24769 8.72118L3.41882 12.196L3.40618 12.249L3.32901 12.5725L3.25899 12.866C3.19708 13.1256 3.47945 13.3308 3.70718 13.1917L3.9647 13.0344L4.24854 12.861L4.29502 12.8326L7.34365 10.9705C7.43965 10.9119 7.5604 10.9119 7.6564 10.9705L10.705 12.8326L10.7515 12.861L11.0354 13.0344L11.2929 13.1917C11.5206 13.3308 11.803 13.1256 11.7411 12.866L11.671 12.5725L11.5939 12.249L11.5812 12.196L10.7524 8.72118C10.7263 8.61176 10.7636 8.49692 10.849 8.42374L13.562 6.09974L13.6034 6.06431L13.856 5.84793L14.0852 5.65162C14.2878 5.47802 14.18 5.14607 13.914 5.12475L13.6132 5.10063L13.2816 5.07405L13.2274 5.0697L9.66645 4.78422C9.55432 4.77523 9.45663 4.70426 9.41343 4.60039L8.04155 1.30199L8.02064 1.25171L7.89291 0.944609L7.77702 0.665992C7.67454 0.419604 7.32551 0.419604 7.22303 0.665992L7.10715 0.944609L6.97942 1.25171ZM7.50003 2.60397L6.50994 4.98442C6.32273 5.43453 5.89944 5.74207 5.41351 5.78103L2.84361 5.98705L4.8016 7.66428C5.17183 7.98142 5.33351 8.47903 5.2204 8.95321L4.62221 11.461L6.8224 10.1171C7.23842 9.86302 7.76164 9.86302 8.17766 10.1171L10.3778 11.461L9.77965 8.95321C9.66654 8.47903 9.82822 7.98142 10.1984 7.66428L12.1564 5.98705L9.58654 5.78103C9.10061 5.74207 8.67732 5.43453 8.49011 4.98442L7.50003 2.60397Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className='hidden xl:flex'>
                                    <p>Mark as Important</p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild className='cursor-pointer'>
                                <Checkbox
                                    checked={todo.isCompleted}
                                    onCheckedChange={() => setCompleted(todo._id, !todo.isCompleted)}
                                    className='border-black bg-transparent dark:border-slate-500 transition-colors' />
                            </TooltipTrigger>
                            <TooltipContent className='hidden xl:flex'>
                                <p>{todo.isCompleted ? "Mark as pending" : "Mark as completed"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                </div>
            </motion.div>
        )
        )


    }
    return (
        <div>

            <div className="addTodo w-full bg-[#ffffff] dark:bg-[#1e293b] rounded-lg md:my-4 my-3 shadow-lg">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex gap-3 justify-center items-center w-full px-3.5 py-3.5"
                    >
                        {isImportant ? (
                            <Tooltip>
                                <TooltipTrigger asChild className='cursor-pointer'>
                                    <button type='button' onClick={() =>
                                        setIsImportant(false)

                                    }>
                                        <svg width="17" height="17" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.22303 0.665992C7.32551 0.419604 7.67454 0.419604 7.77702 0.665992L9.41343 4.60039C9.45663 4.70426 9.55432 4.77523 9.66645 4.78422L13.914 5.12475C14.18 5.14607 14.2878 5.47802 14.0852 5.65162L10.849 8.42374C10.7636 8.49692 10.7263 8.61176 10.7524 8.72118L11.7411 12.866C11.803 13.1256 11.5206 13.3308 11.2929 13.1917L7.6564 10.9705C7.5604 10.9119 7.43965 10.9119 7.34365 10.9705L3.70718 13.1917C3.47945 13.3308 3.19708 13.1256 3.25899 12.866L4.24769 8.72118C4.2738 8.61176 4.23648 8.49692 4.15105 8.42374L0.914889 5.65162C0.712228 5.47802 0.820086 5.14607 1.08608 5.12475L5.3336 4.78422C5.44573 4.77523 5.54342 4.70426 5.58662 4.60039L7.22303 0.665992Z" fill="currentColor"></path></svg>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className='hidden xl:flex'>
                                    <p>Unmark as Important</p>
                                </TooltipContent>
                            </Tooltip>
                        ) :
                            (
                                <Tooltip>
                                    <TooltipTrigger asChild className='cursor-pointer'>
                                        <button type='button' onClick={() => setIsImportant(true)}>
                                            <svg width="17" height="17" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.97942 1.25171L6.9585 1.30199L5.58662 4.60039C5.54342 4.70426 5.44573 4.77523 5.3336 4.78422L1.7727 5.0697L1.71841 5.07405L1.38687 5.10063L1.08608 5.12475C0.820085 5.14607 0.712228 5.47802 0.914889 5.65162L1.14406 5.84793L1.39666 6.06431L1.43802 6.09974L4.15105 8.42374C4.23648 8.49692 4.2738 8.61176 4.24769 8.72118L3.41882 12.196L3.40618 12.249L3.32901 12.5725L3.25899 12.866C3.19708 13.1256 3.47945 13.3308 3.70718 13.1917L3.9647 13.0344L4.24854 12.861L4.29502 12.8326L7.34365 10.9705C7.43965 10.9119 7.5604 10.9119 7.6564 10.9705L10.705 12.8326L10.7515 12.861L11.0354 13.0344L11.2929 13.1917C11.5206 13.3308 11.803 13.1256 11.7411 12.866L11.671 12.5725L11.5939 12.249L11.5812 12.196L10.7524 8.72118C10.7263 8.61176 10.7636 8.49692 10.849 8.42374L13.562 6.09974L13.6034 6.06431L13.856 5.84793L14.0852 5.65162C14.2878 5.47802 14.18 5.14607 13.914 5.12475L13.6132 5.10063L13.2816 5.07405L13.2274 5.0697L9.66645 4.78422C9.55432 4.77523 9.45663 4.70426 9.41343 4.60039L8.04155 1.30199L8.02064 1.25171L7.89291 0.944609L7.77702 0.665992C7.67454 0.419604 7.32551 0.419604 7.22303 0.665992L7.10715 0.944609L6.97942 1.25171ZM7.50003 2.60397L6.50994 4.98442C6.32273 5.43453 5.89944 5.74207 5.41351 5.78103L2.84361 5.98705L4.8016 7.66428C5.17183 7.98142 5.33351 8.47903 5.2204 8.95321L4.62221 11.461L6.8224 10.1171C7.23842 9.86302 7.76164 9.86302 8.17766 10.1171L10.3778 11.461L9.77965 8.95321C9.66654 8.47903 9.82822 7.98142 10.1984 7.66428L12.1564 5.98705L9.58654 5.78103C9.10061 5.74207 8.67732 5.43453 8.49011 4.98442L7.50003 2.60397Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className='hidden xl:flex'>
                                        <p>Mark as Important</p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        }

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Add Todo"
                                        spellCheck={false}
                                        className="w-full bg-gray-100 dark:bg-[#0f172a] text-[#0F172A] dark:text-[#f1f5f9] border-none rounded-lg px-4 py-2 text-base placeholder:text-gray-500 "
                                    />
                                </FormControl>
                            )}
                        />

                        <Button
                            type="submit"
                            className="bg-[#4278d4] dark:bg-[#3b82f6] px-4 py-2 rounded-lg text-white hover:bg-[#2f62b3] dark:hover:bg-[#2563eb] transition-all flex items-center justify-center cursor-pointer"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin " />
                                </>
                            ) : (
                                "Add"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>


            <div className="tools md:mb-4 mb-3 flex justify-between items-center xl:flex-row flex-col xl:gap-0 md:gap-5 gap-3">
                <div ref={resultsRef} className="search relative w-full">

                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white"
                        width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <input
                        value={searchQuery}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchQuery(value);
                            debouncedSearch(value)
                        }}
                        type="text"
                        placeholder="Search todos..."
                        className="bg-[#ffffff] dark:bg-[#031326] text-[#1e293b] dark:text-white rounded-lg pl-10 py-2 text-base  placeholder:text-gray-500  border xl:w-[80%] w-full"
                    />
                </div>

                <div className="buttons flex md:flex-nowrap flex-wrap justify-center items-center gap-3">

                    <div className='sort'>
                        <Select
                            defaultValue="newfirst"
                            onValueChange={(value) => {
                                setOption(value);
                                fetchTodos({ sort: value });
                            }}
                        >
                            <SelectTrigger className="w-fit bg-white  text-black font-medium cursor-pointer dark:border-[#334155] dark:bg-[#1e293b] dark:hover:bg-[#334155] dark:hover:text-[#f1f5f9] dark:text-[#e2e8f0]" >
                                <SelectValue />
                            </SelectTrigger>


                            <SelectContent>

                                <SelectItem className='cursor-pointer' value="importantfirst">
                                    <svg width="17" height="17" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.97942 1.25171L6.9585 1.30199L5.58662 4.60039C5.54342 4.70426 5.44573 4.77523 5.3336 4.78422L1.7727 5.0697L1.71841 5.07405L1.38687 5.10063L1.08608 5.12475C0.820085 5.14607 0.712228 5.47802 0.914889 5.65162L1.14406 5.84793L1.39666 6.06431L1.43802 6.09974L4.15105 8.42374C4.23648 8.49692 4.2738 8.61176 4.24769 8.72118L3.41882 12.196L3.40618 12.249L3.32901 12.5725L3.25899 12.866C3.19708 13.1256 3.47945 13.3308 3.70718 13.1917L3.9647 13.0344L4.24854 12.861L4.29502 12.8326L7.34365 10.9705C7.43965 10.9119 7.5604 10.9119 7.6564 10.9705L10.705 12.8326L10.7515 12.861L11.0354 13.0344L11.2929 13.1917C11.5206 13.3308 11.803 13.1256 11.7411 12.866L11.671 12.5725L11.5939 12.249L11.5812 12.196L10.7524 8.72118C10.7263 8.61176 10.7636 8.49692 10.849 8.42374L13.562 6.09974L13.6034 6.06431L13.856 5.84793L14.0852 5.65162C14.2878 5.47802 14.18 5.14607 13.914 5.12475L13.6132 5.10063L13.2816 5.07405L13.2274 5.0697L9.66645 4.78422C9.55432 4.77523 9.45663 4.70426 9.41343 4.60039L8.04155 1.30199L8.02064 1.25171L7.89291 0.944609L7.77702 0.665992C7.67454 0.419604 7.32551 0.419604 7.22303 0.665992L7.10715 0.944609L6.97942 1.25171ZM7.50003 2.60397L6.50994 4.98442C6.32273 5.43453 5.89944 5.74207 5.41351 5.78103L2.84361 5.98705L4.8016 7.66428C5.17183 7.98142 5.33351 8.47903 5.2204 8.95321L4.62221 11.461L6.8224 10.1171C7.23842 9.86302 7.76164 9.86302 8.17766 10.1171L10.3778 11.461L9.77965 8.95321C9.66654 8.47903 9.82822 7.98142 10.1984 7.66428L12.1564 5.98705L9.58654 5.78103C9.10061 5.74207 8.67732 5.43453 8.49011 4.98442L7.50003 2.60397Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    Important First
                                </SelectItem>

                                <SelectItem className='cursor-pointer' value="alphabetically"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                                    <path fillRule="evenodd" d="M2.24 6.8a.75.75 0 0 0 1.06-.04l1.95-2.1v8.59a.75.75 0 0 0 1.5 0V4.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L2.2 5.74a.75.75 0 0 0 .04 1.06Zm8 6.4a.75.75 0 0 0-.04 1.06l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75a.75.75 0 0 0-1.5 0v8.59l-1.95-2.1a.75.75 0 0 0-1.06-.04Z" clipRule="evenodd" />
                                </svg>
                                    Alphabetically</SelectItem>

                                <SelectItem className='cursor-pointer' value="newfirst">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                                        <path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />
                                        <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                                    </svg>

                                    Newest First</SelectItem>


                                <SelectItem className='cursor-pointer' value="oldfirst">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                                        <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v12.59l1.95-2.1a.75.75 0 1 1 1.1 1.02l-3.25 3.5a.75.75 0 0 1-1.1 0l-3.25-3.5a.75.75 0 1 1 1.1-1.02l1.95 2.1V2.75A.75.75 0 0 1 10 2Z" clipRule="evenodd" />
                                    </svg>

                                    Oldest First
                                </SelectItem>
                            </SelectContent>

                        </Select>

                    </div>

                    <div className="important bg-[#ffffff] dark:bg-[#1e293b] dark:border-[#334155] rounded-lg border font-medium">

                        <Toggle pressed={showImportantOnly} onPressedChange={(val) => {
                            setShowImportantOnly(val);

                        }} className='cursor-pointer text-black hover:text-black dark:hover:bg-[#334155] dark:hover:text-[#f1f5f9] dark:text-[#e2e8f0] transition-all duration-200 ease-in-out

                         dark:data-[state=on]:bg-[#334155] 
             dark:data-[state=on]:text-white
             '>

                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.97942 1.25171L6.9585 1.30199L5.58662 4.60039C5.54342 4.70426 5.44573 4.77523 5.3336 4.78422L1.7727 5.0697L1.71841 5.07405L1.38687 5.10063L1.08608 5.12475C0.820085 5.14607 0.712228 5.47802 0.914889 5.65162L1.14406 5.84793L1.39666 6.06431L1.43802 6.09974L4.15105 8.42374C4.23648 8.49692 4.2738 8.61176 4.24769 8.72118L3.41882 12.196L3.40618 12.249L3.32901 12.5725L3.25899 12.866C3.19708 13.1256 3.47945 13.3308 3.70718 13.1917L3.9647 13.0344L4.24854 12.861L4.29502 12.8326L7.34365 10.9705C7.43965 10.9119 7.5604 10.9119 7.6564 10.9705L10.705 12.8326L10.7515 12.861L11.0354 13.0344L11.2929 13.1917C11.5206 13.3308 11.803 13.1256 11.7411 12.866L11.671 12.5725L11.5939 12.249L11.5812 12.196L10.7524 8.72118C10.7263 8.61176 10.7636 8.49692 10.849 8.42374L13.562 6.09974L13.6034 6.06431L13.856 5.84793L14.0852 5.65162C14.2878 5.47802 14.18 5.14607 13.914 5.12475L13.6132 5.10063L13.2816 5.07405L13.2274 5.0697L9.66645 4.78422C9.55432 4.77523 9.45663 4.70426 9.41343 4.60039L8.04155 1.30199L8.02064 1.25171L7.89291 0.944609L7.77702 0.665992C7.67454 0.419604 7.32551 0.419604 7.22303 0.665992L7.10715 0.944609L6.97942 1.25171ZM7.50003 2.60397L6.50994 4.98442C6.32273 5.43453 5.89944 5.74207 5.41351 5.78103L2.84361 5.98705L4.8016 7.66428C5.17183 7.98142 5.33351 8.47903 5.2204 8.95321L4.62221 11.461L6.8224 10.1171C7.23842 9.86302 7.76164 9.86302 8.17766 10.1171L10.3778 11.461L9.77965 8.95321C9.66654 8.47903 9.82822 7.98142 10.1984 7.66428L12.1564 5.98705L9.58654 5.78103C9.10061 5.74207 8.67732 5.43453 8.49011 4.98442L7.50003 2.60397Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                            <span className='dark:text-[#e2e8f0] dark:hover:text-[#f1f5f9]'>Important Only</span>
                        </Toggle>

                    </div>


                    <div className="Completed bg-[#ffffff] dark:bg-[#1e293b] dark:hover:bg-[#334155] dark:border-[#334155] rounded-lg border font-medium">

                        <Toggle pressed={showCompleted} onPressedChange={(val) => {
                            setIsPending(false);
                            setShowCompleted(val);
                        }} className='cursor-pointer text-black hover:text-black dark:hover:bg-[#334155] dark:hover:text-[#f1f5f9] dark:text-[#e2e8f0]
                        
                         dark:data-[state=on]:bg-[#334155] 
             dark:data-[state=on]:text-white'>

                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                            <span className='dark:text-[#e2e8f0]'>Completed</span>
                        </Toggle>

                    </div>

                    <div className="pending bg-[#ffffff] rounded-lg dark:bg-[#1e293b] dark:border-[#334155] border font-medium">

                        <Toggle pressed={isPending} onPressedChange={(val) => {
                            setShowCompleted(false);
                            setIsPending(val);
                        }} className='cursor-pointer text-black hover:text-black dark:hover:bg-[#334155] dark:text-[#e2e8f0]
                        
                         dark:data-[state=on]:bg-[#334155] 
             dark:data-[state=on]:text-white'>

                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.50009 0.877014C3.84241 0.877014 0.877258 3.84216 0.877258 7.49984C0.877258 11.1575 3.8424 14.1227 7.50009 14.1227C11.1578 14.1227 14.1229 11.1575 14.1229 7.49984C14.1229 3.84216 11.1577 0.877014 7.50009 0.877014ZM1.82726 7.49984C1.82726 4.36683 4.36708 1.82701 7.50009 1.82701C10.6331 1.82701 13.1729 4.36683 13.1729 7.49984C13.1729 10.6328 10.6331 13.1727 7.50009 13.1727C4.36708 13.1727 1.82726 10.6328 1.82726 7.49984ZM8 4.50001C8 4.22387 7.77614 4.00001 7.5 4.00001C7.22386 4.00001 7 4.22387 7 4.50001V7.50001C7 7.63262 7.05268 7.7598 7.14645 7.85357L9.14645 9.85357C9.34171 10.0488 9.65829 10.0488 9.85355 9.85357C10.0488 9.65831 10.0488 9.34172 9.85355 9.14646L8 7.29291V4.50001Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            <span className='dark:text-[#e2e8f0] dark:hover:text-[#f1f5f9]'>Pending</span>
                        </Toggle>

                    </div>

                    <div className="list hidden md:flex bg-[#ffffff] dark:bg-[#1e293b] dark:border-[#334155] rounded-lg border font-medium">

                        <Toggle pressed={list} onPressedChange={(val) => {
                            setList(val);
                        }} className='cursor-pointer text-black hover:text-black dark:hover:bg-[#334155] dark:hover:text-[#f1f5f9] dark:text-[#e2e8f0]
                        
                         dark:data-[state=on]:bg-[#334155] 
             dark:data-[state=on]:text-white'>

                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2H13.5C13.7761 2 14 2.22386 14 2.5V12.5C14 12.7761 13.7761 13 13.5 13H8V2ZM7 2H1.5C1.22386 2 1 2.22386 1 2.5V12.5C1 12.7761 1.22386 13 1.5 13H7V2ZM0 2.5C0 1.67157 0.671573 1 1.5 1H13.5C14.3284 1 15 1.67157 15 2.5V12.5C15 13.3284 14.3284 14 13.5 14H1.5C0.671573 14 0 13.3284 0 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            <span className='dark:text-[#e2e8f0]'>List view</span>
                        </Toggle>

                    </div>
                </div>

            </div>




            <div className={`todos ${!list
                ? "grid lg:grid-cols-4 sm:grid-cols-2 gap-4 max-h-[90vh]"
                : "space-y-3 max-h-[88vh]"
                } pb-5 overflow-y-auto scrollbar-hover`}
            >
                <AnimatePresence>
                    {renderContent()}
                </AnimatePresence>
            </div>

        </div>
    );
}

export default Todos
