import { dbConnect } from "@/lib/db";
import { TodoModel } from "@/models/todoModel";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function PATCH(req: Request) {
    await dbConnect()
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return Response.json({
                success: false, message: "Unauthorised"
            }, { status: 401 })
        }


        const { todoId, isCompleted } = await req.json()

        const todo = await TodoModel.findOneAndUpdate({ _id: todoId, userId: session.user.id },
            { isCompleted },
            { new: true }
        )

        if (!todo) {
            return Response.json({
                success: false, message: "Todo not found"
            }, { status: 404 })
        }

        return Response.json({
            success: true, message: "Todo completion status updated"
        }, { status: 200 })
    } catch (error) {
        console.log("error updating completion", error)
        return Response.json({
            success: true, message: "Failed to update completion"
        }, { status: 500 })
    }
}