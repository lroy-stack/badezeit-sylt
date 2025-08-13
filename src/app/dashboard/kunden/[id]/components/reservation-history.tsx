'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar,
  Clock,
  Users,
  Table,
  MapPin,
  Search,
  Filter,
  ExternalLink,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Reservation {
  id: string
  dateTime: Date
  partySize: number
  duration: number
  status: string
  specialRequests: string | null
  occasion: string | null
  table: {
    id: string
    number: number
    capacity: number
    location: string
  } | null
}

interface ReservationHistoryProps {
  reservations: Reservation[]
}

const STATUS_CONFIG = {
  PENDING: { label: 'Wartend', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-300' },
  CONFIRMED: { label: 'Bestätigt', color: 'bg-green-100 text-green-800', border: 'border-green-300' },
  SEATED: { label: 'Eingecheckt', color: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
  COMPLETED: { label: 'Abgeschlossen', color: 'bg-gray-100 text-gray-800', border: 'border-gray-300' },
  CANCELLED: { label: 'Storniert', color: 'bg-red-100 text-red-800', border: 'border-red-300' },
  NO_SHOW: { label: 'Nicht erschienen', color: 'bg-red-100 text-red-800', border: 'border-red-300' }
}

const TABLE_LOCATIONS = {
  TERRACE: 'Terrasse',
  INDOOR: 'Innenbereich',
  BAR: 'Bar', 
  PRIVATE: 'Separé'
}

export function ReservationHistory({ reservations }: ReservationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = searchTerm === '' || 
      reservation.occasion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.specialRequests?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.table?.number.toString().includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort reservations
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      case 'date-asc':
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      case 'party-size-desc':
        return b.partySize - a.partySize
      case 'party-size-asc':
        return a.partySize - b.partySize
      default:
        return 0
    }
  })

  const upcomingReservations = sortedReservations.filter(r => 
    new Date(r.dateTime) > new Date() && ['PENDING', 'CONFIRMED'].includes(r.status)
  )
  const pastReservations = sortedReservations.filter(r => 
    new Date(r.dateTime) <= new Date() || !['PENDING', 'CONFIRMED'].includes(r.status)
  )

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const config = STATUS_CONFIG[reservation.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
    const isPast = new Date(reservation.dateTime) < new Date()

    return (
      <Card className={cn("hover:shadow-md transition-shadow", isPast && "opacity-75")}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={config.color}>
                  {config.label}
                </Badge>
                {reservation.occasion && (
                  <Badge variant="outline" className="text-xs">
                    {reservation.occasion}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{format(reservation.dateTime, 'dd.MM.yyyy', { locale: de })}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{format(reservation.dateTime, 'HH:mm', { locale: de })} Uhr ({reservation.duration} Min.)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span>{reservation.partySize} {reservation.partySize === 1 ? 'Person' : 'Personen'}</span>
                </div>
                
                {reservation.table && (
                  <div className="flex items-center gap-2">
                    <Table className="h-3 w-3 text-muted-foreground" />
                    <span>
                      Tisch {reservation.table.number} • {' '}
                      {TABLE_LOCATIONS[reservation.table.location as keyof typeof TABLE_LOCATIONS]}
                    </span>
                  </div>
                )}
              </div>
              
              {reservation.specialRequests && (
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  <strong>Wünsche:</strong> {reservation.specialRequests}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/reservierungen/${reservation.id}`}>
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Details
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reservierungshistorie ({reservations.length})
            </div>
            <Button asChild>
              <Link href="/dashboard/reservierungen/neu">
                <Plus className="h-4 w-4 mr-2" />
                Neue Reservierung
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Suchen</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Anlass, Wünsche, Tisch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="PENDING">Wartend</SelectItem>
                  <SelectItem value="CONFIRMED">Bestätigt</SelectItem>
                  <SelectItem value="SEATED">Eingecheckt</SelectItem>
                  <SelectItem value="COMPLETED">Abgeschlossen</SelectItem>
                  <SelectItem value="CANCELLED">Storniert</SelectItem>
                  <SelectItem value="NO_SHOW">Nicht erschienen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sortierung</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Datum (neueste zuerst)</SelectItem>
                  <SelectItem value="date-asc">Datum (älteste zuerst)</SelectItem>
                  <SelectItem value="party-size-desc">Gruppengröße (groß → klein)</SelectItem>
                  <SelectItem value="party-size-asc">Gruppengröße (klein → groß)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Kommende</p>
                <p className="text-2xl font-bold">{upcomingReservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Vergangene</p>
                <p className="text-2xl font-bold">{pastReservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Ø Personen</p>
                <p className="text-2xl font-bold">
                  {reservations.length > 0 
                    ? (reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length).toFixed(1)
                    : '0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Table className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Abgeschlossen</p>
                <p className="text-2xl font-bold">
                  {reservations.filter(r => r.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reservations */}
      {upcomingReservations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Kommende Reservierungen ({upcomingReservations.length})</h3>
          <div className="space-y-4">
            {upcomingReservations.map(reservation => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        </div>
      )}

      {/* Past Reservations */}
      {pastReservations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vergangene Reservierungen ({pastReservations.length})</h3>
          <div className="space-y-4">
            {pastReservations.map(reservation => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedReservations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {reservations.length === 0 ? 'Keine Reservierungen' : 'Keine passenden Reservierungen'}
            </h3>
            <p className="text-muted-foreground">
              {reservations.length === 0 
                ? 'Dieser Kunde hat noch keine Reservierungen getätigt.'
                : 'Keine Reservierungen entsprechen den aktuellen Filterkriterien.'
              }
            </p>
            {reservations.length === 0 && (
              <Button className="mt-4" asChild>
                <Link href="/dashboard/reservierungen/neu">
                  Erste Reservierung erstellen
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}