import { dbConnect } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { UserModel } from "@/models/userModel";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
    await dbConnect()

    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return Response.json({
                success: false, message: "Unauthorized"
            }, { status: 401 })
        }

        const { oldPassword, newPassword } = await req.json()

        const user = await UserModel.findById(session.user.id)

        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (!user.password || user.provider === "google") {
            return Response.json({
                success: false, message: "This account was created with Google. Please sign in with Google."
            }, { status: 400 });
        }

        const isTruePassword = await bcrypt.compare(oldPassword, user.password)

        if (!isTruePassword) {
            return Response.json({
                success: false,
                message: "Invalid password",
            }, { status: 400 });


        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashedPassword

        await user.save()
        return Response.json({
            success: true,
            message: "Password updated successfully",
        }, { status: 200 });


    } catch (error) {
        console.error("Error updating password:", error);
        return Response.json({ success: false, message: "Error updating password" }, { status: 500 });

    }
}