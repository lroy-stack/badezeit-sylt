import { z } from 'zod'

// System Setting Schema
export const systemSettingSchema = z.object({
  id: z.string().cuid().optional(),
  key: z.string().min(1, 'Setting-Key ist erforderlich').max(100),
  value: z.string().max(10000), // Große Werte für JSON-Strings etc.
  description: z.string().max(500).optional()
})

// General Settings Schema
export const generalSettingsSchema = z.object({
  restaurantName: z.string().min(1, 'Restaurant-Name ist erforderlich').max(100),
  restaurantDescription: z.string().max(1000).optional(),
  defaultLanguage: z.enum(['de', 'en']).default('de'),
  timezone: z.string().min(1, 'Zeitzone ist erforderlich'),
  currency: z.enum(['EUR', 'USD', 'GBP', 'CHF']).default('EUR'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Ungültiger Hex-Farbcode').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Ungültiger Hex-Farbcode').optional(),
  dateFormat: z.enum(['DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD.MM.YYYY'),
  timeFormat: z.enum(['24h', '12h']).default('24h')
})

// Business Hours Schema
export const businessHoursSchema = z.object({
  monday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    closed: z.boolean().default(false)
  }),
  tuesday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    closed: z.boolean().default(false)
  }),
  wednesday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    closed: z.boolean().default(false)
  }),
  thursday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    closed: z.boolean().default(false)
  }),
  friday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    closed: z.boolean().default(false)
  }),
  saturday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    closed: z.boolean().default(false)
  }),
  sunday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)'),
    closed: z.boolean().default(false)
  })
})

// Business Information Schema
export const businessInformationSchema = z.object({
  address: z.string().min(1, 'Adresse ist erforderlich').max(200),
  city: z.string().min(1, 'Stadt ist erforderlich').max(100),
  postalCode: z.string().min(1, 'PLZ ist erforderlich').max(20),
  country: z.string().min(1, 'Land ist erforderlich').max(100),
  phone: z.string().min(1, 'Telefon ist erforderlich').max(50),
  fax: z.string().max(50).optional(),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  website: z.string().url('Ungültige Website-URL').optional().or(z.literal('')),
  
  // Social Media
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  
  // Legal Information
  taxNumber: z.string().max(50).optional(),
  vatNumber: z.string().max(50).optional(),
  commercialRegister: z.string().max(100).optional(),
  managingDirector: z.string().max(100).optional(),
  
  openingHours: businessHoursSchema
})

// Reservation Settings Schema
export const reservationSettingsSchema = z.object({
  maxReservationDays: z.number().int().min(1).max(365).default(60),
  minReservationHours: z.number().int().min(0).max(72).default(2),
  defaultReservationDuration: z.number().int().min(30).max(480).default(120), // Minuten
  maxPartySize: z.number().int().min(1).max(50).default(12),
  minPartySize: z.number().int().min(1).max(10).default(1),
  
  // Availability
  allowSameDayReservations: z.boolean().default(true),
  allowOnlineReservations: z.boolean().default(true),
  requireConfirmation: z.boolean().default(true),
  enableWaitlist: z.boolean().default(true),
  maxWaitlistSize: z.number().int().min(0).max(100).default(20),
  
  // Cancellation Policy
  cancellationHours: z.number().int().min(0).max(72).default(24),
  allowCustomerCancellation: z.boolean().default(true),
  chargeNoShowFee: z.boolean().default(false),
  noShowFeeAmount: z.number().min(0).max(1000).default(0),
  
  // Notifications
  sendConfirmationEmail: z.boolean().default(true),
  sendReminderEmail: z.boolean().default(true),
  reminderHours: z.number().int().min(1).max(72).default(24),
  sendFollowUpEmail: z.boolean().default(false),
  followUpHours: z.number().int().min(1).max(168).default(24)
})

// Email Settings Schema
export const emailSettingsSchema = z.object({
  // SMTP Configuration
  smtpHost: z.string().min(1, 'SMTP-Host ist erforderlich'),
  smtpPort: z.number().int().min(1).max(65535).default(587),
  smtpUser: z.string().min(1, 'SMTP-Benutzer ist erforderlich'),
  smtpPassword: z.string().min(1, 'SMTP-Passwort ist erforderlich'),
  smtpSecure: z.boolean().default(false),
  smtpTLS: z.boolean().default(true),
  
  // Email Addresses
  fromEmail: z.string().email('Ungültige Absender-E-Mail'),
  fromName: z.string().min(1, 'Absender-Name ist erforderlich').max(100),
  replyToEmail: z.string().email('Ungültige Antwort-E-Mail').optional(),
  supportEmail: z.string().email('Ungültige Support-E-Mail').optional(),
  
  // Email Templates
  enableHtmlEmails: z.boolean().default(true),
  emailSignature: z.string().max(1000).optional(),
  includeUnsubscribeLink: z.boolean().default(true),
  
  // Rate Limiting
  maxEmailsPerHour: z.number().int().min(1).max(10000).default(1000),
  maxEmailsPerDay: z.number().int().min(1).max(100000).default(10000)
})

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  // Email Notifications
  emailNotifications: z.boolean().default(true),
  emailNewReservation: z.boolean().default(true),
  emailCancellation: z.boolean().default(true),
  emailNoShow: z.boolean().default(true),
  emailWaitlistUpdate: z.boolean().default(true),
  
  // SMS Notifications
  smsNotifications: z.boolean().default(false),
  smsProvider: z.enum(['twilio', 'nexmo', 'custom']).optional(),
  smsApiKey: z.string().max(200).optional(),
  smsApiSecret: z.string().max(200).optional(),
  smsFromNumber: z.string().max(20).optional(),
  
  // Push Notifications
  pushNotifications: z.boolean().default(true),
  webPushEnabled: z.boolean().default(true),
  mobilePushEnabled: z.boolean().default(false),
  
  // Notification Recipients
  notificationEmails: z.array(z.string().email()).max(10).default([]),
  emergencyContacts: z.array(z.string()).max(5).default([]),
  
  // Business Rules
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('22:00'),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('08:00'),
  weekendNotifications: z.boolean().default(true)
})

// Security Settings Schema
export const securitySettingsSchema = z.object({
  // Session Management
  sessionTimeout: z.number().int().min(5).max(1440).default(30), // Minuten
  maxConcurrentSessions: z.number().int().min(1).max(10).default(3),
  forceLogoutOnPasswordChange: z.boolean().default(true),
  
  // Password Policy
  passwordMinLength: z.number().int().min(6).max(128).default(8),
  passwordRequireUppercase: z.boolean().default(true),
  passwordRequireLowercase: z.boolean().default(true),
  passwordRequireNumbers: z.boolean().default(true),
  passwordRequireSymbols: z.boolean().default(false),
  passwordHistoryLength: z.number().int().min(0).max(24).default(5),
  passwordExpiryDays: z.number().int().min(0).max(365).default(0), // 0 = never expires
  
  // Two-Factor Authentication
  twoFactorRequired: z.boolean().default(false),
  twoFactorForAdmins: z.boolean().default(true),
  twoFactorMethod: z.enum(['totp', 'sms', 'email']).default('totp'),
  backupCodesEnabled: z.boolean().default(true),
  
  // Account Lockout
  maxLoginAttempts: z.number().int().min(3).max(20).default(5),
  lockoutDuration: z.number().int().min(5).max(1440).default(30), // Minuten
  lockoutEmailNotification: z.boolean().default(true),
  
  // IP Security
  allowedIpRanges: z.array(z.string()).max(20).default([]),
  blockedIpRanges: z.array(z.string()).max(100).default([]),
  enableGeoBlocking: z.boolean().default(false),
  allowedCountries: z.array(z.string()).max(300).default([]),
  
  // Audit & Logging
  enableAuditLog: z.boolean().default(true),
  auditLogRetentionDays: z.number().int().min(30).max(2555).default(365),
  logFailedLogins: z.boolean().default(true),
  logDataChanges: z.boolean().default(true),
  logApiAccess: z.boolean().default(false)
})

// Integration Settings Schema
export const integrationSettingsSchema = z.object({
  // Google Services
  googleMapsApiKey: z.string().max(200).optional(),
  googleAnalyticsId: z.string().max(50).optional(),
  googleTagManagerId: z.string().max(50).optional(),
  
  // Social Media Pixels
  facebookPixelId: z.string().max(50).optional(),
  linkedinInsightTag: z.string().max(50).optional(),
  twitterPixelId: z.string().max(50).optional(),
  
  // Payment Gateways
  stripePublishableKey: z.string().max(200).optional(),
  stripeSecretKey: z.string().max(200).optional(),
  paypalClientId: z.string().max(200).optional(),
  paypalClientSecret: z.string().max(200).optional(),
  
  // CRM Integration
  salesforceApiKey: z.string().max(200).optional(),
  hubspotApiKey: z.string().max(200).optional(),
  mailchimpApiKey: z.string().max(200).optional(),
  
  // Booking Platforms
  opentableApiKey: z.string().max(200).optional(),
  reserveApiKey: z.string().max(200).optional(),
  bookendaApiKey: z.string().max(200).optional(),
  
  // Communication
  twilioAccountSid: z.string().max(200).optional(),
  twilioAuthToken: z.string().max(200).optional(),
  slackWebhookUrl: z.string().url().optional().or(z.literal('')),
  
  // Review Platforms
  googlePlaceId: z.string().max(200).optional(),
  yelpBusinessId: z.string().max(200).optional(),
  tripadvisorId: z.string().max(200).optional()
})

// User Management Schema
export const userManagementSchema = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string().min(1, 'Vorname ist erforderlich').max(50),
  lastName: z.string().min(1, 'Nachname ist erforderlich').max(50),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']),
  isActive: z.boolean().default(true),
  temporaryPassword: z.string().min(8).max(50).optional(),
  mustChangePassword: z.boolean().default(true),
  permissions: z.array(z.string()).max(50).default([]),
  departmentId: z.string().cuid().optional(),
  managerId: z.string().cuid().optional(),
  phone: z.string().max(20).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  notes: z.string().max(1000).optional()
})

// Backup Settings Schema
export const backupSettingsSchema = z.object({
  enableAutomaticBackups: z.boolean().default(true),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  backupTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('02:00'),
  retentionDays: z.number().int().min(7).max(365).default(30),
  backupLocation: z.enum(['local', 's3', 'gcs', 'azure']).default('local'),
  
  // Cloud Storage Config
  cloudStorageKey: z.string().max(500).optional(),
  cloudStorageSecret: z.string().max(500).optional(),
  cloudStorageBucket: z.string().max(200).optional(),
  cloudStorageRegion: z.string().max(50).optional(),
  
  // Encryption
  encryptBackups: z.boolean().default(true),
  encryptionKey: z.string().max(500).optional(),
  
  // Notifications
  notifyOnSuccess: z.boolean().default(false),
  notifyOnFailure: z.boolean().default(true),
  backupNotificationEmails: z.array(z.string().email()).max(5).default([])
})

// Type Exports
export type SystemSetting = z.infer<typeof systemSettingSchema>
export type GeneralSettings = z.infer<typeof generalSettingsSchema>
export type BusinessHours = z.infer<typeof businessHoursSchema>
export type BusinessInformation = z.infer<typeof businessInformationSchema>
export type ReservationSettings = z.infer<typeof reservationSettingsSchema>
export type EmailSettings = z.infer<typeof emailSettingsSchema>
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>
export type SecuritySettings = z.infer<typeof securitySettingsSchema>
export type IntegrationSettings = z.infer<typeof integrationSettingsSchema>
export type UserManagement = z.infer<typeof userManagementSchema>
export type BackupSettings = z.infer<typeof backupSettingsSchema>