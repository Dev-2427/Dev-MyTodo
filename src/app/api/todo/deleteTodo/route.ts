import { dbConnect } from "@/lib/db";
import { TodoModel } from "@/models/todoModel";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    await dbConnect()
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return Response.json({
                success: false, message: "Unauthorised"
            }, { status: 401 })
        }


        const { todoId } = await req.json()

        if (!todoId) {
             return Response.json({
                success: false, message: "Todo id is required"
            }, { status: 400 })
        }

        const deleted = await TodoModel.findOneAndDelete({_id: todoId, userId: session.user.id})
        

        if (!deleted) {
            return Response.json({
                success: false, message: "Todo not found"
            }, { status: 404 })
        }

        return Response.json({
            success: true, message: "Todo deleted"
        }, { status: 200 })
    } catch (error) {
        console.log("error deleting todo", error)
        return Response.json({
            success: true, message: "Failed to delete todo"
        }, { status: 500 })
    }
}