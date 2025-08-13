import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { 
  ArrowLeft,
  Clock,
  Users,
  Table,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { ReservationActions } from '../components/reservation-actions'
import { CustomerInfo } from '../components/customer-info'
import { ReservationNotes } from '../components/reservation-notes'

interface ReservationDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

async function getReservation(id: string) {
  const reservation = await db.reservation.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          notes: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          reservations: {
            select: {
              id: true,
              dateTime: true,
              status: true,
              partySize: true
            },
            orderBy: {
              dateTime: 'desc'
            },
            take: 5
          }
        }
      },
      table: {
        select: {
          id: true,
          number: true,
          capacity: true,
          location: true,
          xPosition: true,
          yPosition: true
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

function ReservationStatus({ status, className }: { status: string; className?: string }) {
  const statusConfig = {
    PENDING: { 
      label: 'Wartend auf Bestätigung', 
      icon: Clock,
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800' 
    },
    CONFIRMED: { 
      label: 'Bestätigt', 
      icon: CheckCircle,
      color: 'bg-green-100 border-green-300 text-green-800' 
    },
    SEATED: { 
      label: 'Gäste eingetroffen', 
      icon: Users,
      color: 'bg-blue-100 border-blue-300 text-blue-800' 
    },
    COMPLETED: { 
      label: 'Abgeschlossen', 
      icon: CheckCircle,
      color: 'bg-gray-100 border-gray-300 text-gray-800' 
    },
    CANCELLED: { 
      label: 'Storniert', 
      icon: XCircle,
      color: 'bg-red-100 border-red-300 text-red-800' 
    },
    NO_SHOW: { 
      label: 'Nicht erschienen', 
      icon: AlertTriangle,
      color: 'bg-red-100 border-red-300 text-red-800' 
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  const Icon = config.icon
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.color} ${className}`}>
      <Icon className="h-4 w-4" />
      <span className="font-medium">{config.label}</span>
    </div>
  )
}

function ReservationTimeline({ reservation }: { reservation: any }) {
  const events = [
    {
      title: 'Reservierung erstellt',
      description: `Erstellt von ${reservation.createdBy?.firstName} ${reservation.createdBy?.lastName}`,
      timestamp: reservation.createdAt,
      icon: Calendar,
      status: 'completed'
    }
  ]

  if (reservation.isConfirmed && reservation.confirmationSentAt) {
    events.push({
      title: 'Bestätigung gesendet',
      description: 'Bestätigungs-E-Mail an Kunden gesendet',
      timestamp: reservation.confirmationSentAt,
      icon: Mail,
      status: 'completed'
    })
  }

  if (reservation.reminderSentAt) {
    events.push({
      title: 'Erinnerung gesendet',
      description: 'Erinnerungs-E-Mail an Kunden gesendet',
      timestamp: reservation.reminderSentAt,
      icon: Clock,
      status: 'completed'
    })
  }

  if (reservation.checkedInAt) {
    events.push({
      title: 'Gäste eingetroffen',
      description: 'Check-in durchgeführt',
      timestamp: reservation.checkedInAt,
      icon: Users,
      status: 'completed'
    })
  }

  if (reservation.completedAt) {
    events.push({
      title: 'Reservierung abgeschlossen',
      description: 'Gäste haben das Restaurant verlassen',
      timestamp: reservation.completedAt,
      icon: CheckCircle,
      status: 'completed'
    })
  }

  if (reservation.cancelledAt) {
    events.push({
      title: 'Reservierung storniert',
      description: reservation.cancellationReason || 'Keine Gründe angegeben',
      timestamp: reservation.cancelledAt,
      icon: XCircle,
      status: 'cancelled'
    })
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const Icon = event.icon
        return (
          <div key={index} className="flex gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              event.status === 'completed' ? 'bg-green-100 text-green-600' :
              event.status === 'cancelled' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.description}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.timestamp), 'dd.MM.yyyy HH:mm', { locale: de })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default async function ReservationDetailsPage({ params }: ReservationDetailsPageProps) {
  const user = await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
  const resolvedParams = await params
  const reservation = await getReservation(resolvedParams.id)
  
  if (!reservation) {
    notFound()
  }
  
  const reservationDateTime = new Date(reservation.dateTime)
  const isUpcoming = reservationDateTime > new Date()
  
  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/reservierungen">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Reservierung #{reservation.id.slice(-8)}
            </h1>
            <p className="text-muted-foreground">
              {reservation.customer.firstName} {reservation.customer.lastName} • {' '}
              {format(reservationDateTime, 'EEEE, dd. MMMM yyyy \\u\\m HH:mm', { locale: de })} Uhr
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ReservationStatus status={reservation.status} />
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/reservierungen/${reservation.id}/bearbeiten`}>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reservation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reservierungsdetails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Datum & Zeit</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(reservationDateTime, 'dd.MM.yyyy HH:mm', { locale: de })}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Personenanzahl</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {reservation.partySize} Personen
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Dauer</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {reservation.duration} Minuten
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tisch</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Table className="h-3 w-3" />
                    {reservation.table ? (
                      `Tisch ${reservation.table.number}`
                    ) : (
                      <span className="text-orange-600">Nicht zugewiesen</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {reservation.specialRequests && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Besondere Wünsche</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {reservation.specialRequests}
                  </p>
                </div>
              )}
              
              {reservation.dietaryNotes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Diät-Hinweise</p>
                  <p className="text-sm text-muted-foreground bg-orange-50 p-3 rounded-lg border-l-4 border-orange-200">
                    {reservation.dietaryNotes}
                  </p>
                </div>
              )}
              
              {reservation.occasion && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Anlass</p>
                  <Badge variant="secondary">{reservation.occasion}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Customer Information */}
          <Suspense fallback={<div className="h-64 bg-muted rounded-lg animate-pulse" />}>
            <CustomerInfo customer={reservation.customer} />
          </Suspense>
          
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Reservierungsverlauf
              </CardTitle>
              <CardDescription>
                Chronologische Übersicht aller Ereignisse zu dieser Reservierung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReservationTimeline reservation={reservation} />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Suspense fallback={<div className="h-32 bg-muted rounded-lg animate-pulse" />}>
            <ReservationActions reservation={reservation} userRole={user.role} />
          </Suspense>
          
          {/* Table Information */}
          {reservation.table && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  Tischdetails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tisch Nummer:</span>
                  <span className="text-sm">{reservation.table.number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Kapazität:</span>
                  <span className="text-sm">{reservation.table.capacity} Personen</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Bereich:</span>
                  <span className="text-sm">{reservation.table.location.replace('_', ' ')}</span>
                </div>
                
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/tische">
                    <MapPin className="h-4 w-4 mr-2" />
                    Tischübersicht anzeigen
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Notes */}
          <Suspense fallback={<div className="h-48 bg-muted rounded-lg animate-pulse" />}>
            <ReservationNotes 
              reservationId={reservation.id} 
              existingNotes={reservation.notes || ''}
              userRole={user.role}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
