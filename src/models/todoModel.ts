import mongoose, { Document, Schema } from "mongoose";

export interface Todo extends Document {
    _id: string,
    userId: mongoose.Schema.Types.ObjectId,
    title: string,
    isCompleted: boolean,
    isImportant: boolean,
    dueDate: Date | null
}

const TodoSchema: Schema<Todo> = new Schema({
    _id: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, "Todo title is required"]
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    isImportant: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true , _id: false})

export const TodoModel = (mongoose.models.Todo as mongoose.Model<Todo>) || mongoose.model<Todo>("Todo", TodoSchema)