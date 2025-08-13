// Force dynamic rendering for authenticated route
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Table,
  MapPin,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { format, addDays, startOfToday, setHours, setMinutes } from 'date-fns'
import { de } from 'date-fns/locale'
import { NewReservationForm } from './components/new-reservation-form'

interface NewReservationPageProps {
  searchParams: Promise<{
    customerId?: string
    date?: string
    time?: string
  }>
}

async function getTables() {
  return await db.table.findMany({
    where: { isActive: true },
    select: {
      id: true,
      number: true,
      capacity: true,
      location: true,
      description: true,
      shape: true
    },
    orderBy: {
      number: 'asc'
    }
  })
}

async function getCustomer(customerId: string) {
  if (!customerId) return null
  
  return await db.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      language: true,
      preferredTime: true,
      preferredLocation: true,
      dietaryRestrictions: true,
      allergies: true,
      isVip: true
    }
  })
}

async function getAvailableTimeSlots(date: Date) {
  // Restaurant operating hours - would typically come from settings
  const openHour = 17 // 5 PM
  const closeHour = 23 // 11 PM
  const slotInterval = 30 // 30 minutes

  const timeSlots = []
  let currentHour = openHour
  let currentMinute = 0

  while (currentHour < closeHour || (currentHour === closeHour && currentMinute === 0)) {
    const timeSlot = setMinutes(setHours(date, currentHour), currentMinute)
    timeSlots.push(timeSlot)
    
    currentMinute += slotInterval
    if (currentMinute >= 60) {
      currentMinute = 0
      currentHour++
    }
  }

  return timeSlots
}

export default async function NewReservationPage({ searchParams }: NewReservationPageProps) {
  const user = await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
  const params = await searchParams
  
  const [tables, customer, timeSlots] = await Promise.all([
    getTables(),
    params.customerId ? getCustomer(params.customerId) : null,
    getAvailableTimeSlots(params.date ? new Date(params.date) : startOfToday())
  ])

  const selectedDate = params.date ? new Date(params.date) : addDays(startOfToday(), 0)
  const selectedTime = params.time || '19:00'

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/reservierungen">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu Reservierungen
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Neue Reservierung</h1>
            <p className="text-muted-foreground">
              Erstellen Sie eine neue Tischreservierung für {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Ausgewähltes Datum</p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, 'dd.MM.yyyy', { locale: de })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Table className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Verfügbare Tische</p>
                <p className="text-sm text-muted-foreground">
                  {tables.length} Tische aktiv
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Verfügbare Zeiten</p>
                <p className="text-sm text-muted-foreground">
                  {timeSlots.length} Zeitfenster
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Form */}
      <Suspense fallback={
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      }>
        <NewReservationForm
          tables={tables}
          timeSlots={timeSlots}
          preselectedCustomer={customer}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          currentUser={user}
        />
      </Suspense>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Hinweise zur Reservierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-700">
          <ul className="space-y-1 text-sm">
            <li>• Standarddauer: 2 Stunden (kann angepasst werden)</li>
            <li>• VIP-Kunden werden automatisch erkannt</li>
            <li>• Tischzuteilungen berücksichtigen Gruppengröße und Präferenzen</li>
            <li>• Bestätigungs-E-Mails werden automatisch gesendet (falls gewünscht)</li>
            <li>• Allergien und Diätanforderungen werden für die Küche gespeichert</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}