import z, { treeifyError } from "zod";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/userModel";
import { usernameValidation } from "@/schemas/signupSchema";

const usernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)

        const usernameQuery = {
            username: searchParams.get("username")
        }
        
        const result = usernameQuerySchema.safeParse(usernameQuery)
        if (!result.success) {
            const formated = treeifyError(result.error)
            const usernameError = formated.properties?.username?.errors || [];

            return Response.json({
                success: false, message: usernameError?.length > 0 ? usernameError.join(", ") : "Invalid or missing username"
            }, { status: 400 })
        }

        const { username } = result.data

        const userExist = await UserModel.findOne({ username, isVerified: true })


        if (userExist) {
            return Response.json({
                success: false, message: "Username is already taken"
            }, { status: 400 })
        }

        return Response.json({
            success: true, message: "Username is available"
        }, { status: 200 })
    } catch (error) {
        console.log("error checking username", error)

        return Response.json({
            success: false, message: "Error checking username"
        }, { status: 500 })
    }
}