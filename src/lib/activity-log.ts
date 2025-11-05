import { prisma } from '@/lib/prisma'
import type { ActivityAction } from '@prisma/client'

interface LogActivityParams {
  userId: string
  action: ActivityAction
  description: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function logActivity({
  userId,
  action,
  description,
  entityType,
  entityId,
  metadata,
  ipAddress,
  userAgent,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        description,
        entityType,
        entityId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw error to avoid breaking the main flow
  }
}

export async function getRecentActivities(userId?: string, limit = 10) {
  try {
    const where = userId ? { userId } : {}

    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return activities
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return []
  }
}

export async function getActivityStats(userId?: string) {
  try {
    const where = userId ? { userId } : {}

    const [total, last24Hours, last7Days] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.activityLog.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return { total, last24Hours, last7Days }
  } catch (error) {
    console.error('Failed to fetch activity stats:', error)
    return { total: 0, last24Hours: 0, last7Days: 0 }
  }
}
