import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL at startup
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL no está configurada. Por favor configura esta variable de entorno en Vercel.\n' +
    'Para Supabase en Vercel/serverless, usa la Connection Pooler URL (puerto 6543):\n' +
    'postgresql://user:password@host.supabase.co:6543/postgres?pgbouncer=true'
  )
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

// Test database connection on first import (only in development)
if (process.env.NODE_ENV !== 'production') {
  db.$connect()
    .then(() => {
      console.log('✅ Prisma Client conectado exitosamente a la base de datos')
    })
    .catch((error) => {
      console.error('❌ Error al conectar Prisma Client a la base de datos:', error)
      console.error('Verifica que DATABASE_URL esté correctamente configurada')
    })
}

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await db.$disconnect()
})