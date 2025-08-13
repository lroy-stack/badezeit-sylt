import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'

// Schema for updating system settings
const systemSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional(),
})

const bulkSettingsSchema = z.array(systemSettingSchema)

// GET /api/settings - Get all system settings (public for basic info)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicOnly = searchParams.get('public') === 'true'
    
    // Define which settings are safe to expose publicly
    const publicSettings = [
      'restaurant_name',
      'restaurant_phone', 
      'restaurant_email',
      'restaurant_address',
      'opening_hours_summer',
      'opening_hours_winter',
      'max_party_size',
      'advance_booking_days',
    ]

    const whereClause = publicOnly 
      ? { key: { in: publicSettings } }
      : {}

    const settings = await db.systemSetting.findMany({
      where: whereClause,
      orderBy: { key: 'asc' }
    })

    // Convert to key-value object for easier consumption
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt,
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      settings: settingsObject,
      raw: settings, // Also return raw array for admin interfaces
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update system settings (Admin only)
export async function PUT(request: NextRequest) {
  try {
    await requireRole(['ADMIN'])
    
    const body = await request.json()
    
    // Handle both single setting update and bulk updates
    if (Array.isArray(body)) {
      // Bulk update
      const validatedSettings = bulkSettingsSchema.parse(body)
      
      const updatedSettings = await Promise.all(
        validatedSettings.map(async (setting) => {
          return await db.systemSetting.upsert({
            where: { key: setting.key },
            update: { 
              value: setting.value,
              description: setting.description,
            },
            create: {
              key: setting.key,
              value: setting.value,
              description: setting.description,
            }
          })
        })
      )
      
      return NextResponse.json(updatedSettings)
    } else {
      // Single setting update
      const validatedSetting = systemSettingSchema.parse(body)
      
      const updatedSetting = await db.systemSetting.upsert({
        where: { key: validatedSetting.key },
        update: { 
          value: validatedSetting.value,
          description: validatedSetting.description,
        },
        create: {
          key: validatedSetting.key,
          value: validatedSetting.value,
          description: validatedSetting.description,
        }
      })
      
      return NextResponse.json(updatedSetting)
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// DELETE /api/settings - Delete system setting (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(['ADMIN'])
    
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }
    
    // Prevent deletion of critical settings
    const protectedSettings = [
      'restaurant_name',
      'restaurant_phone', 
      'restaurant_email',
      'restaurant_address',
    ]
    
    if (protectedSettings.includes(key)) {
      return NextResponse.json(
        { error: 'Cannot delete protected setting' },
        { status: 403 }
      )
    }
    
    const deletedSetting = await db.systemSetting.delete({
      where: { key }
    })
    
    return NextResponse.json(deletedSetting)
  } catch (error) {
    console.error('Error deleting setting:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    )
  }
}