# API Dokumentation - Strandrestaurant Badezeit

Diese Dokumentation beschreibt die Server Actions und API-Endpunkte des Badezeit-Systems.

## 🔧 Server Actions

### Contact Form Action

**Datei**: `/src/app/actions/contact.ts`

#### `sendContactForm(initialState, formData)`

Verarbeitet Kontaktformular-Übermittlungen mit vollständiger Validierung und GDPR-Compliance.

**Parameter:**
- `initialState`: Vorheriger Zustand (für useActionState Hook)
- `formData`: FormData-Objekt mit Formulardaten

**Felder:**
```typescript
{
  name: string           // Mindestens 2 Zeichen
  email: string          // Gültige E-Mail-Adresse
  telefon?: string       // Optional
  betreff: string        // Mindestens 3 Zeichen
  nachricht: string      // Mindestens 10 Zeichen
  datenschutz: boolean   // Muss true sein
  language: 'de' | 'en'  // Standardwert: 'de'
}
```

**Antwort:**
```typescript
// Erfolg
{
  success: true,
  message: string // Lokalisierte Erfolgsmeldung
}

// Validierungsfehler
{
  errors: {
    [fieldName]: string[] // Fehlermeldungen pro Feld
  },
  message: string // Allgemeine Fehlermeldung
}

// Serverfehler
{
  errors: {},
  message: string // Allgemeine Fehlermeldung
}
```

**Beispiel-Verwendung:**
```tsx
'use client'
import { useActionState } from 'react'
import { sendContactForm } from '@/app/actions/contact'

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactForm, { message: '' })
  
  return (
    <form action={formAction}>
      {/* Formularfelder */}
    </form>
  )
}
```

#### `subscribeNewsletter(initialState, formData)`

Verarbeitet Newsletter-Anmeldungen.

**Parameter:**
- `email`: E-Mail-Adresse
- `language`: Sprache ('de' oder 'en')

**Antwort:**
```typescript
// Erfolg
{
  success: true,
  message: string
}

// Fehler
{
  error: string
}
```

## 🛡️ Validierung

### Zod Schema

Das Kontaktformular verwendet Zod für typsichere Validierung:

```typescript
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  telefon: z.string().optional(),
  betreff: z.string().min(3, 'Subject must be at least 3 characters'),
  nachricht: z.string().min(10, 'Message must be at least 10 characters'),
  datenschutz: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  language: z.enum(['de', 'en']).default('de')
})
```

## 🔒 GDPR-Compliance

### Datenschutz-Features
1. **Explizite Einverständnisse**: Checkbox für Datenschutzerklärung erforderlich
2. **Datenminimierung**: Nur notwendige Felder erfasst
3. **Transparenz**: Klare Informationen über Datenverwendung
4. **Lokalisierung**: Deutsche und englische Fehlermeldungen

### Consent Tracking
```typescript
// Beispiel für zukünftige Datenbankintegration
await db.contactSubmission.create({
  data: {
    ...validatedData.data,
    consentGiven: true,
    consentDate: new Date(),
    ipAddress: request.ip, // Optional
    userAgent: request.headers['user-agent'] // Optional
  }
})
```

## 🚀 API-Routen (Geplant)

### Reservierungen

#### `POST /api/reservations`
Erstellt eine neue Reservierung.

**Body:**
```json
{
  "customerId": "string",
  "dateTime": "2024-01-15T19:00:00Z",
  "partySize": 4,
  "specialRequests": "string?",
  "tablePreference": "TERRACE_SEA_VIEW"
}
```

#### `GET /api/reservations`
Listet Reservierungen auf (authentifiziert).

**Query Parameters:**
- `date`: Datum (YYYY-MM-DD)
- `status`: Reservierungsstatus
- `limit`: Anzahl Ergebnisse
- `offset`: Pagination

### Menü-Management

#### `GET /api/menu`
Öffentliche Speisekarte.

#### `POST /api/menu/items`
Neue Menüposition hinzufügen (Admin only).

#### `PUT /api/menu/items/:id`
Menüposition aktualisieren (Admin only).

### Kunden-CRM

#### `GET /api/customers`
Kundenliste (authentifiziert).

#### `POST /api/customers`
Neuen Kunden erstellen.

#### `GET /api/customers/:id`
Kundendetails abrufen.

## 🔐 Authentifizierung

### Clerk Integration

```typescript
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const { userId } = auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  // API Logic
}
```

### Rollenbasierte Zugriffskontrolle

```typescript
import { checkRole } from '@/lib/auth'

export async function POST(request: Request) {
  const user = await checkRole(['ADMIN', 'MANAGER'])
  
  if (!user) {
    return new Response('Unauthorized', { status: 403 })
  }
  
  // Admin/Manager Logic
}
```

## 📧 E-Mail Integration

### Resend Setup

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Kontaktformular-E-Mail senden
await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL,
  to: 'info@badezeit.de',
  subject: `Kontaktanfrage: ${betreff}`,
  react: ContactFormEmail({ name, email, nachricht })
})
```

### E-Mail Templates

Verfügbare React Email Templates:
- `ContactFormEmail`: Kontaktformular-Bestätigung
- `ReservationConfirmation`: Reservierungsbestätigung
- `ReservationReminder`: Reservierungs-Erinnerung
- `NewsletterWelcome`: Newsletter-Willkommen

## 🧪 Testing

### Server Actions Testing

```typescript
import { sendContactForm } from '@/app/actions/contact'

describe('Contact Form', () => {
  it('should validate required fields', async () => {
    const formData = new FormData()
    formData.append('name', '')
    formData.append('email', 'invalid-email')
    
    const result = await sendContactForm({}, formData)
    
    expect(result.errors.name).toBeDefined()
    expect(result.errors.email).toBeDefined()
  })
})
```

## 🔍 Monitoring & Logging

### Error Handling

```typescript
try {
  // API Logic
} catch (error) {
  console.error('API Error:', error)
  
  // In Produktion: Error tracking service
  // await errorTracker.captureException(error)
  
  return {
    error: 'An unexpected error occurred'
  }
}
```

### Request Logging

```typescript
// Middleware für API-Logging
export function middleware(request: NextRequest) {
  console.log(`${request.method} ${request.url}`, {
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  })
}
```

## 📝 Changelog

### Version 1.0.0
- ✅ Kontaktformular mit Validierung
- ✅ Newsletter-Anmeldung
- ✅ GDPR-konforme Datenverarbeitung
- ✅ Zweisprachige Unterstützung

### Geplante Features
- 🔄 Reservierungs-API
- 🔄 Menü-Management API
- 🔄 Kunden-CRM API
- 🔄 QR-Code System API
- 🔄 Analytics API