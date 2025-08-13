'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Users,
  Star,
  Target,
  Award,
  BarChart,
  PieChart
} from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Customer {
  id: string
  firstName: string
  lastName: string
  isVip: boolean
  totalVisits: number
  totalSpent: number | { toNumber: () => number }
  averagePartySize: number
  lastVisit: Date | null
  createdAt: Date
}

interface Statistics {
  totalReservations: number
  completedReservations: number
  cancelledReservations: number
  noShows: number
  recentReservations: number
  upcomingReservations: number
  averagePartySize: number
  favoriteTimeSlots: [string, number][]
  completionRate: number
  cancellationRate: number
}

interface CustomerStatsProps {
  customer: Customer
  statistics: Statistics
}

export function CustomerStats({ customer, statistics }: CustomerStatsProps) {
  const totalSpent = typeof customer.totalSpent === 'number' 
    ? customer.totalSpent 
    : customer.totalSpent.toNumber()

  const loyaltyScore = Math.min(100, Math.round(
    (statistics.completedReservations * 15) + 
    (statistics.completionRate * 0.5) + 
    (totalSpent / 50) + 
    (customer.isVip ? 20 : 0)
  ))

  const averageSpendPerVisit = statistics.completedReservations > 0 
    ? totalSpent / statistics.completedReservations 
    : 0

  const customerTier = loyaltyScore >= 80 ? 'Premium' :
                      loyaltyScore >= 60 ? 'Gold' :
                      loyaltyScore >= 40 ? 'Silver' : 'Bronze'

  const tierColor = loyaltyScore >= 80 ? 'bg-purple-100 text-purple-800' :
                   loyaltyScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                   loyaltyScore >= 40 ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'

  const monthsSinceJoined = Math.max(1, Math.floor(
    (new Date().getTime() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
  ))

  const visitFrequency = statistics.completedReservations / monthsSinceJoined

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Gesamtumsatz</p>
                <p className="text-2xl font-bold">€{totalSpent.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Ø €{averageSpendPerVisit.toFixed(2)} pro Besuch
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Besuchsfrequenz</p>
                <p className="text-2xl font-bold">{visitFrequency.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">
                  Besuche pro Monat
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Zuverlässigkeit</p>
                <p className="text-2xl font-bold">{statistics.completionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  Erscheinungsrate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Loyalität</p>
                <p className="text-2xl font-bold">{loyaltyScore}</p>
                <p className="text-xs text-muted-foreground">
                  von 100 Punkten
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Tier & Loyalty */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Kundenstatus & Loyalität
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Aktuelle Stufe</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={tierColor}>
                  {customerTier}
                </Badge>
                {customer.isVip && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    VIP
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Loyalitätspunkte</p>
              <p className="text-3xl font-bold">{loyaltyScore}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fortschritt zur nächsten Stufe</span>
              <span>{loyaltyScore}%</span>
            </div>
            <Progress value={loyaltyScore} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium">Kunde seit</p>
              <p className="text-2xl font-bold">{monthsSinceJoined}</p>
              <p className="text-xs text-muted-foreground">
                {monthsSinceJoined === 1 ? 'Monat' : 'Monate'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Letzter Besuch</p>
              <p className="text-sm">
                {customer.lastVisit 
                  ? format(customer.lastVisit, 'dd.MM.yyyy', { locale: de })
                  : 'Noch kein Besuch'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservation Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Reservierungsmuster
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="font-medium mb-3">Reservierungsverteilung</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Abgeschlossen</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(statistics.completedReservations / statistics.totalReservations) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{statistics.completedReservations}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Storniert</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${(statistics.cancelledReservations / statistics.totalReservations) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{statistics.cancelledReservations}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">No-Show</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${(statistics.noShows / statistics.totalReservations) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{statistics.noShows}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-3">Gruppengröße</p>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold">{statistics.averagePartySize.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Durchschnittliche Personenanzahl</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Kleinste Gruppe: Wird berechnet...</p>
                  <p>Größte Gruppe: Wird berechnet...</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-3">Bevorzugte Zeiten</p>
              <div className="space-y-1">
                {statistics.favoriteTimeSlots.length > 0 ? (
                  statistics.favoriteTimeSlots.map(([time, count], index) => (
                    <div key={time} className="flex justify-between items-center text-sm">
                      <span>#{index + 1} - {time} Uhr</span>
                      <Badge variant="outline" className="text-xs">
                        {count}x
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Noch keine bevorzugten Zeiten erkennbar
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aktuelle Aktivität
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-medium">Letzte 30 Tage</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-2xl font-bold">{statistics.recentReservations}</p>
                  <p className="text-sm text-muted-foreground">neue Reservierungen</p>
                  {statistics.recentReservations > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              
              <div>
                <p className="font-medium">Kommende Reservierungen</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-2xl font-bold">{statistics.upcomingReservations}</p>
                  <p className="text-sm text-muted-foreground">bestätigt</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium">Engagement-Level</p>
                <div className="mt-2">
                  {visitFrequency >= 2 ? (
                    <Badge className="bg-green-100 text-green-800">Sehr aktiv</Badge>
                  ) : visitFrequency >= 1 ? (
                    <Badge className="bg-blue-100 text-blue-800">Regelmäßig</Badge>
                  ) : visitFrequency >= 0.5 ? (
                    <Badge className="bg-orange-100 text-orange-800">Gelegentlich</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Selten</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <p className="font-medium">Empfehlung</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {customer.isVip 
                    ? 'VIP-Behandlung beibehalten'
                    : loyaltyScore >= 70 
                      ? 'Für VIP-Status vorschlagen'
                      : statistics.completionRate >= 90
                        ? 'Zuverlässiger Kunde'
                        : 'Aufmerksamkeit schenken'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}