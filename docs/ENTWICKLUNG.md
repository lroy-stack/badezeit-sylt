# Entwicklungshandbuch - Strandrestaurant Badezeit

Umfassende Anleitung für Entwickler zur Arbeit mit dem Badezeit-Restaurantmanagement-System.

## 🎯 Entwicklungsumgebung

### Systemanforderungen
- **Node.js**: 18.x oder höher (empfohlen: 20.x LTS)
- **npm**: 9.x oder höher
- **Git**: Aktuelle Version
- **PostgreSQL**: 14.x oder höher (oder Supabase Cloud)
- **Editor**: VS Code mit empfohlenen Extensions

### Empfohlene VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "yoavbls.pretty-ts-errors",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Entwicklungsserver starten
```bash
# 1. Repository klonen
git clone https://github.com/[repository]/badezeit-sylt.git
cd badezeit-sylt

# 2. Dependencies installieren
npm install

# 3. Umgebungsvariablen konfigurieren
cp .env.example .env.local
# .env.local bearbeiten (siehe Konfiguration unten)

# 4. Datenbank einrichten
npm run db:generate
npm run db:push
npm run db:seed

# 5. Entwicklungsserver starten
npm run dev
```

### Umgebungsvariablen (.env.local)
```bash
# ===========================================
# DATENBANK-KONFIGURATION
# ===========================================
DATABASE_URL="postgresql://postgres:password@localhost:5432/badezeit_dev"

# ===========================================
# AUTHENTIFIZIERUNG (CLERK)
# ===========================================
# Production Keys (optional - Development Mode wenn leer)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Webhook-Endpunkt für Benutzer-Synchronisation
CLERK_WEBHOOK_SECRET=""

# ===========================================
# E-MAIL-VERSAND (RESEND)
# ===========================================
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@badezeit.de"

# ===========================================
# CDN & BILDER (IMAGEKIT)
# ===========================================
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=""
IMAGEKIT_PUBLIC_KEY=""
IMAGEKIT_PRIVATE_KEY=""

# ===========================================
# ANALYTICS & MONITORING
# ===========================================
NEXT_PUBLIC_GA_ID=""
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=""

# ===========================================
# ENTWICKLUNG
# ===========================================
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🏗️ Projekt-Architektur

### Tech Stack Overview
```mermaid
graph TB
    subgraph "Frontend"
        A[Next.js 15 App Router]
        B[React 19]
        C[TypeScript]
        D[Tailwind CSS]
        E[shadcn/ui]
    end
    
    subgraph "State Management"
        F[TanStack Query]
        G[React Hook Form]
        H[Zustand/Context]
    end
    
    subgraph "Backend"
        I[Server Actions]
        J[API Routes]
        K[Prisma ORM]
        L[PostgreSQL]
    end
    
    subgraph "Services"
        M[Clerk Auth]
        N[Resend Email]
        O[ImageKit CDN]
    end
    
    A --> F
    B --> G
    C --> H
    I --> K
    K --> L
    J --> M
    I --> N
    E --> O
```

### Ordnerstruktur-Konventionen
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route Groups für Authentifizierung
│   ├── api/               # API-Endpunkte
│   ├── dashboard/         # Admin-Panel
│   ├── globals.css        # Globale Styles
│   └── layout.tsx         # Root Layout
├── components/            # React-Komponenten
│   ├── ui/                # Base UI-Komponenten
│   ├── layout/            # Layout-spezifische Komponenten
│   └── forms/             # Formular-Komponenten
├── hooks/                 # Custom React Hooks
├── lib/                   # Utility-Funktionen
├── middleware/            # Middleware-Logik
└── types/                 # TypeScript-Definitionen
```

## 🧩 Komponenten-System

### shadcn/ui Integration
```typescript
// components.json Konfiguration
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Neue UI-Komponente hinzufügen
```bash
# shadcn/ui Komponente installieren
npx shadcn@latest add button

# Eigene Komponente erstellen
touch src/components/ui/custom-component.tsx
```

### Komponenten-Struktur Beispiel
```typescript
// src/components/ui/data-table.tsx
import { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
}

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: T[keyof T], item: T) => ReactNode
}

export function DataTable<T>({ 
  data, 
  columns, 
  loading = false,
  emptyMessage = 'Keine Daten verfügbar' 
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton />
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={String(column.key)}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={String(column.key)}>
                {column.render 
                  ? column.render(item[column.key], item)
                  : String(item[column.key])
                }
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Layout-Komponenten
```typescript
// src/components/layout/dashboard-sidebar.tsx
interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  badge?: string
}

const navigationItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']
  },
  {
    name: 'Reservierungen',
    href: '/dashboard/reservierungen',
    icon: Calendar,
    roles: ['ADMIN', 'MANAGER', 'STAFF'],
    badge: '12' // Aktive Reservierungen heute
  },
  // ... weitere Items
]
```

## 🎣 Custom Hooks

### API-Integration Hooks
```typescript
// src/hooks/use-reservations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createReservation, getReservations, updateReservation } from '@/lib/api/reservations'

export function useReservations(filters?: ReservationFilters) {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: () => getReservations(filters),
    staleTime: 30000, // 30 Sekunden
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      // Cache invalidieren für Aktualisierung
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    },
    onError: (error) => {
      console.error('Reservierung erstellen fehlgeschlagen:', error)
    }
  })
}

export function useUpdateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateReservation,
    onSuccess: (data) => {
      // Spezifische Reservierung im Cache aktualisieren
      queryClient.setQueryData(['reservation', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    }
  })
}
```

### Form-Management Hooks
```typescript
// src/hooks/use-reservation-form.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReservationSchema } from '@/lib/validations/reservation'

export function useReservationForm(initialData?: Reservation) {
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(ReservationSchema),
    defaultValues: {
      dateTime: initialData?.dateTime || new Date(),
      partySize: initialData?.partySize || 2,
      customerEmail: initialData?.customer.email || '',
      specialRequests: initialData?.specialRequests || '',
    }
  })

  const { handleSubmit, formState: { isValid, isSubmitting } } = form

  return {
    form,
    isValid,
    isSubmitting,
    handleSubmit
  }
}
```

## 🗄️ Datenbank-Entwicklung

### Prisma Schema Patterns
```prisma
// Basis-Felder für alle Modelle
model BaseModel {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Soft Delete Pattern
model Customer {
  id        String   @id @default(cuid())
  // ... andere Felder
  deletedAt DateTime?
  
  @@map("customers")
}

// Audit Trail Pattern
model AuditLog {
  id          String    @id @default(cuid())
  entityType  String    // 'Customer', 'Reservation', etc.
  entityId    String
  action      String    // 'CREATE', 'UPDATE', 'DELETE'
  oldValues   Json?
  newValues   Json?
  userId      String
  timestamp   DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id])
  
  @@map("audit_logs")
}
```

### Datenbank-Migrations
```bash
# Schema-Änderungen anwenden
npx prisma db push

# Migration erstellen (Production)
npx prisma migrate dev --name add_user_preferences

# Migration in Production anwenden
npx prisma migrate deploy

# Schema zurücksetzen (Development)
npx prisma migrate reset
```

### Seed-Daten entwickeln
```typescript
// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding development data...')

  // Benutzer erstellen
  const admin = await prisma.user.upsert({
    where: { email: 'admin@badezeit.de' },
    update: {},
    create: {
      email: 'admin@badezeit.de',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      clerkId: 'dev_admin_id'
    }
  })

  // Tische erstellen
  const tables = await Promise.all([
    prisma.table.create({
      data: {
        number: 1,
        capacity: 4,
        location: 'TERRACE_SEA_VIEW',
        xPosition: 100,
        yPosition: 100
      }
    }),
    // ... weitere Tische
  ])

  // Test-Kunden erstellen
  const customer = await prisma.customer.create({
    data: {
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max.mustermann@email.de',
      phone: '+49 171 1234567',
      emailConsent: true,
      dataProcessingConsent: true
    }
  })

  // Test-Reservierungen erstellen
  await prisma.reservation.create({
    data: {
      customerId: customer.id,
      tableId: tables[0].id,
      dateTime: new Date(Date.now() + 86400000), // Morgen
      partySize: 2,
      status: 'CONFIRMED',
      createdById: admin.id
    }
  })

  console.log('✅ Seed data created successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## 🔄 Server Actions

### Server Action Beispiel
```typescript
// src/app/actions/reservations.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ReservationSchema } from '@/lib/validations/reservation'
import { sendReservationConfirmation } from '@/lib/email'

export async function createReservation(
  prevState: any,
  formData: FormData
) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Nicht authentifiziert')
  }

  // Form-Daten validieren
  const rawData = {
    dateTime: new Date(formData.get('dateTime') as string),
    partySize: parseInt(formData.get('partySize') as string),
    customerEmail: formData.get('customerEmail') as string,
    specialRequests: formData.get('specialRequests') as string,
  }

  const validatedData = ReservationSchema.safeParse(rawData)
  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
      message: 'Ungültige Formular-Daten'
    }
  }

  try {
    // Verfügbarkeit prüfen
    const isAvailable = await checkAvailability(
      validatedData.data.dateTime,
      validatedData.data.partySize
    )

    if (!isAvailable) {
      return {
        errors: {},
        message: 'Keine Verfügbarkeit für den gewählten Zeitpunkt'
      }
    }

    // Kunden finden oder erstellen
    let customer = await prisma.customer.findUnique({
      where: { email: validatedData.data.customerEmail }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          email: validatedData.data.customerEmail,
          emailConsent: formData.get('emailConsent') === 'on',
          dataProcessingConsent: true
        }
      })
    }

    // Reservierung erstellen
    const reservation = await prisma.reservation.create({
      data: {
        customerId: customer.id,
        dateTime: validatedData.data.dateTime,
        partySize: validatedData.data.partySize,
        specialRequests: validatedData.data.specialRequests,
        status: 'PENDING',
        createdById: user.id
      },
      include: {
        customer: true,
        table: true
      }
    })

    // Bestätigungs-E-Mail senden
    if (customer.emailConsent) {
      await sendReservationConfirmation(reservation)
    }

    // Cache invalidieren
    revalidatePath('/dashboard/reservierungen')
    
    return {
      success: true,
      reservationId: reservation.id
    }

  } catch (error) {
    console.error('Reservierung erstellen fehlgeschlagen:', error)
    return {
      errors: {},
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
    }
  }
}

async function checkAvailability(dateTime: Date, partySize: number) {
  // Verfügbarkeitsprüfung implementieren
  const conflictingReservations = await prisma.reservation.count({
    where: {
      dateTime: {
        gte: new Date(dateTime.getTime() - 2 * 60 * 60 * 1000), // 2h vorher
        lte: new Date(dateTime.getTime() + 2 * 60 * 60 * 1000)  // 2h nachher
      },
      status: {
        in: ['CONFIRMED', 'SEATED']
      }
    }
  })

  // Vereinfachte Logik - in Realität komplexere Tischzuteilung
  return conflictingReservations < 10
}
```

### Form mit Server Action
```typescript
// src/components/forms/reservation-form.tsx
'use client'

import { useActionState } from 'react'
import { createReservation } from '@/app/actions/reservations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState = {
  message: '',
  errors: {}
}

export function ReservationForm() {
  const [state, formAction, isPending] = useActionState(
    createReservation,
    initialState
  )

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="dateTime">Datum & Uhrzeit</label>
        <Input 
          type="datetime-local"
          id="dateTime"
          name="dateTime"
          required
        />
        {state.errors?.dateTime && (
          <p className="text-red-500 text-sm">{state.errors.dateTime}</p>
        )}
      </div>

      <div>
        <label htmlFor="partySize">Anzahl Personen</label>
        <Input 
          type="number"
          id="partySize"
          name="partySize"
          min="1"
          max="12"
          required
        />
        {state.errors?.partySize && (
          <p className="text-red-500 text-sm">{state.errors.partySize}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Wird erstellt...' : 'Reservierung erstellen'}
      </Button>

      {state.message && (
        <p className={state.success ? 'text-green-500' : 'text-red-500'}>
          {state.message}
        </p>
      )}
    </form>
  )
}
```

## 📧 E-Mail-System

### React Email Templates
```typescript
// src/lib/email/templates/reservation-confirmation.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
  Hr
} from '@react-email/components'

interface ReservationConfirmationProps {
  customerName: string
  reservationDate: string
  reservationTime: string
  partySize: number
  tableNumber?: number
  specialRequests?: string
  confirmationId: string
}

export function ReservationConfirmationEmail({
  customerName,
  reservationDate,
  reservationTime,
  partySize,
  tableNumber,
  specialRequests,
  confirmationId
}: ReservationConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Ihre Reservierung im Strandrestaurant Badezeit ist bestätigt
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://badezeit.de/logo.png"
            width="200"
            height="80"
            alt="Strandrestaurant Badezeit"
            style={logo}
          />
          
          <Text style={title}>
            Reservierung bestätigt
          </Text>
          
          <Text style={paragraph}>
            Liebe/r {customerName},
          </Text>
          
          <Text style={paragraph}>
            vielen Dank für Ihre Reservierung! Wir freuen uns auf Ihren Besuch
            in unserem Strandrestaurant Badezeit.
          </Text>
          
          <Section style={details}>
            <Text style={detailsTitle}>Ihre Reservierungsdetails:</Text>
            <Text style={detailItem}>📅 Datum: {reservationDate}</Text>
            <Text style={detailItem}>🕐 Uhrzeit: {reservationTime}</Text>
            <Text style={detailItem}>👥 Personen: {partySize}</Text>
            {tableNumber && (
              <Text style={detailItem}>🪑 Tisch: {tableNumber}</Text>
            )}
            <Text style={detailItem}>🔢 Bestätigungs-Nr.: {confirmationId}</Text>
          </Section>
          
          {specialRequests && (
            <Section style={requests}>
              <Text style={requestsTitle}>Ihre besonderen Wünsche:</Text>
              <Text style={paragraph}>{specialRequests}</Text>
            </Section>
          )}
          
          <Hr style={divider} />
          
          <Section style={location}>
            <Text style={locationTitle}>So finden Sie uns:</Text>
            <Text style={paragraph}>
              Strandrestaurant Badezeit<br />
              Dünenstraße 3<br />
              25980 Westerland, Sylt<br />
              Tel: +49 4651 834020
            </Text>
          </Section>
          
          <Section style={actions}>
            <Link
              href={`https://badezeit.de/reservierung/stornieren/${confirmationId}`}
              style={cancelButton}
            >
              Reservierung stornieren
            </Link>
          </Section>
          
          <Text style={footer}>
            Mit nordischen Grüßen,<br />
            Ihr Team vom Strandrestaurant Badezeit
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  padding: '20px 0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '5px',
  margin: '0 auto',
  padding: '20px',
  width: '580px',
}

const logo = {
  margin: '0 auto 30px',
}

const title = {
  color: '#2563eb',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 30px',
}

// ... weitere Styles
```

### E-Mail versenden
```typescript
// src/lib/email/send-email.ts
import { Resend } from 'resend'
import { ReservationConfirmationEmail } from './templates/reservation-confirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendReservationConfirmation(reservation: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Strandrestaurant Badezeit <noreply@badezeit.de>',
      to: reservation.customer.email,
      subject: 'Reservierung bestätigt - Strandrestaurant Badezeit',
      react: ReservationConfirmationEmail({
        customerName: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
        reservationDate: reservation.dateTime.toLocaleDateString('de-DE'),
        reservationTime: reservation.dateTime.toLocaleTimeString('de-DE'),
        partySize: reservation.partySize,
        tableNumber: reservation.table?.number,
        specialRequests: reservation.specialRequests,
        confirmationId: reservation.id
      })
    })

    if (error) {
      console.error('E-Mail-Versand fehlgeschlagen:', error)
      return false
    }

    console.log('E-Mail gesendet:', data?.id)
    return true

  } catch (error) {
    console.error('E-Mail-Fehler:', error)
    return false
  }
}
```

## 🛡️ Authentifizierung & Autorisierung

### Auth Utilities
```typescript
// src/lib/auth.ts
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './db'

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'KITCHEN'

export async function getCurrentUser() {
  // Development Mode: Clerk deaktiviert
  if (!isClerkConfigured()) {
    return {
      id: 'dev-user-id',
      clerkId: 'dev-clerk-id',
      email: 'dev@badezeit.de',
      firstName: 'Development',
      lastName: 'User',
      role: 'ADMIN' as UserRole,
      isActive: true
    }
  }

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id }
  })

  return user
}

export function isClerkConfigured() {
  return (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_') &&
    process.env.CLERK_SECRET_KEY &&
    process.env.CLERK_SECRET_KEY.startsWith('sk_')
  )
}

export function hasRole(userRole: UserRole, requiredRoles: UserRole[]) {
  return requiredRoles.includes(userRole)
}

export function canAccessDashboard(role: UserRole) {
  return hasRole(role, ['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN'])
}

export function canManageReservations(role: UserRole) {
  return hasRole(role, ['ADMIN', 'MANAGER', 'STAFF'])
}

export function canManageMenu(role: UserRole) {
  return hasRole(role, ['ADMIN', 'MANAGER', 'KITCHEN'])
}

export function canAccessAnalytics(role: UserRole) {
  return hasRole(role, ['ADMIN', 'MANAGER'])
}

export function canManageSettings(role: UserRole) {
  return hasRole(role, ['ADMIN'])
}
```

### Schutz für Server Actions
```typescript
// src/lib/auth/protect-action.ts
import { getCurrentUser } from './auth'
import { UserRole } from '@prisma/client'

export function withAuth<T extends any[], R>(
  requiredRoles: UserRole[],
  action: (user: any, ...args: T) => Promise<R>
) {
  return async function protectedAction(...args: T): Promise<R> {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error('Nicht authentifiziert')
    }

    if (!requiredRoles.includes(user.role)) {
      throw new Error('Nicht autorisiert')
    }

    return action(user, ...args)
  }
}

// Verwendung
export const deleteReservation = withAuth(
  ['ADMIN', 'MANAGER'],
  async (user, reservationId: string) => {
    // Nur ADMIN und MANAGER können Reservierungen löschen
    return await prisma.reservation.delete({
      where: { id: reservationId }
    })
  }
)
```

## 🎨 Styling & Design System

### Tailwind CSS Konfiguration
```javascript
// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Restaurant-spezifische Farben
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e',
        },
        sand: {
          50: '#fffef7',
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fcd34d',
          500: '#f59e0b',
        },
        // shadcn/ui Farben
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### CSS Custom Properties
```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Restaurant Branding */
    --restaurant-primary: 14 165 233; /* ocean-500 */
    --restaurant-secondary: 245 158 11; /* sand-500 */
    
    /* Light Theme */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
  }

  .dark {
    /* Dark Theme (optional) */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... weitere Dark Theme Variablen */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer components {
  /* Restaurant-spezifische Komponenten */
  .restaurant-gradient {
    @apply bg-gradient-to-br from-ocean-500 to-ocean-600;
  }
  
  .sand-texture {
    @apply bg-sand-50 bg-opacity-50;
  }
  
  .ocean-wave {
    position: relative;
  }
  
  .ocean-wave::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(45deg, #0ea5e9, #0284c7);
    border-radius: 2px;
  }
}
```

## 🧪 Testing

### Test Setup (Empfehlung)
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom vitest
```

### Unit Test Beispiel
```typescript
// src/__tests__/lib/auth.test.ts
import { describe, it, expect, vi } from 'vitest'
import { hasRole, canAccessDashboard } from '@/lib/auth'

describe('Auth Utils', () => {
  describe('hasRole', () => {
    it('should return true when user has required role', () => {
      expect(hasRole('ADMIN', ['ADMIN', 'MANAGER'])).toBe(true)
      expect(hasRole('MANAGER', ['ADMIN', 'MANAGER'])).toBe(true)
    })

    it('should return false when user does not have required role', () => {
      expect(hasRole('STAFF', ['ADMIN', 'MANAGER'])).toBe(false)
      expect(hasRole('KITCHEN', ['ADMIN'])).toBe(false)
    })
  })

  describe('canAccessDashboard', () => {
    it('should allow all valid roles to access dashboard', () => {
      expect(canAccessDashboard('ADMIN')).toBe(true)
      expect(canAccessDashboard('MANAGER')).toBe(true)
      expect(canAccessDashboard('STAFF')).toBe(true)
      expect(canAccessDashboard('KITCHEN')).toBe(true)
    })
  })
})
```

### Component Test Beispiel
```typescript
// src/__tests__/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
    
    rerender(<Button variant="secondary">Cancel</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-secondary')
  })
})
```

## 🚀 Performance & Optimierung

### Bundle Analyzer
```bash
# Bundle-Größe analysieren
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.ts erweitern
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

### Image Optimierung
```typescript
// Responsive Images mit Next.js
import Image from 'next/image'

export function RestaurantImage({ src, alt }: { src: string, alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..." // Low-quality placeholder
      className="object-cover rounded-lg"
    />
  )
}
```

### Database Query Optimierung
```typescript
// Prisma Query Optimierung
export async function getReservationsWithCustomers() {
  return await prisma.reservation.findMany({
    // Nur erforderliche Felder laden
    select: {
      id: true,
      dateTime: true,
      partySize: true,
      status: true,
      customer: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    // Sortierung auf DB-Ebene
    orderBy: {
      dateTime: 'desc'
    },
    // Pagination
    take: 50,
    skip: 0
  })
}
```

## 🔍 Debugging

### Development Tools
```typescript
// src/lib/debug.ts
export const isDev = process.env.NODE_ENV === 'development'

export function devLog(message: string, data?: any) {
  if (isDev) {
    console.log(`🐛 [DEBUG] ${message}`, data)
  }
}

export function devError(message: string, error?: any) {
  if (isDev) {
    console.error(`❌ [ERROR] ${message}`, error)
  }
}

export function devWarn(message: string, data?: any) {
  if (isDev) {
    console.warn(`⚠️ [WARN] ${message}`, data)
  }
}
```

### Error Boundary
```typescript
// src/components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-4">
              Etwas ist schiefgelaufen
            </h2>
            <p className="text-muted-foreground mb-4">
              Ein unerwarteter Fehler ist aufgetreten.
            </p>
            <Button
              onClick={() => this.setState({ hasError: false })}
            >
              Erneut versuchen
            </Button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

## 📦 Deployment

### Vercel Deployment
```bash
# Vercel CLI installieren
npm i -g vercel

# Projekt mit Vercel verknüpfen
vercel link

# Umgebungsvariablen setzen
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY
vercel env add RESEND_API_KEY

# Production deployment
vercel --prod
```

### Docker (Alternative)
```dockerfile
# Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

## 📝 Code-Qualität

### Pre-commit Hooks (Empfehlung)
```bash
npm install -D husky lint-staged

# package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{md,json}": [
      "prettier --write"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check"
    }
  }
}
```

### TypeScript Konfiguration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": ".",
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

---

**Strandrestaurant Badezeit** - Entwicklerhandbuch  
*Version 1.0 - Stand: Januar 2025*  
*Für technische Fragen: tech@badezeit.de*