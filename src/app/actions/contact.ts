'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'

// Contact form schema with German and English validation
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  telefon: z.string().optional(),
  betreff: z.string().min(3, 'Subject must be at least 3 characters'),
  nachricht: z.string().min(10, 'Message must be at least 10 characters'),
  datenschutz: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  language: z.enum(['de', 'en']).default('de')
})

export async function sendContactForm(initialState: any, formData: FormData) {
  try {
    // Parse and validate form data
    const validatedData = contactSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      telefon: formData.get('telefon'),
      betreff: formData.get('betreff'),
      nachricht: formData.get('nachricht'),
      datenschutz: formData.get('datenschutz') === 'on',
      language: formData.get('language') || 'de'
    })

    if (!validatedData.success) {
      const language = formData.get('language') as string || 'de'
      return {
        errors: validatedData.error.flatten().fieldErrors,
        message: language === 'en' 
          ? 'Please check the form and try again.'
          : 'Bitte überprüfen Sie das Formular und versuchen Sie es erneut.'
      }
    }

    const { name, email, telefon, betreff, nachricht, language } = validatedData.data

    // Here you would typically send an email using a service like Resend
    // For now, we'll simulate the email sending
    console.log('Contact form submission:', {
      name,
      email,
      telefon,
      betreff,
      nachricht,
      language,
      timestamp: new Date().toISOString()
    })

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In a real implementation, you might also save to database
    // await db.contactSubmission.create({ data: validatedData.data })

    return {
      success: true,
      message: language === 'en'
        ? 'Thank you for your message! We will get back to you soon.'
        : 'Vielen Dank für Ihre Nachricht! Wir melden uns bald bei Ihnen.'
    }

  } catch (error) {
    console.error('Contact form error:', error)
    
    return {
      errors: {},
      message: 'An unexpected error occurred. Please try again later.'
    }
  }
}

// Newsletter subscription action
export async function subscribeNewsletter(initialState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const language = formData.get('language') as string || 'de'

    if (!email || !z.string().email().safeParse(email).success) {
      return {
        error: language === 'en' 
          ? 'Please enter a valid email address.'
          : 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
      }
    }

    // Here you would typically add to newsletter service
    console.log('Newsletter subscription:', { email, language })

    return {
      success: true,
      message: language === 'en'
        ? 'Thank you for subscribing to our newsletter!'
        : 'Vielen Dank für die Anmeldung zu unserem Newsletter!'
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    
    return {
      error: 'An unexpected error occurred. Please try again later.'
    }
  }
}