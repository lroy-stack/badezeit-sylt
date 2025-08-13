import { z } from 'zod'

export const createTableSchema = z.object({
  number: z.number().int().min(1, 'Tischnummer muss mindestens 1 sein').max(999, 'Tischnummer zu hoch'),
  capacity: z.number().int().min(1, 'Kapazität muss mindestens 1 Person sein').max(20, 'Kapazität zu hoch'),
  location: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']),
  isActive: z.boolean().default(true),
  description: z.string().max(200).optional(),
  
  // Visual layout properties for table management interface
  xPosition: z.number().min(0).max(1000).optional(),
  yPosition: z.number().min(0).max(1000).optional(),
  shape: z.enum(['RECTANGLE', 'ROUND', 'SQUARE']).default('RECTANGLE'),
})

export const updateTableSchema = z.object({
  id: z.string().cuid(),
  number: z.number().int().min(1).max(999).optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  location: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(200).optional(),
  
  // Visual layout properties
  xPosition: z.number().min(0).max(1000).optional(),
  yPosition: z.number().min(0).max(1000).optional(),
  shape: z.enum(['RECTANGLE', 'ROUND', 'SQUARE']).optional(),
})

export const tableLayoutUpdateSchema = z.object({
  tables: z.array(z.object({
    id: z.string().cuid(),
    xPosition: z.number().min(0).max(1000),
    yPosition: z.number().min(0).max(1000),
    shape: z.enum(['RECTANGLE', 'ROUND', 'SQUARE']).optional(),
  })).min(1, 'Mindestens ein Tisch erforderlich'),
})

export const tableCombinationSchema = z.object({
  tableIds: z.array(z.string().cuid()).min(2, 'Mindestens 2 Tische für Kombination erforderlich').max(4, 'Maximal 4 Tische können kombiniert werden'),
  occasionId: z.string().cuid(), // Reference to reservation
  notes: z.string().max(500).optional(),
})

export const tableFilterSchema = z.object({
  location: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  isActive: z.boolean().optional(),
  minCapacity: z.number().int().min(1).optional(),
  maxCapacity: z.number().int().min(1).optional(),
  shape: z.enum(['RECTANGLE', 'ROUND', 'SQUARE']).optional(),
  isAvailable: z.boolean().optional(), // For specific date/time
  dateTime: z.coerce.date().optional(), // For availability check
})

export const qrCodeGenerationSchema = z.object({
  tableIds: z.array(z.string().cuid()).min(1, 'Mindestens ein Tisch auswählen'),
  includeMenuLink: z.boolean().default(true),
  includeWifiInfo: z.boolean().default(false),
  customMessage: z.string().max(200).optional(),
})

export const tableMaintenanceSchema = z.object({
  tableId: z.string().cuid(),
  maintenanceType: z.enum(['CLEANING', 'REPAIR', 'INSPECTION', 'OTHER']),
  description: z.string().min(1, 'Wartungsbeschreibung erforderlich').max(1000),
  startTime: z.coerce.date(),
  estimatedDuration: z.number().int().min(15).max(480), // 15 minutes to 8 hours
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedTo: z.string().max(100).optional(),
})

export const tableStatusUpdateSchema = z.object({
  tableId: z.string().cuid(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'OUT_OF_ORDER']),
  notes: z.string().max(500).optional(),
  estimatedFreeTime: z.coerce.date().optional(), // When table will be available again
})

export const bulkTableUpdateSchema = z.object({
  tableIds: z.array(z.string().cuid()).min(1, 'Mindestens ein Tisch auswählen'),
  updates: z.object({
    isActive: z.boolean().optional(),
    location: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
    capacity: z.number().int().min(1).max(20).optional(),
  }),
})

// Table occupancy analytics schema
export const tableAnalyticsSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  tableIds: z.array(z.string().cuid()).optional(), // If empty, analyze all tables
  groupByLocation: z.boolean().default(false),
  includeRevenue: z.boolean().default(false),
})

// Table availability check schema
export const tableAvailabilitySchema = z.object({
  dateTime: z.coerce.date(),
  duration: z.number().int().min(60).max(300).default(120), // minutes
  partySize: z.number().int().min(1).max(20),
  preferredLocation: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  excludeTableIds: z.array(z.string().cuid()).default([]), // Tables to exclude from availability
})

export type CreateTableData = z.infer<typeof createTableSchema>
export type UpdateTableData = z.infer<typeof updateTableSchema>
export type TableLayoutUpdateData = z.infer<typeof tableLayoutUpdateSchema>
export type TableCombinationData = z.infer<typeof tableCombinationSchema>
export type TableFilterData = z.infer<typeof tableFilterSchema>
export type QRCodeGenerationData = z.infer<typeof qrCodeGenerationSchema>
export type TableMaintenanceData = z.infer<typeof tableMaintenanceSchema>
export type TableStatusUpdateData = z.infer<typeof tableStatusUpdateSchema>
export type BulkTableUpdateData = z.infer<typeof bulkTableUpdateSchema>
export type TableAnalyticsData = z.infer<typeof tableAnalyticsSchema>
export type TableAvailabilityData = z.infer<typeof tableAvailabilitySchema>