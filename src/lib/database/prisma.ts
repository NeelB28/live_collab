import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper function to handle Prisma errors
export const handlePrismaError = (error: any): string => {
  if (error.code === 'P2002') {
    return 'A record with this information already exists.';
  }
  if (error.code === 'P2025') {
    return 'Record not found.';
  }
  if (error.code === 'P2003') {
    return 'Foreign key constraint failed.';
  }
  
  return error.message || 'Database operation failed.';
}; 