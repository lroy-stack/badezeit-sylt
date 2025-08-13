import { z } from 'zod'

export const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'Vorname ist erforderlich').max(50, 'Vorname zu lang'),
  lastName: z.string().min(1, 'Nachname ist erforderlich').max(50, 'Nachname zu lang'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string()
    .regex(/^[\+]?[\d\s\-\(\)]{8,15}$/, 'Ungültige Telefonnummer')
    .optional(),
  language: z.enum(['DE', 'EN']).default('DE'),
  dateOfBirth: z.coerce.date().max(new Date(), 'Geburtsdatum kann nicht in der Zukunft liegen').optional(),
  
  // Preferences
  preferredTime: z.string().max(20).optional(),
  preferredLocation: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  dietaryRestrictions: z.array(z.string().max(100)).default([]),
  allergies: z.string().max(500).optional(),
  
  // GDPR consent fields
  emailConsent: z.boolean().default(false),
  smsConsent: z.boolean().default(false), 
  marketingConsent: z.boolean().default(false),
  dataProcessingConsent: z.boolean().refine(
    (val) => val === true,
    'Datenschutzerklärung muss akzeptiert werden'
  ),
})

export const updateCustomerSchema = z.object({
  id: z.string().cuid(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{8,15}$/, 'Ungültige Telefonnummer').optional(),
  language: z.enum(['DE', 'EN']).optional(),
  dateOfBirth: z.coerce.date().max(new Date()).optional(),
  
  // Preferences
  preferredTime: z.string().max(20).optional(),
  preferredLocation: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  dietaryRestrictions: z.array(z.string().max(100)).optional(),
  allergies: z.string().max(500).optional(),
  favoriteDisheIds: z.array(z.string().cuid()).optional(),
  
  // GDPR consent updates
  emailConsent: z.boolean().optional(),
  smsConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
  
  // VIP status (admin only)
  isVip: z.boolean().optional(),
})

export const customerNoteSchema = z.object({
  customerId: z.string().cuid(),
  note: z.string().min(1, 'Notiz ist erforderlich').max(1000, 'Notiz zu lang'),
  isImportant: z.boolean().default(false),
})

export const customerFilterSchema = z.object({
  search: z.string().max(100).optional(), // Search in name, email, phone
  language: z.enum(['DE', 'EN']).optional(),
  isVip: z.boolean().optional(),
  hasRecentVisit: z.boolean().optional(), // Within last 30 days
  preferredLocation: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  minVisits: z.number().int().min(0).optional(),
  minSpent: z.number().min(0).optional(),
})

export const newsletterSubscriptionSchema = z.object({
  customerId: z.string().cuid(),
  subscribe: z.boolean(),
})

export const customerConsentSchema = z.object({
  customerId: z.string().cuid(),
  emailConsent: z.boolean().optional(),
  smsConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
})

// GDPR data export schema
export const customerDataExportSchema = z.object({
  customerId: z.string().cuid(),
  includeReservations: z.boolean().default(true),
  includeNotes: z.boolean().default(false),
  includeAnalytics: z.boolean().default(false),
})

// GDPR data deletion schema  
export const customerDataDeletionSchema = z.object({
  customerId: z.string().cuid(),
  reason: z.string().min(1, 'Grund für Löschung erforderlich').max(500),
  confirmDeletion: z.boolean().refine(
    (val) => val === true,
    'Bestätigung der Löschung erforderlich'
  ),
})

export type CreateCustomerData = z.infer<typeof createCustomerSchema>
export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>
export type CustomerNoteData = z.infer<typeof customerNoteSchema>
export type CustomerFilterData = z.infer<typeof customerFilterSchema>
export type NewsletterSubscriptionData = z.infer<typeof newsletterSubscriptionSchema>
export type CustomerConsentData = z.infer<typeof customerConsentSchema>
export type CustomerDataExportData = z.infer<typeof customerDataExportSchema>
export type CustomerDataDeletionData = z.infer<typeof customerDataDeletionSchema>