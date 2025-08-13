import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/customers/[id]/welcome-email - Send welcome email (Staff+ only)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAuth()
    const resolvedParams = await params
    
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

    // Check if customer has email consent
    if (!customer.emailConsent) {
      return NextResponse.json(
        { error: 'Customer has not consented to email communication' },
        { status: 403 }
      )
    }

    // TODO: Implement actual email sending logic with React Email + Resend
    // For now, we'll simulate the email sending
    console.log(`Sending welcome email to ${customer.email}`)
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update customer's last communication date (if you have this field)
    // await db.customer.update({
    //   where: { id: resolvedParams.id },
    //   data: { lastEmailSent: new Date() }
    // })

    return NextResponse.json({ 
      message: 'Welcome email sent successfully',
      recipient: customer.email 
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}