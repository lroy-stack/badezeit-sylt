'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { format, getHours, parseISO, getDay } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  Clock, 
  MapPin, 
  TrendingUp, 
  Users, 
  Calendar,
  BarChart3
} from 'lucide-react'

interface Reservation {
  dateTime: string
  partySize: number
  table: {
    location: string
    capacity: number
  } | null
}

interface OccupancyHeatmapProps {
  reservations: Reservation[]
  totalTables: number
  peakCapacity: number
  tableUtilization: number
}

const DAYS_OF_WEEK = [
  'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 
  'Donnerstag', 'Freitag', 'Samstag'
]

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const LOCATION_COLORS = {
  'TERRACE_SEA_VIEW': '#3b82f6',
  'TERRACE_STANDARD': '#10b981', 
  'INDOOR_WINDOW': '#f59e0b',
  'INDOOR_STANDARD': '#8b5cf6',
  'BAR_AREA': '#ef4444'
}

const LOCATION_LABELS = {
  'TERRACE_SEA_VIEW': 'Terrasse Meerblick',
  'TERRACE_STANDARD': 'Terrasse Standard',
  'INDOOR_WINDOW': 'Innen Fenster',
  'INDOOR_STANDARD': 'Innen Standard',
  'BAR_AREA': 'Barbereich'
}

export function OccupancyHeatmap({ 
  reservations, 
  totalTables, 
  peakCapacity,
  tableUtilization 
}: OccupancyHeatmapProps) {
  const [viewMode, setViewMode] = useState<'hourly' | 'daily' | 'location'>('hourly')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')

  // Process reservations data
  const processHourlyData = () => {
    const hourlyOccupancy = HOURS.map(hour => {
      const reservationsInHour = reservations.filter(r => {
        const reservationHour = getHours(parseISO(r.dateTime))
        return reservationHour === hour
      })

      const totalGuests = reservationsInHour.reduce((sum, r) => sum + r.partySize, 0)
      const reservationCount = reservationsInHour.length

      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        hourNumber: hour,
        guests: totalGuests,
        reservations: reservationCount,
        occupancyRate: totalTables > 0 ? (reservationCount / totalTables) * 100 : 0
      }
    })

    return hourlyOccupancy
  }

  const processDailyData = () => {
    const dailyOccupancy = DAYS_OF_WEEK.map((dayName, dayIndex) => {
      const reservationsOnDay = reservations.filter(r => {
        const dayOfWeek = getDay(parseISO(r.dateTime))
        return dayOfWeek === dayIndex
      })

      const totalGuests = reservationsOnDay.reduce((sum, r) => sum + r.partySize, 0)
      const reservationCount = reservationsOnDay.length

      return {
        day: dayName,
        dayIndex,
        guests: totalGuests,
        reservations: reservationCount,
        occupancyRate: totalTables > 0 ? (reservationCount / totalTables) * 100 : 0
      }
    })

    return dailyOccupancy
  }

  const processLocationData = () => {
    const locationOccupancy = Object.entries(LOCATION_LABELS).map(([key, label]) => {
      const reservationsAtLocation = reservations.filter(r => 
        r.table && r.table.location === key
      )

      const totalGuests = reservationsAtLocation.reduce((sum, r) => sum + r.partySize, 0)
      const reservationCount = reservationsAtLocation.length

      return {
        location: label,
        locationKey: key,
        guests: totalGuests,
        reservations: reservationCount,
        color: LOCATION_COLORS[key as keyof typeof LOCATION_COLORS]
      }
    })

    return locationOccupancy.filter(l => l.reservations > 0)
  }

  // Get peak hours
  const hourlyData = processHourlyData()
  const peakHours = hourlyData
    .filter(h => h.reservations > 0)
    .sort((a, b) => b.occupancyRate - a.occupancyRate)
    .slice(0, 3)

  const dailyData = processDailyData()
  const locationData = processLocationData()

  // Custom heatmap grid for hour x day view
  const getHeatmapData = () => {
    const heatmapData: Array<{
      hour: number
      day: number
      reservations: number
      guests: number
      intensity: number
    }> = []

    HOURS.forEach(hour => {
      DAYS_OF_WEEK.forEach((_, dayIndex) => {
        const reservationsInSlot = reservations.filter(r => {
          const reservationHour = getHours(parseISO(r.dateTime))
          const reservationDay = getDay(parseISO(r.dateTime))
          return reservationHour === hour && reservationDay === dayIndex
        })

        const guestCount = reservationsInSlot.reduce((sum, r) => sum + r.partySize, 0)
        const reservationCount = reservationsInSlot.length

        heatmapData.push({
          hour,
          day: dayIndex,
          reservations: reservationCount,
          guests: guestCount,
          intensity: reservationCount
        })
      })
    })

    return heatmapData
  }

  const heatmapData = getHeatmapData()
  const maxIntensity = Math.max(...heatmapData.map(d => d.intensity), 1)

  const getHeatmapColor = (intensity: number) => {
    const ratio = intensity / maxIntensity
    if (ratio === 0) return '#f8fafc'
    if (ratio <= 0.25) return '#dbeafe'
    if (ratio <= 0.5) return '#93c5fd'
    if (ratio <= 0.75) return '#3b82f6'
    return '#1d4ed8'
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">
            {viewMode === 'hourly' && `${data.hour} Uhr`}
            {viewMode === 'daily' && data.day}
            {viewMode === 'location' && data.location}
          </p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">Reservierungen: {data.reservations}</p>
            <p className="text-sm">Gäste: {data.guests}</p>
            {(viewMode === 'hourly' || viewMode === 'daily') && (
              <p className="text-sm">Auslastung: {data.occupancyRate.toFixed(1)}%</p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt-Auslastung</p>
                <p className="text-xl font-bold">{tableUtilization.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spitzenkapazität</p>
                <p className="text-xl font-bold">{peakCapacity}</p>
                <p className="text-xs text-muted-foreground">Gäste gleichzeitig</p>
              </div>
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stoßzeit</p>
                <p className="text-xl font-bold">
                  {peakHours[0]?.hour || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {peakHours[0]?.occupancyRate.toFixed(1)}% Auslastung
                </p>
              </div>
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Tische</p>
                <p className="text-xl font-bold">{totalTables}</p>
              </div>
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Stündliche Auslastung</SelectItem>
              <SelectItem value="daily">Tägliche Auslastung</SelectItem>
              <SelectItem value="location">Nach Standort</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {reservations.length} Reservierungen
          </Badge>
          <Badge variant="outline">
            {reservations.reduce((sum, r) => sum + r.partySize, 0)} Gäste
          </Badge>
        </div>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {viewMode === 'hourly' && 'Auslastung nach Tageszeit'}
            {viewMode === 'daily' && 'Auslastung nach Wochentag'}
            {viewMode === 'location' && 'Auslastung nach Standort'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={
              viewMode === 'hourly' ? hourlyData :
              viewMode === 'daily' ? dailyData : locationData
            }>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey={
                  viewMode === 'hourly' ? 'hour' :
                  viewMode === 'daily' ? 'day' : 'location'
                }
                stroke="#64748b"
                fontSize={12}
                angle={viewMode === 'location' ? -45 : 0}
                textAnchor={viewMode === 'location' ? 'end' : 'middle'}
                height={viewMode === 'location' ? 80 : 60}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => 
                  viewMode === 'location' ? `${value}` : `${value}%`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={viewMode === 'location' ? 'reservations' : 'occupancyRate'}
                radius={[4, 4, 0, 0]}
                name={viewMode === 'location' ? 'Reservierungen' : 'Auslastung'}
              >
                {(viewMode === 'location' ? locationData : 
                  viewMode === 'hourly' ? hourlyData : dailyData).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      viewMode === 'location' 
                        ? (entry as any).color 
                        : (entry as any).occupancyRate > 75 
                          ? '#ef4444' 
                          : (entry as any).occupancyRate > 50 
                            ? '#f59e0b' 
                            : '#10b981'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Heatmap Grid (for detailed hour x day view) */}
      {viewMode === 'hourly' && (
        <Card>
          <CardHeader>
            <CardTitle>Auslastungs-Heatmap (Stunde × Wochentag)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Header with days */}
                <div className="grid grid-cols-8 gap-1 mb-2">
                  <div className="h-8"></div>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <div key={index} className="h-8 flex items-center justify-center text-xs font-medium">
                      {day.slice(0, 2)}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap rows */}
                {HOURS.filter(h => h >= 6 && h <= 23).map(hour => (
                  <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
                    <div className="h-8 flex items-center justify-center text-xs font-medium">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {DAYS_OF_WEEK.map((_, dayIndex) => {
                      const cellData = heatmapData.find(d => d.hour === hour && d.day === dayIndex)
                      return (
                        <div
                          key={`${hour}-${dayIndex}`}
                          className="h-8 rounded border cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                          style={{ 
                            backgroundColor: getHeatmapColor(cellData?.intensity || 0)
                          }}
                          title={`${hour}:00 Uhr, ${DAYS_OF_WEEK[dayIndex]}: ${cellData?.reservations || 0} Reservierungen, ${cellData?.guests || 0} Gäste`}
                        >
                          {cellData && cellData.reservations > 0 && (
                            <div className="h-full flex items-center justify-center text-xs font-medium text-white">
                              {cellData.reservations}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
                
                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
                  <span className="text-xs text-muted-foreground">Wenig</span>
                  <div className="flex gap-1">
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getHeatmapColor(ratio * maxIntensity) }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Viel</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Peak Hours Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Stoßzeiten-Analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {peakHours.map((peak, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">#{index + 1}</Badge>
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold">{peak.hour}</p>
                  <p className="text-sm text-muted-foreground">
                    {peak.occupancyRate.toFixed(1)}% Auslastung
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {peak.reservations} Reservierungen, {peak.guests} Gäste
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}