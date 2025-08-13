import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  Users,
  Table,
  AlertTriangle,
  History
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { EditReservationForm } from './components/edit-reservation-form'

interface EditReservationPageProps {
  params: Promise<{
    id: string
  }>
}

async function getReservation(id: string) {
  const reservation = await db.reservation.findUnique({
    where: { id },
    include: {
      customer: {
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
          isVip: true,
          emailConsent: true,
          marketingConsent: true,
          dataProcessingConsent: true
        }
      },
      table: {
        select: {
          id: true,
          number: true,
          capacity: true,
          location: true,
          description: true,
          shape: true
        }
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true
        }
      },
      updatedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true
        }
      }
    }
  })

  return reservation
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

async function getReservationHistory(id: string) {
  // For now, return empty array - this would typically come from an audit log
  // In a real implementation, you'd track all changes to reservations
  return []
}

function ReservationStatus({ status, className }: { status: string; className?: string }) {
  const statusConfig = {
    PENDING: { 
      label: 'Wartend auf Bestätigung', 
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800' 
    },
    CONFIRMED: { 
      label: 'Bestätigt', 
      color: 'bg-green-100 border-green-300 text-green-800' 
    },
    SEATED: { 
      label: 'Gäste eingetroffen', 
      color: 'bg-blue-100 border-blue-300 text-blue-800' 
    },
    COMPLETED: { 
      label: 'Abgeschlossen', 
      color: 'bg-gray-100 border-gray-300 text-gray-800' 
    },
    CANCELLED: { 
      label: 'Storniert', 
      color: 'bg-red-100 border-red-300 text-red-800' 
    },
    NO_SHOW: { 
      label: 'Nicht erschienen', 
      color: 'bg-red-100 border-red-300 text-red-800' 
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.color} ${className}`}>
      <span className="font-medium">{config.label}</span>
    </div>
  )
}

export default async function EditReservationPage({ params }: EditReservationPageProps) {
  const user = await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
  const resolvedParams = await params
  
  const [reservation, tables, history] = await Promise.all([
    getReservation(resolvedParams.id),
    getTables(),
    getReservationHistory(resolvedParams.id)
  ])
  
  if (!reservation) {
    notFound()
  }
  
  const reservationDateTime = new Date(reservation.dateTime)
  const isUpcoming = reservationDateTime > new Date()
  const canEdit = ['ADMIN', 'MANAGER'].includes(user.role) || 
                 (user.role === 'STAFF' && isUpcoming && ['PENDING', 'CONFIRMED'].includes(reservation.status))
  
  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/reservierungen/${reservation.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu Details
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Edit className="h-6 w-6" />
              Reservierung bearbeiten
            </h1>
            <p className="text-muted-foreground">
              #{reservation.id.slice(-8)} • {reservation.customer.firstName} {reservation.customer.lastName} • {' '}
              {format(reservationDateTime, 'EEEE, dd. MMMM yyyy \\u\\m HH:mm', { locale: de })} Uhr
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ReservationStatus status={reservation.status} />
        </div>
      </div>

      {/* Warning for past/completed reservations */}
      {!canEdit && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Eingeschränkte Bearbeitung</p>
                <p className="text-sm">
                  {!isUpcoming 
                    ? 'Vergangene Reservierungen können nur eingeschränkt bearbeitet werden.'
                    : ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(reservation.status)
                      ? 'Abgeschlossene oder stornierte Reservierungen können nur eingeschränkt bearbeitet werden.'
                      : 'Nur Manager und Administratoren können alle Reservierungen bearbeiten.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Datum</p>
                <p className="text-sm text-muted-foreground">
                  {format(reservationDateTime, 'dd.MM.yyyy', { locale: de })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Zeit</p>
                <p className="text-sm text-muted-foreground">
                  {format(reservationDateTime, 'HH:mm', { locale: de })} Uhr
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Personen</p>
                <p className="text-sm text-muted-foreground">
                  {reservation.partySize} Gäste
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Table className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Tisch</p>
                <p className="text-sm text-muted-foreground">
                  {reservation.table ? `Tisch ${reservation.table.number}` : 'Nicht zugewiesen'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Edit Form */}
        <div className="lg:col-span-2">
          <Suspense fallback={
            <Card>
              <CardContent className="p-12">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          }>
            <EditReservationForm
              reservation={reservation}
              tables={tables}
              currentUser={user}
              canEdit={canEdit}
            />
          </Suspense>
        </div>

        {/* Sidebar - Info & History */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kundeninformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {reservation.customer.firstName} {reservation.customer.lastName}
                  </p>
                  {reservation.customer.isVip && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      VIP
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{reservation.customer.email}</p>
                {reservation.customer.phone && (
                  <p className="text-sm text-muted-foreground">{reservation.customer.phone}</p>
                )}
              </div>

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/dashboard/kunden/${reservation.customer.id}`}>
                  Kundenprofil anzeigen
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Creation & Update Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-4 w-4" />
                Verlauf
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Erstellt</p>
                <p className="text-muted-foreground">
                  {format(reservation.createdAt, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                </p>
                <p className="text-muted-foreground text-xs">
                  von {reservation.createdBy.firstName} {reservation.createdBy.lastName}
                </p>
              </div>

              {reservation.updatedBy && (
                <div>
                  <p className="font-medium">Zuletzt bearbeitet</p>
                  <p className="text-muted-foreground">
                    {format(reservation.updatedAt, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                  </p>
                  <p className="text-muted-foreground text-xs">
                    von {reservation.updatedBy.firstName} {reservation.updatedBy.lastName}
                  </p>
                </div>
              )}

              {reservation.confirmationSentAt && (
                <div>
                  <p className="font-medium">Bestätigung gesendet</p>
                  <p className="text-muted-foreground">
                    {format(reservation.confirmationSentAt, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                  </p>
                </div>
              )}

              {reservation.reminderSentAt && (
                <div>
                  <p className="font-medium">Erinnerung gesendet</p>
                  <p className="text-muted-foreground">
                    {format(reservation.reminderSentAt, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                  </p>
                </div>
              )}

              {reservation.checkedInAt && (
                <div>
                  <p className="font-medium">Eingecheckt</p>
                  <p className="text-muted-foreground">
                    {format(reservation.checkedInAt, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                  </p>
                </div>
              )}

              {reservation.completedAt && (
                <div>
                  <p className="font-medium">Abgeschlossen</p>
                  <p className="text-muted-foreground">
                    {format(reservation.completedAt, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                  </p>
                </div>
              )}

              {reservation.cancelledAt && (
                <div>
                  <p className="font-medium">Storniert</p>
                  <p className="text-muted-foreground">
                    {format(reservation.cancelledAt, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                  </p>
                  {reservation.cancellationReason && (
                    <p className="text-muted-foreground text-xs">
                      Grund: {reservation.cancellationReason}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}