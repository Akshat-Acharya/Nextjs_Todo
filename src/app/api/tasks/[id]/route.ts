
import { NextResponse } from 'next/server';
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


interface RouteContext {
    params: {
        id: string;
    }
}

// PUT (update) a specific task
export async function PUT(request: Request, context: RouteContext) {
    const token = (await cookies()).get('token')?.value;
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // We now get the 'id' from the context object's params.
    const taskId = parseInt(context.params.id, 10);
    const body = await request.json();

    try {
        const updatedTask = await prisma.task.updateMany({
            where: {
                id: taskId,
                authorId: userId, // Security check: user must own the task
            },
            data: {
                task: body.task,
                description: body.description,
                isCompleted: body.isCompleted,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            },
        });

        if (updatedTask.count === 0) {
            return NextResponse.json({ error: 'Task not found or permission denied' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Task updated' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE a specific task
export async function DELETE(request: Request, context: RouteContext) {
    const token = (await cookies()).get('token')?.value;
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(context.params.id, 10);

    try {
        const deletedTask = await prisma.task.deleteMany({
            where: {
                id: taskId,
                authorId: userId, // Security check
            },
        });

        if (deletedTask.count === 0) {
            return NextResponse.json({ error: 'Task not found or permission denied' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Task deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
