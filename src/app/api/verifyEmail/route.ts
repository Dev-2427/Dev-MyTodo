import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
    await dbConnect()

    try {

        const session = await getServerSession(authOptions)

        if (!session) {
            return Response.json({
                success: false, message: "Unauthorized"
            }, { status: 400 })
        }
        const { code } = await request.json()

        if (typeof code !== "string" || code.length !== 6) {
            return Response.json({
                success: false,
                message: "Invalid data format.",
            }, { status: 400 });
        }

        const email = session.user.email

        const user = await UserModel.findOne({ email })

        if (user) {
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
        } else {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }
    } catch (error) {
        console.log("failed to verify email")
        return Response.json({
            success: false, message: "Email verification failed"
        }, { status: 500 })
    }
}