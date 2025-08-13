'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { TrendingUp, TrendingDown, Euro, Calendar } from 'lucide-react'

interface DailyData {
  date: string
  revenue: number
  reservations: number
  guests: number
}

interface RevenueChartsProps {
  dailyData: DailyData[]
  totalRevenue: number
  averagePerReservation: number
  revPASH: number
  period: string
}

export function RevenueCharts({ 
  dailyData, 
  totalRevenue, 
  averagePerReservation, 
  revPASH,
  period 
}: RevenueChartsProps) {
  // Format data for charts
  const formattedData = dailyData.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'dd.MM', { locale: de }),
    fullDate: item.date,
    averagePerGuest: item.guests > 0 ? item.revenue / item.guests : 0
  }))

  // Calculate trends
  const revenueData = formattedData.map(d => d.revenue)
  const trend = revenueData.length > 1 
    ? ((revenueData[revenueData.length - 1] - revenueData[0]) / revenueData[0]) * 100 
    : 0

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{format(parseISO(data.fullDate), 'dd. MMMM yyyy', { locale: de })}</p>
          <div className="space-y-1 mt-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">
                  {entry.name}: {
                    entry.dataKey === 'revenue' 
                      ? `${entry.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`
                      : entry.value
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø pro Reservierung</p>
                <p className="text-xl font-bold">
                  {averagePerReservation.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <Euro className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RevPASH</p>
                <p className="text-xl font-bold">{revPASH.toFixed(2)}€</p>
                <p className="text-xs text-muted-foreground">pro verfügbarem Platz/Std</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">
                    {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                  </p>
                  {trend >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              <Badge variant={trend >= 0 ? 'default' : 'destructive'}>
                {trend >= 0 ? 'Aufwärtstrend' : 'Abwärtstrend'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Umsatzentwicklung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)" 
                name="Umsatz"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Combined Revenue and Reservations Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Umsatz vs. Reservierungen</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="revenue"
                  orientation="left"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `${value}€`}
                />
                <YAxis 
                  yAxisId="reservations"
                  orientation="right"
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  yAxisId="revenue"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  name="Umsatz (€)"
                />
                <Line 
                  yAxisId="reservations"
                  type="monotone" 
                  dataKey="reservations" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  name="Reservierungen"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tägliche Gästeanzahl</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="guests" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                  name="Gäste"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue per Guest Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Umsatz pro Gast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(0)}€`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
                formatter={(value: number) => [`${value.toFixed(2)}€`, 'Ø pro Gast']}
                labelFormatter={(label) => `Datum: ${label}`}
              />
              <Bar 
                dataKey="averagePerGuest" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
                name="Ø pro Gast"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Zusammenfassung {period === 'today' ? 'Heute' : 'Zeitraum'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {totalRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-sm text-blue-700">Gesamtumsatz</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {formattedData.reduce((sum, d) => sum + d.reservations, 0)}
              </p>
              <p className="text-sm text-green-700">Reservierungen</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {formattedData.reduce((sum, d) => sum + d.guests, 0)}
              </p>
              <p className="text-sm text-purple-700">Gäste gesamt</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {(formattedData.reduce((sum, d) => sum + d.averagePerGuest, 0) / formattedData.length).toFixed(0)}€
              </p>
              <p className="text-sm text-orange-700">Ø pro Gast</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}