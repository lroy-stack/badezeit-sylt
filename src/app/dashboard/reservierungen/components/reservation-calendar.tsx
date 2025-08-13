'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addWeeks, 
  subWeeks,
  isSameDay,
  parseISO,
  getHours,
  getMinutes
} from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Users,
  Table as TableIcon,
  Phone,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// Helper to ensure we have a Date object
const ensureDate = (dateValue: string | Date): Date => {
  return dateValue instanceof Date ? dateValue : parseISO(dateValue)
}

interface Reservation {
  id: string
  dateTime: string | Date
  partySize: number
  duration: number
  status: string
  specialRequests?: string | null
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    isVip: boolean
  }
  table?: {
    id: string
    number: number
    capacity: number
    location: string
  } | null
}

interface Table {
  id: string
  number: number
  capacity: number
  location: string
}

interface ReservationCalendarProps {
  reservations: Reservation[]
  tables: Table[]
  currentDate: Date
}

function ReservationCard({ 
  reservation, 
  onTableAssignment,
  availableTables 
}: { 
  reservation: Reservation
  onTableAssignment: (reservationId: string, tableId: string) => void
  availableTables: Table[]
}) {
  const [isAssigning, setIsAssigning] = useState(false)
  
  const statusConfig = {
    PENDING: { label: 'Wartend', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
    CONFIRMED: { label: 'Bestätigt', color: 'bg-green-100 border-green-300 text-green-800' },
    SEATED: { label: 'Eingetroffen', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    COMPLETED: { label: 'Abgeschlossen', color: 'bg-gray-100 border-gray-300 text-gray-800' },
    CANCELLED: { label: 'Storniert', color: 'bg-red-100 border-red-300 text-red-800' },
    NO_SHOW: { label: 'Nicht erschienen', color: 'bg-red-100 border-red-300 text-red-800' }
  }
  
  const config = statusConfig[reservation.status as keyof typeof statusConfig] || statusConfig.PENDING
  const time = format(ensureDate(reservation.dateTime), 'HH:mm')
  
  return (
    <div 
      className={`p-3 rounded-lg border-l-4 mb-2 cursor-pointer hover:shadow-md transition-all ${
        config.color
      } ${reservation.status === 'PENDING' ? 'animate-pulse' : ''}`}
      draggable={reservation.status === 'PENDING' || reservation.status === 'CONFIRMED'}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          reservationId: reservation.id,
          type: 'reservation'
        }))
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3 w-3" />
            <span className="text-sm font-medium">{time}</span>
            {reservation.customer.isVip && (
              <Badge variant="secondary" className="text-xs px-1 py-0">VIP</Badge>
            )}
          </div>
          <p className="font-semibold text-sm">
            {reservation.customer.firstName} {reservation.customer.lastName}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Users className="h-3 w-3" />
            <span>{reservation.partySize} Personen</span>
            {reservation.table ? (
              <>
                <TableIcon className="h-3 w-3" />
                <span>Tisch {reservation.table.number}</span>
              </>
            ) : (
              <div className="flex items-center gap-1 text-orange-600">
                <AlertCircle className="h-3 w-3" />
                <span>Kein Tisch</span>
              </div>
            )}
          </div>
        </div>
        
        <Badge variant="outline" className="text-xs">
          {config.label}
        </Badge>
      </div>
      
      {reservation.specialRequests && (
        <p className="text-xs text-muted-foreground mt-2 italic">
          "{reservation.specialRequests}"
        </p>
      )}
      
      {!reservation.table && availableTables.length > 0 && (
        <div className="mt-2 pt-2 border-t border-dashed">
          <p className="text-xs text-muted-foreground mb-1">Tisch zuweisen:</p>
          <div className="flex gap-1 flex-wrap">
            {availableTables.slice(0, 3).map((table) => (
              <Button
                key={table.id}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={() => onTableAssignment(reservation.id, table.id)}
              >
                Tisch {table.number}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CalendarDay({ 
  date, 
  reservations,
  isSelected,
  onDateSelect
}: {
  date: Date
  reservations: Reservation[]
  isSelected: boolean
  onDateSelect: (date: Date) => void
}) {
  const dayReservations = reservations.filter(r => 
    isSameDay(ensureDate(r.dateTime), date)
  ).sort((a, b) => ensureDate(a.dateTime).getTime() - ensureDate(b.dateTime).getTime())
  
  const confirmedCount = dayReservations.filter(r => 
    ['CONFIRMED', 'SEATED'].includes(r.status)
  ).length
  
  const pendingCount = dayReservations.filter(r => r.status === 'PENDING').length
  
  return (
    <div 
      className={`min-h-32 border rounded-lg p-2 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
      }`}
      onClick={() => onDateSelect(date)}
      onDrop={(e) => {
        e.preventDefault()
        const data = JSON.parse(e.dataTransfer.getData('text/plain'))
        if (data.type === 'reservation') {
          // Handle reservation drop - this would trigger the API call
          console.log('Move reservation', data.reservationId, 'to', date)
        }
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          {format(date, 'd', { locale: de })}
        </span>
        <div className="flex gap-1">
          {confirmedCount > 0 && (
            <Badge variant="default" className="h-4 px-1 text-xs">
              {confirmedCount}
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge variant="secondary" className="h-4 px-1 text-xs">
              {pendingCount}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-1 max-h-24 overflow-y-auto">
        {dayReservations.slice(0, 3).map((reservation) => (
          <div key={reservation.id} className="text-xs p-1 rounded bg-background border">
            <div className="flex items-center gap-1">
              <Clock className="h-2 w-2" />
              <span>{format(ensureDate(reservation.dateTime), 'HH:mm')}</span>
              <span className="truncate">
                {reservation.customer.firstName} {reservation.customer.lastName}
              </span>
            </div>
          </div>
        ))}
        {dayReservations.length > 3 && (
          <p className="text-xs text-muted-foreground">+{dayReservations.length - 3} mehr</p>
        )}
      </div>
    </div>
  )
}

export function ReservationCalendar({ reservations, tables, currentDate }: ReservationCalendarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState(currentDate)
  const [viewDate, setViewDate] = useState(currentDate)
  
  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(viewDate, { weekStartsOn: 1 })
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  const selectedDateReservations = useMemo(() => {
    return reservations.filter(r => 
      isSameDay(ensureDate(r.dateTime), selectedDate)
    ).sort((a, b) => ensureDate(a.dateTime).getTime() - ensureDate(b.dateTime).getTime())
  }, [reservations, selectedDate])
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    // Update URL with new date
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', format(date, 'yyyy-MM-dd'))
    router.push(`/dashboard/reservierungen?${params.toString()}`)
  }
  
  const handleTableAssignment = async (reservationId: string, tableId: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId })
      })
      
      if (response.ok) {
        // Trigger a custom event to refresh data
        window.dispatchEvent(new CustomEvent('reservation-updated'))
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to assign table:', error)
    }
  }
  
  const getAvailableTablesForReservation = (reservation: Reservation): Table[] => {
    return tables.filter(table => 
      table.capacity >= reservation.partySize &&
      !reservations.some(r => 
        r.id !== reservation.id &&
        r.table?.id === table.id &&
        isSameDay(ensureDate(r.dateTime), ensureDate(reservation.dateTime)) &&
        ['CONFIRMED', 'SEATED', 'PENDING'].includes(r.status)
      )
    )
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Wochenansicht
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewDate(subWeeks(viewDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-32 text-center">
                  {format(weekStart, 'dd.MM', { locale: de })} - {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewDate(addWeeks(viewDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
                <div key={day} className="text-center text-sm font-medium p-2">
                  {day}
                </div>
              ))}
              {daysOfWeek.map((date) => (
                <CalendarDay
                  key={date.toISOString()}
                  date={date}
                  reservations={reservations}
                  isSelected={isSameDay(date, selectedDate)}
                  onDateSelect={handleDateSelect}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Selected Day Details */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{format(selectedDate, 'EEEE, dd.MM.yyyy', { locale: de })}</span>
              <Badge variant="outline">
                {selectedDateReservations.length} Reservierungen
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateReservations.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedDateReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onTableAssignment={handleTableAssignment}
                    availableTables={getAvailableTablesForReservation(reservation)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">Keine Reservierungen</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keine Reservierungen für diesen Tag.
                </p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/dashboard/reservierungen/neu">
                    Neue Reservierung
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Schnellaktionen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link href={`/dashboard/reservierungen/neu?date=${format(selectedDate, 'yyyy-MM-dd')}`}>
                <Clock className="h-4 w-4 mr-2" />
                Reservierung hinzufügen
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link href="/dashboard/tische">
                <TableIcon className="h-4 w-4 mr-2" />
                Tischübersicht
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
