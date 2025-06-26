import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    
   
    
     const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.redirect('/');
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        await jwtVerify(token, secret);
        return NextResponse.next();
    } catch (error) {
        console.error('Invalid token, redirecting to login:', error);
        return NextResponse.redirect('/');
    }
}
