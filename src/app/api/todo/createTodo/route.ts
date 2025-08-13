import { dbConnect } from "@/lib/db";
import { getServerSession } from "next-auth";
import { TodoModel } from "@/models/todoModel";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(req: Request) {
    await dbConnect()
    try {

        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return Response.json({
                success: false, message: "Unauthorized"
            }, { status: 401 })
        }

        const { title, isImportant, _id } = await req.json()

        if (!title || typeof title !== 'string') {
            return Response.json({ success: false, message: "Invalid title" }, { status: 400 })
        }
        if (!_id || typeof _id !== 'string') {
            return Response.json({ success: false, message: "Invalid id" }, { status: 400 })
        }

        await TodoModel.create({
            _id,
            userId: session.user.id,
            title,
            isCompleted: false,
            isImportant
        })

        return Response.json({
            success: true, message: "Todo created successfully,"
        }, { status: 201 })

    } catch (error) {
        console.log("error creating new todo", error)
        return Response.json({
            success: false, message: "Failed to create todo"
        }, { status: 500 })
    }


}