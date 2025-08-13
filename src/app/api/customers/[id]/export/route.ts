import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/customers/[id]/export - Export customer data as JSON (GDPR compliance)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAuth()
    const resolvedParams = await params
    
    // Get complete customer data including all related records
    const customer = await db.customer.findUnique({
      where: { id: resolvedParams.id },
      include: {
        reservations: {
          include: {
            table: {
              select: {
                number: true,
                capacity: true,
                location: true
              }
            }
          },
          orderBy: {
            dateTime: 'desc'
          }
        },
        notes: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Prepare export data with GDPR compliance information
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        requestedBy: 'Customer Data Export',
        purpose: 'GDPR Data Portability Request',
        format: 'JSON'
      },
      personalData: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        dateOfBirth: customer.dateOfBirth,
        language: customer.language,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      },
      preferences: {
        preferredTime: customer.preferredTime,
        preferredLocation: customer.preferredLocation,
        dietaryRestrictions: customer.dietaryRestrictions,
        allergies: customer.allergies,
        favoriteDisheIds: customer.favoriteDisheIds
      },
      accountStatus: {
        isVip: customer.isVip,
        totalVisits: customer.totalVisits,
        totalSpent: customer.totalSpent,
        averagePartySize: customer.averagePartySize,
        lastVisit: customer.lastVisit
      },
      consentAndPrivacy: {
        dataProcessingConsent: customer.dataProcessingConsent,
        emailConsent: customer.emailConsent,
        marketingConsent: customer.marketingConsent,
        consentDate: customer.consentDate
      },
      reservationHistory: customer.reservations.map(reservation => ({
        id: reservation.id,
        dateTime: reservation.dateTime,
        partySize: reservation.partySize,
        duration: reservation.duration,
        status: reservation.status,
        occasion: reservation.occasion,
        specialRequests: reservation.specialRequests,
        table: reservation.table ? {
          number: reservation.table.number,
          capacity: reservation.table.capacity,
          location: reservation.table.location
        } : null,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt
      })),
      customerNotes: customer.notes.map(note => ({
        id: note.id,
        note: note.note,
        isImportant: note.isImportant,
        createdAt: note.createdAt,
        createdBy: {
          name: `${note.user.firstName} ${note.user.lastName}`,
          role: note.user.role
        }
      })),
      dataProcessingLog: {
        lastExport: new Date().toISOString(),
        totalReservations: customer.reservations.length,
        totalNotes: customer.notes.length,
        accountCreatedDate: customer.createdAt,
        lastModificationDate: customer.updatedAt
      }
    }

    // Create response with proper headers for file download
    const response = new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="customer-data-${customer.firstName}-${customer.lastName}-${new Date().toISOString().split('T')[0]}.json"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    return response
  } catch (error) {
    console.error('Error exporting customer data:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to export customer data' },
      { status: 500 }
    )
  }
}