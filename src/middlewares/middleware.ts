import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // These are your public pages and their nested API routes.
    // The middleware will ignore them.
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        PUBLIC_FILE.test(pathname)
    ) {
        return NextResponse.next();
    }
    
    // --- The rest of the routes are protected ---
    
    const token = req.cookies.get('token')?.value;
    const loginUrl = new URL('/login', req.url);

    if (!token) {
        // If no token, redirect to login for any protected route
        return NextResponse.redirect(loginUrl);
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        await jwtVerify(token, secret);
        // If the token is valid, allow the request to continue.
        return NextResponse.next();
    } catch (error) {
        // If token verification fails, redirect to login.
        console.error('Invalid token, redirecting to login:', error);
        return NextResponse.redirect(loginUrl);
    }
}
