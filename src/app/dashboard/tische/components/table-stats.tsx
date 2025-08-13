'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  Users, 
  CheckCircle, 
  AlertCircle,
  QrCode,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react'

interface TableStatsProps {
  stats: {
    total: number
    active: number
    inactive: number
    totalCapacity: number
    currentOccupied: number
    upcomingReservations: number
    activeQrCodes: number
    occupancyRate: number
    locationStats: Record<string, { count: number; capacity: number }>
  }
}

export function TableStats({ stats }: TableStatsProps) {
  const locationLabels: Record<string, string> = {
    'TERRACE_SEA_VIEW': 'Terrasse Meerblick',
    'TERRACE_STANDARD': 'Terrasse Standard',
    'INDOOR_WINDOW': 'Innen Fenster',
    'INDOOR_STANDARD': 'Innen Standard',
    'BAR_AREA': 'Barbereich'
  }

  return (
    <div className="space-y-6">
      {/* Hauptstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Tische</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>{stats.active} aktiv</span>
              {stats.inactive > 0 && (
                <>
                  <span>•</span>
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <span>{stats.inactive} inaktiv</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kapazität</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCapacity}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Personen gesamt</span>
              {stats.active > 0 && (
                <>
                  <span>•</span>
                  <span>{Math.round(stats.totalCapacity / stats.active)} ⌀ pro Tisch</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auslastung</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{stats.currentOccupied} von {stats.active} besetzt</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservierungen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingReservations}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Anstehend</span>
              {stats.activeQrCodes > 0 && (
                <>
                  <span>•</span>
                  <QrCode className="h-3 w-3" />
                  <span>{stats.activeQrCodes} QR-Codes</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Standortstatistiken */}
      {Object.keys(stats.locationStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Verteilung nach Standort
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.locationStats).map(([location, data]) => (
                <div 
                  key={location}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {locationLabels[location] || location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.capacity} Plätze gesamt
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {data.count} Tische
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status-Legende */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status-Erklärung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Verfügbar</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-red-600" />
              <span>Besetzt</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-yellow-600" />
              <span>Reserviert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-blue-600 rounded-full" />
              <span>Wartung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-600 rounded-full" />
              <span>Außer Betrieb</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}