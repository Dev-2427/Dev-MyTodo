import mongoose from "mongoose";

type connectionObject = {
    isConnected?: number
}

const connection: connectionObject = {}

export async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "")
        connection.isConnected = db.connections[0].readyState

    } catch (error) {
        console.log("database connection failed", error)
    }
}
