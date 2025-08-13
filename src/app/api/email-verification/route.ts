import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/userModel";

export async function POST(req: Request) {
    await dbConnect()

    try {
        const { email, code } = await req.json()

        if (typeof code !== "string" || code.length !== 6) {
            return Response.json({
                success: false,
                message: "Invalid data format.",
            }, { status: 400 });
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return Response.json({
                success: false, message: "User not found"
            }, { status: 404 })
        }

        const validCode = user.verifyCode === code
        const checkExpiryDate = user.resetPasswordCodeExpiry ? new Date(user.resetPasswordCodeExpiry) > new Date() : false

        if (validCode && checkExpiryDate) {
            user.resetPasswordVerifyExpiry = new Date(Date.now() + 10 * 60 * 1000)
            await user.save()

            return Response.json({
                success: true,
                message: "Email verified successfully"
            }, { status: 200 })
        } else if (!checkExpiryDate) {
            return Response.json({
                success: false, message: "Your verification code has expired. Please start the process again"
            }, { status: 400 })
        } else {
            return Response.json({
                success: false, message: "Incorrect verification code"
            }, { status: 400 })
        }
    } catch (error) {
        console.log("failed to verify email", error)
        return Response.json({
            success: false, message: "Email verification failed"
        }, { status: 500 })
    }
}