import mongoose, { Document, Schema, Types } from 'mongoose';

export interface User extends Document {
    _id: Types.ObjectId
    username?: string | null,
    email: string,
    password?: string,
    provider: string,
    providerId?: string,
    isVerified: boolean,
    verifyCode?: string,
    verifyCodeExpiry?: Date,
    resetPasswordCodeExpiry?: Date | null,
    resetPasswordVerifyExpiry?: Date | null,
}

const UserSchema = new Schema<User>({
    username: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: false
    },
    provider: {
        type: String,
        enum: ["google", "credentials", "hybrid"],
        default: 'credentials'
    },
    providerId: {
        type: String,
        unique: true,
        sparse: true
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verifyCode: {
        type: String,
        required: false
    },
    verifyCodeExpiry: {
        type: Date,
        required: false
    },
    resetPasswordCodeExpiry: {
        type: Date,
    },
    resetPasswordVerifyExpiry: {
        type: Date,
    },

}, { timestamps: true })

export const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)