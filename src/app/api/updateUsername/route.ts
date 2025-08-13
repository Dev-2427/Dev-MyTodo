import { dbConnect } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { UserModel } from "@/models/userModel";

export async function PATCH(req: Request) {

    await dbConnect()

    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return Response.json({
                success: false, message: "Unauthorized"
            }, { status: 401 })
        }

        const { username } = await req.json()

        if (!username || username.length === 0) {
              return Response.json({
                success: false,
                message: "Invalid Username",
            }, { status: 400 });
        }

        const existingUser = await UserModel.findOne({ username })

        if (existingUser && (existingUser as any)._id.toString() !== session.user.id) {
            return Response.json({
                success: false,
                message: "Username already taken",
            }, { status: 400 });
        }

         await UserModel.findOneAndUpdate({ _id: session.user.id },
            { username },
            { new: true }
        )

        return Response.json({
            success: true, message: "Username updated successfully"
        }, { status: 200 })
    } catch (error) {
        console.log("Error updating username", error)
        return Response.json({
            success: false, message: "Failed to update username"
        }, { status: 500 })
    }
}