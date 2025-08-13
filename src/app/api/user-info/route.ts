import { dbConnect } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { UserModel } from "@/models/userModel";

export async function GET() {
    await dbConnect()

    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return Response.json({
                success: false, message: "Unauthorized"
            }, { status: 401 })
        }

        const user = await UserModel.findById(session.user.id)

        if (!user) {
            return Response.json({
                success: false, message: "User not found"
            }, { status: 404 })
        }

        const username = user.username

        return Response.json({
            success: true, username
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false, message: "Data fetching failed"
        }, { status: 400 })
    }
}