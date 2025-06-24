import { PrismaClient } from '@prisma/client';

// This prevents creating a new PrismaClient on every hot reload in development.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;