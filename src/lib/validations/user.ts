import { z } from 'zod'

export const createUserSchema = z.object({
  clerkId: z.string().min(1, 'Clerk ID ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']).default('STAFF'),
  isActive: z.boolean().default(true),
})

export const updateUserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email().optional(),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']).optional(),
  isActive: z.boolean().optional(),
})

export const userRoleUpdateSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']),
  reason: z.string().min(1, 'Grund für Rollenänderung erforderlich').max(500),
})

export const userFilterSchema = z.object({
  search: z.string().max(100).optional(), // Search in name, email
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']).optional(),
  isActive: z.boolean().optional(),
  createdAfter: z.coerce.date().optional(),
  lastActiveAfter: z.coerce.date().optional(),
})

export const userInvitationSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']).default('STAFF'),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  customMessage: z.string().max(500).optional(),
})

export const userPermissionSchema = z.object({
  userId: z.string().cuid(),
  permissions: z.object({
    // Dashboard permissions
    canViewDashboard: z.boolean().default(true),
    canViewAnalytics: z.boolean().default(false),
    
    // Reservation permissions
    canViewReservations: z.boolean().default(true),
    canCreateReservations: z.boolean().default(true),
    canUpdateReservations: z.boolean().default(true),
    canCancelReservations: z.boolean().default(false),
    
    // Customer permissions
    canViewCustomers: z.boolean().default(true),
    canUpdateCustomers: z.boolean().default(false),
    canDeleteCustomers: z.boolean().default(false),
    canExportCustomerData: z.boolean().default(false),
    
    // Menu permissions
    canViewMenu: z.boolean().default(true),
    canUpdateMenu: z.boolean().default(false),
    canCreateMenuItems: z.boolean().default(false),
    canDeleteMenuItems: z.boolean().default(false),
    
    // Table permissions
    canViewTables: z.boolean().default(true),
    canUpdateTableLayout: z.boolean().default(false),
    canManageTables: z.boolean().default(false),
    
    // System permissions
    canManageUsers: z.boolean().default(false),
    canManageSettings: z.boolean().default(false),
    canViewLogs: z.boolean().default(false),
    canManageIntegrations: z.boolean().default(false),
  }),
})

export const userActivityLogSchema = z.object({
  userId: z.string().cuid(),
  action: z.string().min(1).max(100),
  resource: z.string().max(50),
  resourceId: z.string().max(50).optional(),
  details: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),
})

export const userSessionSchema = z.object({
  userId: z.string().cuid(),
  deviceInfo: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  duration: z.number().int().min(0).optional(),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8, 'Aktuelles Passwort erforderlich'),
  newPassword: z.string()
    .min(8, 'Passwort muss mindestens 8 Zeichen haben')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Passwort muss Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen enthalten'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  }
)

export const userPreferencesSchema = z.object({
  userId: z.string().cuid(),
  preferences: z.object({
    language: z.enum(['de', 'en']).default('de'),
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    timezone: z.string().default('Europe/Berlin'),
    dateFormat: z.enum(['DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD.MM.YYYY'),
    timeFormat: z.enum(['12h', '24h']).default('24h'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      reservationUpdates: z.boolean().default(true),
      systemAlerts: z.boolean().default(true),
      dailySummary: z.boolean().default(false),
    }).default({
      email: true,
      push: true,
      reservationUpdates: true,
      systemAlerts: true,
      dailySummary: false,
    }),
  }),
})

export const bulkUserUpdateSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1, 'Mindestens einen Benutzer auswählen'),
  updates: z.object({
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']).optional(),
    isActive: z.boolean().optional(),
  }),
  reason: z.string().min(1, 'Grund für Änderung erforderlich').max(500),
})

export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>
export type UserRoleUpdateData = z.infer<typeof userRoleUpdateSchema>
export type UserFilterData = z.infer<typeof userFilterSchema>
export type UserInvitationData = z.infer<typeof userInvitationSchema>
export type UserPermissionData = z.infer<typeof userPermissionSchema>
export type UserActivityLogData = z.infer<typeof userActivityLogSchema>
export type UserSessionData = z.infer<typeof userSessionSchema>
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>
export type UserPreferencesData = z.infer<typeof userPreferencesSchema>
export type BulkUserUpdateData = z.infer<typeof bulkUserUpdateSchema>