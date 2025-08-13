import { z } from 'zod'

export const createReservationSchema = z.object({
  customerId: z.string().cuid().optional(),
  // Customer info (for new customers)
  firstName: z.string().min(1, 'Vorname ist erforderlich').max(50),
  lastName: z.string().min(1, 'Nachname ist erforderlich').max(50),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{8,15}$/, 'Ungültige Telefonnummer').optional(),
  
  // Reservation details
  dateTime: z.coerce.date().refine(
    (date) => date > new Date(),
    'Das Reservierungsdatum muss in der Zukunft liegen'
  ),
  partySize: z.number().int().min(1, 'Mindestens 1 Person').max(20, 'Maximal 20 Personen'),
  duration: z.number().int().min(60, 'Mindestens 60 Minuten').max(300, 'Maximal 5 Stunden').default(120),
  
  // Preferences
  tableId: z.string().cuid().optional(),
  preferredLocation: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  specialRequests: z.string().max(500, 'Maximal 500 Zeichen').optional(),
  occasion: z.string().max(100, 'Maximal 100 Zeichen').optional(),
  dietaryNotes: z.string().max(500, 'Maximal 500 Zeichen').optional(),
  
  // GDPR consent
  dataProcessingConsent: z.boolean().refine(
    (val) => val === true,
    'Datenschutzerklärung muss akzeptiert werden'
  ),
  emailConsent: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),
})

export const updateReservationSchema = z.object({
  id: z.string().cuid(),
  tableId: z.string().cuid().optional(),
  dateTime: z.coerce.date().optional(),
  partySize: z.number().int().min(1).max(20).optional(),
  duration: z.number().int().min(60).max(300).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  specialRequests: z.string().max(500).optional(),
  occasion: z.string().max(100).optional(),
  dietaryNotes: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
})

export const reservationAvailabilitySchema = z.object({
  dateTime: z.coerce.date(),
  partySize: z.number().int().min(1).max(20),
  duration: z.number().int().min(60).max(300).default(120),
  preferredLocation: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
})

export const reservationFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  tableId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  partySize: z.number().int().min(1).max(20).optional(),
})

export type CreateReservationData = z.infer<typeof createReservationSchema>
export type UpdateReservationData = z.infer<typeof updateReservationSchema>
export type ReservationAvailabilityData = z.infer<typeof reservationAvailabilitySchema>
export type ReservationFilterData = z.infer<typeof reservationFilterSchema>