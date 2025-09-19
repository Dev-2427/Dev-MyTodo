import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                identifier: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect()

                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })

                    if (!user) {
                        throw new Error("No user found with this email or username")
                    }


                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login")
                    }


                    if (!user.password || user.provider === "google") {
                        throw new Error("This account was created with Google. Please sign in with Google.");
                    }

                    const correctPassword = await bcrypt.compare(credentials.password, user.password)

                    if (!correctPassword) {
                        throw new Error("Incorrect password")
                    }

                    return {
                        id: String(user._id),
                        email: user.email,
                        username: user.username
                    }
                }

                catch (error) {
                    console.log("Failed to signin:", error)
                    throw new Error("Failed to signin")
                }
            }
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {

            await dbConnect()
            try {
                let desiredUsername = profile?.name?.replace(/\s+/g, "")

                const checkUsernameUnique = await UserModel.findOne({ username: desiredUsername })

                if (checkUsernameUnique) {
                    desiredUsername = undefined
                }

                if (account?.provider === "google") {
                    let existingUser = await UserModel.findOne({ email: user.email })

                    if (!existingUser) {

                        existingUser = await UserModel.create({
                            username: desiredUsername,
                            email: user.email,
                            provider: "google",
                            providerId: account.providerAccountId,
                            isVerified: true,

                        })
                    } else {
                        if (existingUser && existingUser.provider === "credentials") {
                            existingUser.provider = "hybrid",
                                existingUser.providerId = account.providerAccountId

                            await existingUser.save()
                        }
                    }
                    user.id = String(existingUser._id)
                    user.email = existingUser.email
                    user.username = existingUser.username ?? null
                    user.provider = existingUser.provider
                }

                return true;
            } catch (error) {
                console.log("Account creation error on google", error)
                return false
            }
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.email = user.email ?? ""
                token.username = (user as any).username ?? null
                token.provider = user.provider
            }
            if (trigger === "update" && session?.username) {
                token.username = session.username;
            }

            const existingUser = await UserModel.findById(token.sub)
            if (!existingUser) {
                throw new Error('User deleted')
            }
            return token
        },
        async session({ session, token }) {
            session.user.id = token.id
            session.user.email = token.email
            session.user.username = token.username ?? null
            session.user.provider = token.provider
            return session
        }

    },
    secret: process.env.NEXTAUTH_KEY,
    pages: {
        signIn: "/sign-in"
    },
    session: {
        strategy: "jwt"
    }
}
