import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  Star,
  UserPlus,
  Mail,
  TrendingUp,
  TrendingDown,
  Shield
} from 'lucide-react'

interface CustomerStatsProps {
  stats: {
    total: number
    vip: number
    newThisMonth: number
    emailConsent: number
    marketingConsent: number
    emailConsentRate: number
    marketingConsentRate: number
  }
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
  trend?: { value: number; label: string; positive?: boolean }
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
            trend.positive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.positive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function CustomerStats({ stats }: CustomerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <StatCard
        title="Gesamt Kunden"
        value={stats.total}
        icon={Users}
        color="default"
      />
      
      <StatCard
        title="VIP Kunden"
        value={stats.vip}
        icon={Star}
        color={stats.vip > 0 ? "yellow" : "default"}
      />
      
      <StatCard
        title="Neu diesen Monat"
        value={stats.newThisMonth}
        icon={UserPlus}
        color={stats.newThisMonth > 0 ? "green" : "default"}
      />
      
      <StatCard
        title="E-Mail Zustimmung"
        value={`${stats.emailConsentRate}%`}
        icon={Mail}
        color={stats.emailConsentRate > 70 ? "green" : stats.emailConsentRate > 40 ? "yellow" : "red"}
      />
      
      <StatCard
        title="Marketing Zustimmung"
        value={`${stats.marketingConsentRate}%`}
        icon={TrendingUp}
        color={stats.marketingConsentRate > 50 ? "green" : stats.marketingConsentRate > 25 ? "yellow" : "red"}
      />
      
      <StatCard
        title="GDPR Compliance"
        value={`${Math.round((stats.emailConsent / stats.total) * 100)}%`}
        icon={Shield}
        color="blue"
      />
    </div>
  )
}
