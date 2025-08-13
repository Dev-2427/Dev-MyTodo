import { sendVerifyEmail } from "@/helpers/sendVerificationMailForPassword";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/userModel";



export async function PATCH(req: Request) {
    await dbConnect()

    try {
        const { email } = await req.json()

        const existingUserByEmail = await UserModel.findOne({ email })

        if (!existingUserByEmail) {
            return Response.json({
                success: false, message: "User not found"
            }, { status: 404 })
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
        const username = existingUserByEmail.username

        existingUserByEmail.resetPasswordCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)
        existingUserByEmail.verifyCode = verifyCode
        existingUserByEmail.resetPasswordVerifyExpiry = null

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