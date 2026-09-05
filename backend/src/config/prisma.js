import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

// Instantiate PrismaClient with conditional query logging for development
export const prisma = new PrismaClient({
  log: config.isDevelopment ? ['warn', 'error'] : ['error'],
});

/**
 * Checks connectivity to the PostgreSQL database via Prisma
 * @returns {Promise<{ connected: boolean, message: string }>}
 */
export async function testDatabaseConnection() {
  try {
    // Perform a lightweight ping query
    await prisma.$queryRaw`SELECT 1 as ping`;
    return {
      connected: true,
      message: 'PostgreSQL database connected successfully via Prisma',
    };
  } catch (error) {
    return {
      connected: false,
      message: `Database connection failed: ${error.message}`,
    };
  }
}
