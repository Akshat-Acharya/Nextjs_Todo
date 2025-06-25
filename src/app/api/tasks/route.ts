import { NextRequest, NextResponse } from 'next/server'; 
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

function getUserIdFromToken(token: string | undefined): number | null {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

export async function GET(request: NextRequest) { 
    const token = (await cookies()).get('token')?.value;
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const search = request.nextUrl.searchParams.get('search') || '';

    const tasks = await prisma.task.findMany({
        where: {
            authorId: userId,
            OR: [
                {
                    task: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ],
        },
        orderBy: { createdAt: 'desc' },
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
