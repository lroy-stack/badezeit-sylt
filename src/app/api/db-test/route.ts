import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    connection: { status: 'unknown', error: null },
    tables: {},
    environment: {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      DIRECT_URL: process.env.DIRECT_URL ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV,
    }
  }

  // Test 1: Basic connection
  try {
    await db.$queryRaw`SELECT 1 as test`
    results.connection.status = 'connected'
    console.log('[DB Test] ✅ Database connection successful')
  } catch (error) {
    results.connection.status = 'failed'
    results.connection.error = error instanceof Error ? error.message : String(error)
    console.error('[DB Test] ❌ Database connection failed:', error)
    return NextResponse.json(results, { status: 500 })
  }

  // Test 2: Check if tables exist
  const tables = [
    'users',
    'customers',
    'reservations',
    'tables',
    'menu_items',
    'menu_categories',
    'activity_logs',
    'qr_codes'
  ]

  for (const table of tables) {
    try {
      const result = await db.$queryRawUnsafe(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = '${table}'
        );
      `) as any[]

      results.tables[table] = {
        exists: result[0]?.exists || false,
        status: result[0]?.exists ? '✅' : '❌'
      }

      // If table exists, count rows
      if (result[0]?.exists) {
        try {
          const count = await db.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`) as any[]
          results.tables[table].count = parseInt(count[0]?.count || '0')
        } catch (e) {
          results.tables[table].countError = 'Unable to count rows'
        }
      }
    } catch (error) {
      results.tables[table] = {
        exists: false,
        status: '❌',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  // Test 3: Try to fetch a simple user count
  try {
    const userCount = await db.user.count()
    results.userTest = { status: '✅', count: userCount }
  } catch (error) {
    results.userTest = {
      status: '❌',
      error: error instanceof Error ? error.message : String(error)
    }
  }

  console.log('[DB Test] Results:', JSON.stringify(results, null, 2))

  return NextResponse.json(results, { status: 200 })
}
