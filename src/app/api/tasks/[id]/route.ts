import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/lib/auth';
import { z } from 'zod';
import { TaskFrequency } from '@prisma/client';

// Define the Zod schema for updating a task.
// All fields are optional, as a PUT/PATCH request may only update a subset of fields.
const updateTaskSchema = z.object({
  task: z.string().min(3, { message: "Task must be at least 3 characters long." }).optional(),
  description: z.string().optional().nullable(), // Allow description to be explicitly set to null
  isCompleted: z.boolean().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  frequency: z.nativeEnum(TaskFrequency).optional(),
}).strict(); // Use .strict() to prevent unknown fields from being submitted.


interface RouteContext {
    params: {
        id: string;
    }
}

/**
 * @route PUT /api/tasks/{id}
 * @description Updates a specific task for the authenticated user.
 * @access Private
 */
export async function PUT(request: Request, context: RouteContext) {
    try {
        const token = (await cookies()).get('token')?.value;
        const userId = await getUserIdFromToken(token);
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const taskId = parseInt(context.params.id, 10);
        if (isNaN(taskId)) {
            return NextResponse.json({ error: 'Invalid task ID.' }, { status: 400 });
        }
        
        const body = await request.json();

        // Validate the incoming request body
        const validationResult = updateTaskSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
        }

        // Use the validated data
        const dataToUpdate = validationResult.data;

        // Ensure we don't try to update with an empty object
        if (Object.keys(dataToUpdate).length === 0) {
             return NextResponse.json({ error: 'Request body must contain at least one field to update.' }, { status: 400 });
        }

        // The use of updateMany with both id and authorId is a great security pattern.
        // It ensures that the query will only succeed if the task exists AND belongs to the user.
        const updatedTask = await prisma.task.updateMany({
            where: {
                id: taskId,
                authorId: userId, 
            },
            data: dataToUpdate,
        });

        if (updatedTask.count === 0) {
            return NextResponse.json({ error: 'Task not found or you do not have permission to edit it.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Task updated successfully.' });

    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}

/**
 * @route DELETE /api/tasks/{id}
 * @description Deletes a specific task for the authenticated user.
 * @access Private
 */
export async function DELETE(request: Request, context: RouteContext) {
    try {
        const token = (await cookies()).get('token')?.value;
        const userId = await getUserIdFromToken(token);
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const taskId = parseInt(context.params.id, 10);
        if (isNaN(taskId)) {
            return NextResponse.json({ error: 'Invalid task ID.' }, { status: 400 });
        }

        // The use of deleteMany is a secure way to ensure users can only delete their own tasks.
        const deletedTask = await prisma.task.deleteMany({
            where: {
                id: taskId,
                authorId: userId, 
            },
        });

        if (deletedTask.count === 0) {
            return NextResponse.json({ error: 'Task not found or you do not have permission to delete it.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Task deleted successfully.' });
    } catch (error) {
        console.error("Error deleting task:", error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
