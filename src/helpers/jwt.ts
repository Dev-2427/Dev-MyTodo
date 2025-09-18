import jwt from 'jsonwebtoken'

interface LoginTokenPayload {
    sub: string
}

const JWT_SECRET = process.env.NEXTAUTH_KEY as string

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in env')
}

export function createLoginToken(userId: string): string {
    const payload: LoginTokenPayload = { sub: userId }

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1m' })
}

export function verifyLoginToken(token: string): LoginTokenPayload {
    return jwt.verify(token, JWT_SECRET) as LoginTokenPayload
}
