// Force dynamic rendering for authenticated route
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  Settings,
  Palette,
  Bell,
  Shield,
  Globe,
  Paintbrush,
  Mail,
  Database,
  Users,
  Download,
  Upload
} from 'lucide-react'

// Import section components
import { GeneralSettingsSection } from './components/general-settings-section'
import { BrandingSettingsSection } from './components/branding-settings-section'
import { NotificationSettingsSection } from './components/notification-settings-section'
import { SystemSettingsSection } from './components/system-settings-section'

interface SettingsPageProps {
  searchParams: Promise<{
    section?: string
  }>
}

async function getSystemSettings() {
  const settings = await db.systemSetting.findMany({
    orderBy: { key: 'asc' }
  })

  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, string>)

  return {
    // Allgemeine Einstellungen
    restaurantName: settingsMap.restaurantName || 'Badezeit Sylt',
    restaurantDescription: settingsMap.restaurantDescription || 'Fine Dining Restaurant auf Sylt',
    defaultLanguage: settingsMap.defaultLanguage || 'de',
    timezone: settingsMap.timezone || 'Europe/Berlin',
    currency: settingsMap.currency || 'EUR',
    dateFormat: settingsMap.dateFormat || 'DD.MM.YYYY',
    timeFormat: settingsMap.timeFormat || '24h',

    // Branding
    logoUrl: settingsMap.logoUrl || '',
    faviconUrl: settingsMap.faviconUrl || '',
    primaryColor: settingsMap.primaryColor || '#FF6B35',
    secondaryColor: settingsMap.secondaryColor || '#004E89',
    accentColor: settingsMap.accentColor || '#F7931E',

    // Kontaktinformationen
    address: settingsMap.address || 'Strandstraße 1, 25980 Sylt',
    phone: settingsMap.phone || '+49 4651 123456',
    email: settingsMap.email || 'info@badezeit-sylt.de',
    website: settingsMap.website || 'https://badezeit-sylt.de',

    // Reservierungseinstellungen
    maxReservationDays: settingsMap.maxReservationDays || '60',
    minReservationHours: settingsMap.minReservationHours || '2',
    defaultReservationDuration: settingsMap.defaultReservationDuration || '120',
    maxPartySize: settingsMap.maxPartySize || '12',

    // Benachrichtigungen
    emailNotificationsEnabled: settingsMap.emailNotificationsEnabled || 'true',
    smsNotificationsEnabled: settingsMap.smsNotificationsEnabled || 'false',
    notificationEmailFrom: settingsMap.notificationEmailFrom || 'noreply@badezeit-sylt.de',

    // System
    maintenanceMode: settingsMap.maintenanceMode || 'false',
    autoBackupEnabled: settingsMap.autoBackupEnabled || 'true',
    backupFrequency: settingsMap.backupFrequency || 'daily',
    dataRetentionDays: settingsMap.dataRetentionDays || '365',
  }
}

async function getUserStats() {
  const [totalUsers, adminCount, managerCount, staffCount] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: 'ADMIN' } }),
    db.user.count({ where: { role: 'MANAGER' } }),
    db.user.count({ where: { role: 'STAFF' } }),
  ])

  return {
    total: totalUsers,
    admins: adminCount,
    managers: managerCount,
    staff: staffCount,
  }
}

function SettingsHeader() {
  return (
    <div className="space-y-2 mb-8">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
        <Settings className="h-8 w-8" />
        Einstellungen
      </h1>
      <p className="text-muted-foreground">
        Verwalten Sie die Systemeinstellungen, Branding, Benachrichtigungen und mehr.
      </p>
    </div>
  )
}

function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-64" />
      <div className="h-[600px] bg-muted rounded" />
    </div>
  )
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  // Require ADMIN role
  await requireRole('ADMIN')

  const params = await searchParams
  const defaultSection = params.section || 'general'

  // Fetch data in parallel
  const [settings, userStats] = await Promise.all([
    getSystemSettings(),
    getUserStats()
  ])

  return (
    <div className="space-y-6">
      <SettingsHeader />

      <Tabs defaultValue={defaultSection} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
          <TabsTrigger
            value="general"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Allgemein</span>
          </TabsTrigger>

          <TabsTrigger
            value="branding"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Paintbrush className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>

          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Benachrichtigungen</span>
          </TabsTrigger>

          <TabsTrigger
            value="system"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<SettingsLoading />}>
          {/* Allgemein Section */}
          <TabsContent value="general" className="space-y-4">
            <GeneralSettingsSection settings={settings} />
          </TabsContent>

          {/* Branding Section */}
          <TabsContent value="branding" className="space-y-4">
            <BrandingSettingsSection settings={settings} />
          </TabsContent>

          {/* Benachrichtigungen Section */}
          <TabsContent value="notifications" className="space-y-4">
            <NotificationSettingsSection settings={settings} />
          </TabsContent>

          {/* System Section */}
          <TabsContent value="system" className="space-y-4">
            <SystemSettingsSection settings={settings} userStats={userStats} />
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  )
}
