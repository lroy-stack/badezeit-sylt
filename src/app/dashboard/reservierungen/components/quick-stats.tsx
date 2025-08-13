import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface Reservation {
  id: string
  dateTime: string | Date
  partySize: number
  status: string
  customer: {
    firstName: string
    lastName: string
    isVip: boolean
  }
}

interface QuickStatsProps {
  reservations: Reservation[]
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "default" 
}: {
  title: string
  value: string | number
  icon: any
  trend?: { value: number; label: string }
  color?: "default" | "green" | "yellow" | "red" | "blue"
}) {
  const colorClasses = {
    default: "border-gray-200",
    green: "border-green-200 bg-green-50",
    yellow: "border-yellow-200 bg-yellow-50",
    red: "border-red-200 bg-red-50",
    blue: "border-blue-200 bg-blue-50"
  }
  
  return (
    <Card className={colorClasses[color]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            {trend.value > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : trend.value < 0 ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : null}
            {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function QuickStats({ reservations }: QuickStatsProps) {
  // Calculate current stats
  const totalReservations = reservations.length
  const pendingReservations = reservations.filter(r => r.status === 'PENDING').length
  const confirmedReservations = reservations.filter(r => 
    ['CONFIRMED', 'SEATED'].includes(r.status)
  ).length
  const cancelledReservations = reservations.filter(r => 
    ['CANCELLED', 'NO_SHOW'].includes(r.status)
  ).length
  const completedReservations = reservations.filter(r => r.status === 'COMPLETED').length
  
  // Calculate party size stats
  const totalGuests = reservations.reduce((sum, r) => sum + r.partySize, 0)
  const averagePartySize = totalReservations > 0 
    ? Math.round((totalGuests / totalReservations) * 10) / 10 
    : 0
    
  // VIP customers
  const vipReservations = reservations.filter(r => r.customer.isVip).length
  
  // Today's reservations
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const todayReservations = reservations.filter(r => {
    const reservationDate = new Date(r.dateTime)
    return reservationDate >= today && reservationDate < tomorrow
  }).length
  
  // Calculate confirmation rate
  const confirmationRate = totalReservations > 0 
    ? Math.round((confirmedReservations / totalReservations) * 100)
    : 0
    
  // Calculate cancellation rate
  const cancellationRate = totalReservations > 0
    ? Math.round((cancelledReservations / totalReservations) * 100)
    : 0
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <StatCard
        title="Gesamt Reservierungen"
        value={totalReservations}
        icon={Calendar}
        color="default"
      />
      
      <StatCard
        title="Wartend"
        value={pendingReservations}
        icon={Clock}
        color={pendingReservations > 0 ? "yellow" : "default"}
      />
      
      <StatCard
        title="Bestätigt"
        value={confirmedReservations}
        icon={CheckCircle}
        color={confirmedReservations > 0 ? "green" : "default"}
      />
      
      <StatCard
        title="Storniert/No-Show"
        value={cancelledReservations}
        icon={XCircle}
        color={cancelledReservations > 0 ? "red" : "default"}
      />
      
      <StatCard
        title="Heute"
        value={todayReservations}
        icon={Calendar}
        color={todayReservations > 0 ? "blue" : "default"}
      />
      
      <StatCard
        title="VIP Gäste"
        value={vipReservations}
        icon={Users}
        color={vipReservations > 0 ? "blue" : "default"}
      />
    </div>
  )
}
