import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized Prisma configuration for serverless (Vercel + Supabase)
export const db = globalForPrisma.prisma ?? 
  new PrismaClient({
    // Reduce logging in production to improve performance
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Optimize for serverless environment - remove internal options for now
  })

// Global singleton pattern for serverless
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Graceful shutdown handling for serverless
process.on('beforeExit', async () => {
  await db.$disconnect()
})