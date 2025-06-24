import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

function getUserIdFromToken(token: string | undefined): number | null {
    if (!token) return null;
    try {
        // FIX: The 'decoded' variable was unused, so we just return the value directly.
        return (jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }).userId;
    } catch { // FIX: Removed unused 'error' variable
        return null;
    }
}
export async function GET() {
    const token = (await cookies()).get('token')?.value;
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tasks = await prisma.task.findMany({
        where: { authorId: userId },
         orderBy: { dueDate: 'asc' },
    });
    return NextResponse.json(tasks);
}

export async function POST(request: Request) {
    const token = (await cookies()).get('token')?.value;
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task, description } = await request.json();
    
    const newTask = await prisma.task.create({
        data: {
            task,
            description,
            authorId: userId,
        }
    });
    
    return NextResponse.json(newTask, { status: 201 });
}
