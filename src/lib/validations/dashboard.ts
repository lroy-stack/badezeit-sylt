import { z } from 'zod'

export const dashboardMetricsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month']).default('today'),
  compareWithPrevious: z.boolean().default(true)
})

export const dashboardFilterSchema = z.object({
  dateRange: z.object({
    from: z.coerce.date(),
    to: z.coerce.date().optional()
  }).optional(),
  status: z.array(z.enum(['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])).optional(),
  tableLocation: z.array(z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA'])).optional(),
  partySize: z.object({
    min: z.number().int().min(1).optional(),
    max: z.number().int().max(20).optional()
  }).optional()
})

export const quickActionSchema = z.object({
  action: z.enum(['create_reservation', 'search_customer', 'view_tables', 'export_data']),
  data: z.record(z.string(), z.any()).optional()
})

export type DashboardMetricsQuery = z.infer<typeof dashboardMetricsQuerySchema>
export type DashboardFilter = z.infer<typeof dashboardFilterSchema>
export type QuickAction = z.infer<typeof quickActionSchema>
