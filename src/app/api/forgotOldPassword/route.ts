import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { sendVerifyEmail } from "@/helpers/sendVerificationMailForPassword";

export async function PATCH() {
    await dbConnect()

    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return Response.json({
                success: false, message: "Unauthorized"
            }, { status: 400 })
        }

        const email = session.user.email
        const username = session.user.username

        const existingUserByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (!existingUserByEmail) {
            return Response.json({
                success: false,
                message: "User not found",
            }, { status: 404 });
        }
        existingUserByEmail.resetPasswordCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)
        existingUserByEmail.verifyCode = verifyCode
        existingUserByEmail.resetPasswordVerifyExpiry = null;

        await existingUserByEmail.save()

        const sentVerificationMail = await sendVerifyEmail(
            email, username ?? "User", verifyCode
        )


        if (!sentVerificationMail.success) {
            return Response.json({
                success: false, message: sentVerificationMail.message
            }, { status: 500 })
        }


        return Response.json({
            success: true, message: "Verification code sent successfully, Please verify your email"
        }, { status: 201 })


    } catch (error) {
        console.log("Failed to send verification code:", error)
        return Response.json({
            success: false, message: "Failed to send verification code"
        }, { status: 500 })
    }
}