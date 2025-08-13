import { dbConnect } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { UserModel } from "@/models/userModel";
import { TodoModel } from "@/models/todoModel";

export async function DELETE() {
    await dbConnect()

    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return Response.json({
                success: false, message: "Unauthorized"
            }, {status: 401})
        }


        await TodoModel.deleteMany({userId: session.user.id})
        await UserModel.deleteOne({_id: session.user.id})

        return Response.json({
            success: true, message: "Account deleted"
        },{status:200})
    } catch (error) {
        console.error("failed to delete account", error)
          return Response.json({
            success: false, message: "failed to delete account"
        },{status:500})
    }
}