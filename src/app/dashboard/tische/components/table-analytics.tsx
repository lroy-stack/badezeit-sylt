'use client'

import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Users,
  MapPin,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react'

interface TableAnalyticsProps {
  tables: Array<{
    id: string
    number: number
    capacity: number
    location: string
    currentStatus: string
    reservations: any[]
    _count: { reservations: number }
  }>
}

type TimeRange = '24h' | '7d' | '30d' | '90d'
type MetricType = 'occupancy' | 'revenue' | 'efficiency' | 'trends'

// Chart configurations with shadcn/ui theming
const occupancyChartConfig = {
  occupied: {
    label: 'Besetzt',
    color: 'hsl(var(--chart-1))'
  },
  available: {
    label: 'Verfügbar',
    color: 'hsl(var(--chart-2))'
  },
  reserved: {
    label: 'Reserviert',
    color: 'hsl(var(--chart-3))'
  },
  maintenance: {
    label: 'Wartung',
    color: 'hsl(var(--chart-4))'
  }
} satisfies ChartConfig

const locationChartConfig = {
  TERRACE_SEA_VIEW: {
    label: 'Terrasse Meerblick',
    color: 'hsl(var(--chart-1))'
  },
  TERRACE_STANDARD: {
    label: 'Terrasse Standard',
    color: 'hsl(var(--chart-2))'
  },
  INDOOR_WINDOW: {
    label: 'Innen Fenster',
    color: 'hsl(var(--chart-3))'
  },
  INDOOR_STANDARD: {
    label: 'Innen Standard',
    color: 'hsl(var(--chart-4))'
  },
  BAR_AREA: {
    label: 'Barbereich',
    color: 'hsl(var(--chart-5))'
  }
} satisfies ChartConfig

const utilizationChartConfig = {
  utilization: {
    label: 'Auslastung %',
    color: 'hsl(var(--chart-1))'
  },
  capacity: {
    label: 'Kapazität',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig

export function TableAnalytics({ tables }: TableAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('occupancy')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Generate mock time-series data (in real implementation, this would come from API)
  const generateTimeSeriesData = useMemo(() => {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 2160
    const interval = timeRange === '24h' ? 1 : timeRange === '7d' ? 4 : timeRange === '30d' ? 12 : 24

    return Array.from({ length: Math.floor(hours / interval) }, (_, i) => {
      const now = new Date()
      const time = new Date(now.getTime() - (hours - i * interval) * 60 * 60 * 1000)
      
      // Simulate realistic occupancy patterns
      const hour = time.getHours()
      const isWeekend = time.getDay() === 0 || time.getDay() === 6
      
      let baseOccupancy = 0
      if (hour >= 12 && hour <= 14) baseOccupancy = 80 // Lunch rush
      else if (hour >= 18 && hour <= 21) baseOccupancy = 90 // Dinner rush
      else if (hour >= 7 && hour <= 11) baseOccupancy = 45 // Breakfast
      else if (hour >= 15 && hour <= 17) baseOccupancy = 30 // Afternoon
      else baseOccupancy = 15 // Off hours

      // Weekend adjustment
      if (isWeekend) baseOccupancy *= 1.2

      // Add some randomization
      const occupancy = Math.min(100, Math.max(0, baseOccupancy + (Math.random() - 0.5) * 30))
      
      return {
        time: timeRange === '24h' ? time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) :
              timeRange === '7d' ? time.toLocaleDateString('de-DE', { weekday: 'short', hour: '2-digit' }) :
              time.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        occupied: Math.round(occupancy),
        available: Math.round(100 - occupancy),
        reserved: Math.round(occupancy * 0.3),
        maintenance: Math.round(Math.random() * 5),
        utilization: occupancy,
        capacity: 100,
        revenue: Math.round(occupancy * 8.5 + Math.random() * 200),
        efficiency: Math.round(85 + Math.random() * 15)
      }
    })
  }, [timeRange])

  // Calculate current metrics
  const currentMetrics = useMemo(() => {
    const statusCounts = tables.reduce((acc, table) => {
      acc[table.currentStatus] = (acc[table.currentStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0)
    const occupiedTables = statusCounts['OCCUPIED'] || 0
    const occupancyRate = tables.length > 0 ? Math.round((occupiedTables / tables.length) * 100) : 0
    
    const locationStats = tables.reduce((acc, table) => {
      if (!acc[table.location]) {
        acc[table.location] = { count: 0, capacity: 0, reservations: 0 }
      }
      acc[table.location].count += 1
      acc[table.location].capacity += table.capacity
      acc[table.location].reservations += table._count.reservations
      return acc
    }, {} as Record<string, { count: number; capacity: number; reservations: number }>)

    return {
      totalTables: tables.length,
      totalCapacity,
      occupancyRate,
      statusCounts,
      locationStats,
      avgReservationsPerTable: tables.length > 0 ? 
        Math.round(tables.reduce((sum, t) => sum + t._count.reservations, 0) / tables.length * 10) / 10 : 0
    }
  }, [tables])

  // Generate location performance data
  const locationData = useMemo(() => {
    return Object.entries(currentMetrics.locationStats).map(([location, stats]) => ({
      location: locationChartConfig[location as keyof typeof locationChartConfig]?.label || location,
      count: stats.count,
      capacity: stats.capacity,
      reservations: stats.reservations,
      efficiency: Math.round((stats.reservations / stats.count) * 10) / 10,
      fill: locationChartConfig[location as keyof typeof locationChartConfig]?.color || 'hsl(var(--chart-1))'
    }))
  }, [currentMetrics.locationStats])

  // Generate status distribution data
  const statusData = useMemo(() => {
    return Object.entries(currentMetrics.statusCounts).map(([status, count]) => {
      const statusLabels: Record<string, string> = {
        'AVAILABLE': 'Verfügbar',
        'OCCUPIED': 'Besetzt',
        'RESERVED': 'Reserviert',
        'MAINTENANCE': 'Wartung',
        'OUT_OF_ORDER': 'Außer Betrieb'
      }
      
      const statusColors: Record<string, string> = {
        'AVAILABLE': 'hsl(var(--chart-2))',
        'OCCUPIED': 'hsl(var(--chart-1))',
        'RESERVED': 'hsl(var(--chart-3))',
        'MAINTENANCE': 'hsl(var(--chart-4))',
        'OUT_OF_ORDER': 'hsl(var(--chart-5))'
      }

      return {
        status: statusLabels[status] || status,
        count,
        percentage: Math.round((count / tables.length) * 100),
        fill: statusColors[status] || 'hsl(var(--muted))'
      }
    })
  }, [currentMetrics.statusCounts, tables.length])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Trigger re-render to simulate real-time data updates
      // In real implementation, this would refetch data
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Stunden</SelectItem>
              <SelectItem value="7d">7 Tage</SelectItem>
              <SelectItem value="30d">30 Tage</SelectItem>
              <SelectItem value="90d">90 Tage</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            Live
          </Button>
        </div>
        
        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Letztes Update: {new Date().toLocaleTimeString('de-DE')}
        </Badge>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktuelle Auslastung</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{currentMetrics.occupancyRate}%</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{currentMetrics.statusCounts.OCCUPIED || 0} von {currentMetrics.totalTables} besetzt</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtkapazität</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.totalCapacity}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{Math.round(currentMetrics.totalCapacity / currentMetrics.totalTables)} ⌀ pro Tisch</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservierungsrate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.avgReservationsPerTable}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>⌀ Reservierungen/Tisch</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effizienz</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span>+2.3% vs. Vorwoche</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricType)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="occupancy">Auslastung</TabsTrigger>
          <TabsTrigger value="revenue">Umsatz</TabsTrigger>
          <TabsTrigger value="efficiency">Effizienz</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="occupancy" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Occupancy Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Auslastungstrends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={occupancyChartConfig} className="h-[300px] w-full">
                  <AreaChart data={generateTimeSeriesData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 5)}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend />
                    <Area
                      type="monotone"
                      dataKey="occupied"
                      fill="var(--color-occupied)"
                      stroke="var(--color-occupied)"
                      stackId="1"
                    />
                    <Area
                      type="monotone"
                      dataKey="available"
                      fill="var(--color-available)"
                      stroke="var(--color-available)"
                      stackId="1"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Status-Verteilung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={occupancyChartConfig} className="h-[300px] w-full">
                  <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="var(--color-occupied)"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Umsatzanalyse</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={utilizationChartConfig} className="h-[400px] w-full">
                <LineChart data={generateTimeSeriesData} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-utilization)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-utilization)" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Standort-Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={locationChartConfig} className="h-[400px] w-full">
                <BarChart data={locationData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis 
                    dataKey="location"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend />
                  <Bar dataKey="reservations" fill="var(--color-TERRACE_SEA_VIEW)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Kapazitätsauslastung</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={utilizationChartConfig} className="h-[300px] w-full">
                  <AreaChart data={generateTimeSeriesData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="utilization"
                      fill="var(--color-utilization)"
                      stroke="var(--color-utilization)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance-Metriken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Durchschnittliche Verweilzeit</span>
                    </div>
                    <Badge variant="secondary">1.8h</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Peak-Zeit Effizienz</span>
                    </div>
                    <Badge variant="secondary">92%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Zielerreichung</span>
                    </div>
                    <Badge variant="secondary">96%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Optimierungspotential</span>
                    </div>
                    <Badge variant="secondary">8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}