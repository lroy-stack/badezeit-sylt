import { Resend } from 'resend'
import { renderAsync } from '@react-email/components'

// Lazy initialization to prevent build-time instantiation
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      // For development/demo mode - email functionality disabled
      console.warn('RESEND_API_KEY not configured - email sending disabled')
      throw new Error('Email service not configured. Please set RESEND_API_KEY environment variable.')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  template: React.ReactElement
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail({
  to,
  subject,
  template,
  from = 'Badezeit Sylt <noreply@badezeit-sylt.de>',
  replyTo = 'reservierung@badezeit-sylt.de',
  attachments,
}: SendEmailOptions) {
  try {
    // Render the React Email template to HTML
    const html = await renderAsync(template)

    const result = await getResendClient().emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
      attachments,
    })

    if (result.error) {
      console.error('Error sending email:', result.error)
      throw new Error(`Failed to send email: ${result.error.message}`)
    }

    console.log('Email sent successfully:', result.data?.id)
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Specialized functions for different email types
export async function sendReservationConfirmation(
  to: string,
  reservationData: {
    customerName: string
    dateTime: Date
    partySize: number
    tableNumber?: number
    specialRequests?: string
    restaurantPhone: string
    restaurantEmail: string
  }
) {
  const { ReservationConfirmationEmail } = await import('./templates/reservation-confirmation')
  
  return sendEmail({
    to,
    subject: `Reservierungsbestätigung - Badezeit Sylt`,
    template: ReservationConfirmationEmail(reservationData),
    replyTo: reservationData.restaurantEmail,
  })
}

export async function sendReservationReminder(
  to: string,
  reservationData: {
    customerName: string
    dateTime: Date
    partySize: number
    tableNumber?: number
    specialRequests?: string
    restaurantPhone: string
    restaurantAddress: string
  }
) {
  const { ReservationReminderEmail } = await import('./templates/reservation-reminder')
  
  return sendEmail({
    to,
    subject: `Erinnerung: Ihre Reservierung heute - Badezeit Sylt`,
    template: ReservationReminderEmail(reservationData),
  })
}

export async function sendReservationCancellation(
  to: string,
  reservationData: {
    customerName: string
    dateTime: Date
    cancellationReason?: string
    rebookingLink: string
  }
) {
  const { ReservationCancellationEmail } = await import('./templates/reservation-cancellation')
  
  return sendEmail({
    to,
    subject: `Reservierung storniert - Badezeit Sylt`,
    template: ReservationCancellationEmail(reservationData),
  })
}

export async function sendWelcomeNewsletter(
  to: string,
  customerData: {
    firstName: string
    preferredLanguage?: 'de' | 'en'
  }
) {
  const { NewsletterWelcomeEmail } = await import('./templates/newsletter-welcome')
  
  const subject = customerData.preferredLanguage === 'en' 
    ? 'Welcome to Badezeit Sylt Newsletter'
    : 'Willkommen beim Badezeit Sylt Newsletter'
  
  return sendEmail({
    to,
    subject,
    template: NewsletterWelcomeEmail(customerData),
  })
}

// export async function sendPasswordReset(
//   to: string,
//   resetData: {
//     firstName: string
//     resetLink: string
//     expiresIn: string
//   }
// ) {
//   const { PasswordResetEmail } = await import('./templates/password-reset')
//   
//   return sendEmail({
//     to,
//     subject: `Passwort zurücksetzen - Badezeit Sylt Dashboard`,
//     template: PasswordResetEmail(resetData),
//   })
// }

export async function sendStaffInvitation(
  to: string,
  invitationData: {
    inviterName: string
    role: string
    invitationLink: string
    restaurantName: string
    expiresIn: string
  }
) {
  const { StaffInvitationEmail } = await import('./templates/staff-invitation')
  
  return sendEmail({
    to,
    subject: `Einladung zum Badezeit Sylt Team`,
    template: StaffInvitationEmail(invitationData),
  })
}

// Utility function to validate email configuration
export async function validateEmailConfiguration() {
  try {
    // Test the API key by attempting to get domain information
    const result = await getResendClient().domains.list()
    return { valid: true, domains: result.data }
  } catch (error) {
    console.error('Email configuration validation failed:', error)
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}