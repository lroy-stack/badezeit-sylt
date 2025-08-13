import { z } from 'zod'

// Analytics Date Range Schema
export const analyticsDateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: "Startdatum muss vor dem Enddatum liegen",
    path: ["endDate"]
  }
)

// Analytics Filter Schema
export const analyticsFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  includeComparison: z.boolean().default(false),
  customerId: z.string().cuid().optional(),
  tableId: z.string().cuid().optional(),
  reservationSource: z.enum(['WEBSITE', 'PHONE', 'WALK_IN', 'SOCIAL_MEDIA']).optional(),
  minPartySize: z.number().int().min(1).optional(),
  maxPartySize: z.number().int().min(1).optional()
})

// Revenue Analytics Schema
export const revenueAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  includeComparison: z.boolean().default(false),
  includeForecasting: z.boolean().default(false),
  currency: z.enum(['EUR', 'USD']).default('EUR')
})

// Occupancy Analytics Schema
export const occupancyAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  timeRange: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)')
  }).optional(),
  includeHeatmap: z.boolean().default(true),
  includePeakHours: z.boolean().default(true)
})

// Customer Analytics Schema
export const customerAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  segmentBy: z.enum(['totalSpent', 'visitFrequency', 'averagePartySize', 'preferredTime', 'location']).default('totalSpent'),
  includeVipOnly: z.boolean().default(false),
  includeNewCustomers: z.boolean().default(true),
  includeReturningCustomers: z.boolean().default(true),
  minVisits: z.number().int().min(1).optional(),
  minSpending: z.number().min(0).optional()
})

// Menu Performance Analytics Schema
export const menuAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  categoryId: z.string().cuid().optional(),
  includeAllergenAnalysis: z.boolean().default(false),
  includeDietaryPreferences: z.boolean().default(false),
  sortBy: z.enum(['popularity', 'revenue', 'profitMargin', 'preparation_time']).default('popularity'),
  topN: z.number().int().min(5).max(50).default(10)
})

// Export Report Schema
export const exportReportSchema = z.object({
  reportType: z.enum(['revenue', 'occupancy', 'customers', 'menu', 'comprehensive']),
  format: z.enum(['pdf', 'excel', 'csv']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeCharts: z.boolean().default(true),
  includeRawData: z.boolean().default(false),
  emailTo: z.string().email().optional(),
  language: z.enum(['de', 'en']).default('de'),
  customTitle: z.string().max(100).optional()
})

// Dashboard Metrics Schema
export const dashboardMetricsSchema = z.object({
  period: z.enum(['today', 'yesterday', 'week', 'month', 'quarter', 'year', 'custom']).default('today'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  includeComparison: z.boolean().default(true),
  includeForecasting: z.boolean().default(false),
  refreshInterval: z.number().int().min(30).max(3600).default(300) // Sekunden
})

// Alerts and Notifications Schema
export const analyticsAlertSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Alert-Name ist erforderlich').max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  alertType: z.enum(['revenue_drop', 'occupancy_low', 'cancellation_spike', 'no_show_high', 'custom']),
  
  // Trigger Conditions
  metric: z.enum(['revenue', 'occupancy', 'reservations', 'cancellations', 'no_shows', 'average_party_size']),
  operator: z.enum(['greater_than', 'less_than', 'equals', 'percentage_change']),
  threshold: z.number(),
  timeframe: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  
  // Notification Settings
  notifyEmail: z.boolean().default(true),
  notifySMS: z.boolean().default(false),
  notifyPush: z.boolean().default(true),
  recipients: z.array(z.string().email()).min(1, 'Mindestens ein Empfänger erforderlich'),
  
  // Schedule
  schedule: z.object({
    enabled: z.boolean().default(true),
    frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).default('immediate'),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
    daysOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional()
  }).optional()
})

// Business Intelligence Query Schema
export const biQuerySchema = z.object({
  query: z.string().min(10, 'Query muss mindestens 10 Zeichen lang sein').max(1000),
  dateRange: analyticsDateRangeSchema.optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  groupBy: z.array(z.string()).max(5).optional(),
  aggregations: z.array(z.enum(['count', 'sum', 'avg', 'min', 'max', 'median'])).optional(),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
  orderBy: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']).default('desc')
  })).optional()
})

// Type Exports
export type AnalyticsDateRange = z.infer<typeof analyticsDateRangeSchema>
export type AnalyticsFilter = z.infer<typeof analyticsFilterSchema>
export type RevenueAnalyticsParams = z.infer<typeof revenueAnalyticsSchema>
export type OccupancyAnalyticsParams = z.infer<typeof occupancyAnalyticsSchema>
export type CustomerAnalyticsParams = z.infer<typeof customerAnalyticsSchema>
export type MenuAnalyticsParams = z.infer<typeof menuAnalyticsSchema>
export type ExportReportParams = z.infer<typeof exportReportSchema>
export type DashboardMetricsParams = z.infer<typeof dashboardMetricsSchema>
export type AnalyticsAlert = z.infer<typeof analyticsAlertSchema>
export type BIQuery = z.infer<typeof biQuerySchema>