import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    // To logout, we simply delete the cookie.
    (await cookies()).delete('token');
    return NextResponse.json({ message: 'Logged out' });
}