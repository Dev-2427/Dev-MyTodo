import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_KEY })

    const url = request.nextUrl

    if (
        token &&
        (url.pathname.startsWith('/login') ||
            url.pathname.startsWith('/signup') ||
            url.pathname.startsWith('/change-password') ||
            url.pathname.startsWith('/email-verification') ||
            url.pathname === '/' ||
            (url.pathname.startsWith('/verify') && !url.pathname.startsWith('/verify-email'))
        )
    ) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }


    if (!token &&
        (url.pathname.startsWith('/dashboard') ||
            url.pathname.startsWith('/account') ||
            url.pathname.startsWith('/password-reset') ||
            url.pathname.startsWith('/set-username') ||
            url.pathname.startsWith('/verify-email'))
    ) {
        return NextResponse.redirect(new URL('/login', request.url));
    }


    if (token && !token.username && !url.pathname.startsWith("/set-username")) {
        return NextResponse.redirect(new URL('/set-username', request.url))
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/account',
        '/change-password',
        '/dashboard',
        '/email-verification',
        '/login',
        '/password-reset',
        '/set-username',
        '/signup',
        '/verify',
        '/verify-email',
    ],
}