import { sendVerifyEmail } from "@/helpers/sendVerifyEmail";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/userModel";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    await dbConnect()

    try {
        const { username, email, password } = await req.json()

        const existingUserByusername = await UserModel.findOne({ username })

        if (existingUserByusername?.isVerified) {
            return Response.json({
                success: false, message: "Username is already taken"
            }, { status: 400 })
        }

        const existingUserByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()



        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false, message: "An account with this email already exists."
                }, { status: 400 })
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)

                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)
                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.password = hashedPassword

                await existingUserByEmail.save()
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                provider: "credentials",
                isVerified: false,
                verifyCode,
                verifyCodeExpiry,
                resetPasswordVerifyExpiry: null,
                resetPasswordCodeExpiry: null
            })

            await newUser.save()
        }

        const sentVerificationMail = await sendVerifyEmail(
            email, username, verifyCode
        )

        if (!sentVerificationMail.success) {
            return Response.json({
                success: false, message: sentVerificationMail.message
            }, { status: 500 })
        }

        return Response.json({
            success: true, message: "User created successfully, Please verify your email"
        }, { status: 201 })
    } catch (error) {
        console.log("Failed to create a user:", error)
        return Response.json({
            success: false, message: "Error creating user"
        }, { status: 500 })
    }
}