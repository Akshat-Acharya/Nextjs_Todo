import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {prisma} from '@/lib/prisma'; // Correctly import the prisma client instance
import { getUserIdFromToken } from '@/lib/auth'; // We will create this auth utility file later
import { z } from 'zod'; // Import Zod
import { TaskFrequency } from '@prisma/client'; // Import the enum from the generated client

// Define the Zod schema for creating a task.
// This ensures the incoming data has the correct shape and types.
const createTaskSchema = z.object({
  task: z.string().min(3, { message: "Task must be at least 3 characters long." }),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(), // Expecting an ISO string from the client
  priority: z.enum(['Low', 'Medium', 'High']).optional(), // Should match your frontend values
  frequency: z.nativeEnum(TaskFrequency).optional(), // Use the Prisma-generated enum
});


/**
 * @route GET /api/tasks
 * @description Fetches all tasks for the authenticated user.
 * @access Private
 */
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
        orderBy: { isCompleted: 'asc' },
    });

    return NextResponse.json(tasks);
}

/**
 * @route POST /api/tasks
 * @description Creates a new task for the authenticated user.
 * @access Private
 */
export async function POST(request: Request) {
    try {
        const token = (await cookies()).get('token')?.value;
        const userId = await getUserIdFromToken(token);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const requestBody = await request.json();

        // Validate the request body against our schema
        const validationResult = createTaskSchema.safeParse(requestBody);

        if (!validationResult.success) {
            // If validation fails, return a 400 error with the details
            return NextResponse.json({ errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
        }
        
        // Use the validated data
        const { task, description, dueDate, priority, frequency } = validationResult.data;

        const newTask = await prisma.task.create({
            data: {
                task,
                description,
                dueDate: dueDate ? new Date(dueDate) : new Date(),
                // priority and frequency can be added here if they are in your prisma schema
                authorId: userId,
            }
        });

        return NextResponse.json(newTask, { status: 201 });

    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
