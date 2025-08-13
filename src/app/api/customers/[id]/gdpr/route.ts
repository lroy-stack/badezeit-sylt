import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateConsentSchema = z.object({
  dataProcessingConsent: z.boolean().optional(),
  emailConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
})

const gdprActionSchema = z.object({
  action: z.enum(['UPDATE_CONSENT', 'REQUEST_DELETION', 'REQUEST_EXPORT', 'REVOKE_ALL_CONSENT']),
  consentUpdates: updateConsentSchema.optional(),
  reason: z.string().optional()
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/customers/[id]/gdpr - Get GDPR compliance status (Staff+ only)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAuth()
    const resolvedParams = await params
    
    const customer = await db.customer.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dataProcessingConsent: true,
        emailConsent: true,
        marketingConsent: true,
        consentDate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reservations: true,
            notes: true
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

    // Calculate GDPR compliance score
    const consentItems = [
      customer.dataProcessingConsent,
      customer.emailConsent,
      customer.marketingConsent
    ]
    const consentScore = consentItems.filter(Boolean).length / consentItems.length * 100

    // Check data retention compliance (example: 7 years for German restaurants)
    const dataAge = new Date().getTime() - new Date(customer.createdAt).getTime()
    const sevenYearsInMs = 7 * 365 * 24 * 60 * 60 * 1000
    const isDataRetentionCompliant = dataAge < sevenYearsInMs

    const gdprStatus = {
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      consentStatus: {
        dataProcessingConsent: customer.dataProcessingConsent,
        emailConsent: customer.emailConsent,
        marketingConsent: customer.marketingConsent,
        consentDate: customer.consentDate,
        consentScore: Math.round(consentScore)
      },
      dataInventory: {
        totalReservations: customer._count.reservations,
        totalNotes: customer._count.notes,
        accountAge: Math.floor(dataAge / (1000 * 60 * 60 * 24)) // days
      },
      compliance: {
        hasValidConsent: customer.dataProcessingConsent && customer.consentDate !== null,
        canSendEmails: customer.emailConsent,
        canSendMarketing: customer.marketingConsent,
        dataRetentionCompliant: isDataRetentionCompliant,
        lastConsentUpdate: customer.consentDate,
        accountCreated: customer.createdAt,
        lastDataUpdate: customer.updatedAt
      },
      rights: {
        canRequestExport: true,
        canRequestDeletion: customer._count.reservations === 0, // Can only delete if no reservations
        canRevokeConsent: true,
        canUpdateConsent: true
      },
      warnings: [
        ...(customer.consentDate === null ? ['No consent date recorded'] : []),
        ...(dataAge > sevenYearsInMs ? ['Data retention period exceeded'] : []),
        ...(!customer.dataProcessingConsent ? ['No data processing consent'] : [])
      ]
    }

    return NextResponse.json(gdprStatus)
  } catch (error) {
    console.error('Error fetching GDPR status:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch GDPR status' },
      { status: 500 }
    )
  }
}

// POST /api/customers/[id]/gdpr - Handle GDPR actions (Staff+ only)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAuth()
    const resolvedParams = await params
    const body = await request.json()
    
    // Validate request data
    const validatedData = gdprActionSchema.parse(body)

    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    let result: any = {}

    switch (validatedData.action) {
      case 'UPDATE_CONSENT':
        if (!validatedData.consentUpdates) {
          return NextResponse.json(
            { error: 'Consent updates required for UPDATE_CONSENT action' },
            { status: 400 }
          )
        }

        const updatedCustomer = await db.customer.update({
          where: { id: resolvedParams.id },
          data: {
            ...validatedData.consentUpdates,
            consentDate: new Date(),
          },
          select: {
            dataProcessingConsent: true,
            emailConsent: true,
            marketingConsent: true,
            consentDate: true
          }
        })

        result = {
          action: 'consent_updated',
          newConsentStatus: updatedCustomer,
          message: 'Consent preferences updated successfully'
        }
        break

      case 'REVOKE_ALL_CONSENT':
        await db.customer.update({
          where: { id: resolvedParams.id },
          data: {
            dataProcessingConsent: false,
            emailConsent: false,
            marketingConsent: false,
            consentDate: new Date(),
          }
        })

        result = {
          action: 'consent_revoked',
          message: 'All consent has been revoked',
          nextSteps: 'Customer data will be anonymized according to retention policy'
        }
        break

      case 'REQUEST_DELETION':
        // Check if customer has active reservations
        const reservationCount = await db.reservation.count({
          where: { customerId: resolvedParams.id }
        })

        if (reservationCount > 0) {
          return NextResponse.json(
            { 
              error: 'Cannot process deletion request', 
              message: 'Customer has existing reservations that must be handled first',
              reservationCount 
            },
            { status: 409 }
          )
        }

        result = {
          action: 'deletion_request_approved',
          message: 'Customer data can be safely deleted',
          warning: 'This action cannot be undone'
        }
        break

      case 'REQUEST_EXPORT':
        result = {
          action: 'export_request_acknowledged',
          message: 'Data export can be processed',
          exportUrl: `/api/customers/${resolvedParams.id}/export`,
          instruction: 'Use the export endpoint to download customer data'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid GDPR action' },
          { status: 400 }
        )
    }

    // Log GDPR action for audit trail
    console.log(`GDPR Action: ${validatedData.action} for customer ${resolvedParams.id}`, {
      action: validatedData.action,
      customerId: resolvedParams.id,
      reason: validatedData.reason,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing GDPR request:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid GDPR request data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to process GDPR request' },
      { status: 500 }
    )
  }
}