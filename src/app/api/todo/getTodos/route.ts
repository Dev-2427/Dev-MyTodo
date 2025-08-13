import { dbConnect } from "@/lib/db";
import { TodoModel } from "@/models/todoModel";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(req: Request) {
    await dbConnect()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return Response.json({
            success: false, message: "Unauthorized"
        }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    const sort = searchParams.get("sort")
    const search = searchParams.get("search") || ""

    const words = search.trim().split(/\s+/)

    const regexFilters = words.map((word) => ({
        title: { $regex: word, $options: "i" }
    }))


    const filter: any = { userId: session.user.id }

    if (search) {
        filter.$or = regexFilters
    }

    let sortCondition = {}

    if (sort === "newfirst") {
        sortCondition = { createdAt: -1 }
    } else if (sort === "oldfirst") {
        sortCondition = { createdAt: 1 }
    } else if (sort === "importantfirst") {
        sortCondition = { isImportant: -1, createdAt: -1 }
    } else if (sort === "alphabetically") {
        sortCondition = { title: 1 }
    } else {
        sortCondition = { createdAt: -1 }
    }
    try {
        const todos = await TodoModel.find( filter).collation({ locale: "en", strength: 1 }).sort(sortCondition)

        return Response.json({
            success: true, todos
        }, { status: 200 })
    } catch (error) {
        console.error("Failed to fetch todos:", error);
        return Response.json({
            success: false,
            message: "Failed to fetch todos",
        }, { status: 500 });

    }
}