import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { z, ZodError } from 'zod';

// Define the schema for login data using Zod
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  rememberMe : z.boolean()
});



export async function POST(request: Request) {
  let maxAge : number =3*60*60*24;
  try {
    const body = await request.json();

    // Validate the request body against the schema
    const { email, password,rememberMe } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    if(rememberMe){
       maxAge = 15*60*60*24;
    }


    const payload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: maxAge, // 1 day
      path: '/',
    });

    return NextResponse.json({ message: 'Login successful' });

  } catch (error: unknown) {
    console.error("Login API Error:", error);

    if (error instanceof ZodError) {
      // If validation fails, return a 400 response with the error messages
      return NextResponse.json({ error: 'Invalid request data', details: error.flatten().fieldErrors }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}