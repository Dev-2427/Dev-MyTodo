import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/userModel";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, code } = await request.json()

        if (typeof username !== "string" || typeof code !== "string" || code.length !== 6) {
            return Response.json({
                success: false,
                message: "Invalid data format.",
            }, { status: 400 });
        }

        const decodedUsername = decodeURIComponent(username)

        const user = await UserModel.findOne({ username: decodedUsername })

        if (!user) {
            return Response.json({
                success: false, message: "Username not found"
            }, { status: 404 })
        }

        const validCode = user.verifyCode === code
        const checkExpiryDate = new Date(user.verifyCodeExpiry!) > new Date()

        if (validCode && checkExpiryDate) {

            user.isVerified = true

            await user.save()

            return Response.json({
                success: true,
                message: "Account verified successfully",
            }, { status: 200 })

        } else if (!checkExpiryDate) {
            return Response.json({
                success: false, message: "Your verification code has expired. Please start the signup process again"
            }, { status: 400 })
        } else {
            return Response.json({
                success: false, message: "Incorrect verification code"
            }, { status: 400 })
        }
    } catch (error) {
        console.log("failed to verify user")
        return Response.json({
            success: false, message: "User verification failed"
        }, { status: 500 })
    }
}
