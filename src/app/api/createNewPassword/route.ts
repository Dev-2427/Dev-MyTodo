import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/userModel";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    await dbConnect()

    try {
        const { email, newPassword, confirmNewPassword } = await req.json()

        if (newPassword !== confirmNewPassword) {
            return Response.json({
                success: false, message: "New password and confirm password do not match."
            }, { status: 400 })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return Response.json({
                success: false, message: "User not found"
            }, { status: 404 })
        }

        const isVerified = user.resetPasswordVerifyExpiry && new Date(user.resetPasswordVerifyExpiry) > new Date();

        if (!isVerified) {
            return Response.json({
                success: false, message: "You are not authorized to change the password. Please verify your email again."
            }, { status: 403 })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.resetPasswordCodeExpiry = null
        user.resetPasswordVerifyExpiry = null
        await user.save()

        return Response.json({
            success: true, message: "Password changed successfully"
        }, { status: 200 })
    } catch (error) {
        console.log("failed to change password", error)
        return Response.json({
            success: false, message: "Failed to change password"
        }, { status: 500 })
    }
}