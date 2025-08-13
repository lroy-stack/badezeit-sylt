// Force dynamic rendering for authenticated route
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { GeneralSettingsForm } from './components/general-settings-form'
import { BusinessSettingsForm } from './components/business-settings-form'
import {
  Settings,
  Building2,
  Users,
  Mail,
  Globe,
  Shield,
  Database,
  Bell,
  Palette,
  Clock,
  MapPin,
  Phone,
  Save,
  RotateCcw,
  Upload,
  Download,
  Key,
  Activity
} from 'lucide-react'
import Link from 'next/link'

interface SettingsPageProps {
  searchParams: Promise<{
    section?: string
  }>
}

async function getSystemSettings() {
  const settings = await db.systemSetting.findMany({
    orderBy: { key: 'asc' }
  })

  // Konvertiere zu Key-Value Objekt
  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, string>)

  // Default Werte für fehlende Einstellungen
  return {
    // Allgemeine Einstellungen
    restaurantName: settingsMap.restaurantName || 'Badezeit Sylt',
    restaurantDescription: settingsMap.restaurantDescription || 'Fine Dining Restaurant auf Sylt',
    defaultLanguage: settingsMap.defaultLanguage || 'de',
    timezone: settingsMap.timezone || 'Europe/Berlin',
    currency: settingsMap.currency || 'EUR',
    logoUrl: settingsMap.logoUrl || '',
    
    // Geschäftszeiten
    openingHours: settingsMap.openingHours || '{"monday":{"open":"11:00","close":"22:00","closed":false},"tuesday":{"open":"11:00","close":"22:00","closed":false},"wednesday":{"open":"11:00","close":"22:00","closed":false},"thursday":{"open":"11:00","close":"22:00","closed":false},"friday":{"open":"11:00","close":"23:00","closed":false},"saturday":{"open":"11:00","close":"23:00","closed":false},"sunday":{"open":"12:00","close":"22:00","closed":false}}',
    
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
    
    // E-Mail-Einstellungen
    smtpHost: settingsMap.smtpHost || '',
    smtpPort: settingsMap.smtpPort || '587',
    smtpUser: settingsMap.smtpUser || '',
    smtpPassword: settingsMap.smtpPassword || '••••••••',
    fromEmail: settingsMap.fromEmail || 'noreply@badezeit-sylt.de',
    
    // Benachrichtigungen
    emailNotifications: settingsMap.emailNotifications === 'true',
    smsNotifications: settingsMap.smsNotifications === 'true',
    pushNotifications: settingsMap.pushNotifications === 'true',
    
    // Sicherheit
    sessionTimeout: settingsMap.sessionTimeout || '30',
    passwordMinLength: settingsMap.passwordMinLength || '8',
    twoFactorRequired: settingsMap.twoFactorRequired === 'true',
    
    // Integration
    googleMapsApiKey: settingsMap.googleMapsApiKey || '',
    analyticsId: settingsMap.analyticsId || '',
    facebookPixel: settingsMap.facebookPixel || '',
    
    lastUpdated: settings.length > 0 ? settings[0].updatedAt : new Date()
  }
}

async function getUserStats() {
  const [
    totalUsers,
    adminUsers,
    managerUsers,
    staffUsers,
    kitchenUsers,
    activeUsers
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: 'ADMIN' } }),
    db.user.count({ where: { role: 'MANAGER' } }),
    db.user.count({ where: { role: 'STAFF' } }),
    db.user.count({ where: { role: 'KITCHEN' } }),
    db.user.count({ where: { isActive: true } })
  ])

  return {
    totalUsers,
    adminUsers,
    managerUsers,
    staffUsers,
    kitchenUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers
  }
}

function SettingsNav({ currentSection }: { currentSection: string }) {
  const sections = [
    { id: 'general', name: 'Allgemein', icon: Settings },
    { id: 'business', name: 'Geschäftsdaten', icon: Building2 },
    { id: 'staff', name: 'Mitarbeiter', icon: Users },
    { id: 'notifications', name: 'Benachrichtigungen', icon: Bell },
    { id: 'email', name: 'E-Mail', icon: Mail },
    { id: 'security', name: 'Sicherheit', icon: Shield },
    { id: 'integrations', name: 'Integrationen', icon: Globe }
  ]

  return (
    <nav className="w-64 bg-card border-r">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Einstellungen</h2>
        <div className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = currentSection === section.id
            
            return (
              <Link
                key={section.id}
                href={`/dashboard/einstellungen?section=${section.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

function SettingsHeader({ settings }: { settings: any }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Systemeinstellungen</h1>
        <p className="text-muted-foreground">
          Konfigurieren Sie Restaurant-Einstellungen und Systemparameter
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button size="sm">
          <Save className="h-4 w-4 mr-2" />
          Speichern
        </Button>
      </div>
    </div>
  )
}



function StaffManagement({ userStats }: { userStats: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{userStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktiv</p>
                <p className="text-2xl font-bold">{userStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{userStats.adminUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Manager</p>
                <p className="text-2xl font-bold">{userStats.managerUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rollenverteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Administrator</p>
                <p className="text-sm text-muted-foreground">Vollzugriff auf alle Funktionen</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{userStats.adminUsers} Benutzer</Badge>
                <Button variant="outline" size="sm">Verwalten</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Manager</p>
                <p className="text-sm text-muted-foreground">Reservierungen, Kunden, Analytics</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{userStats.managerUsers} Benutzer</Badge>
                <Button variant="outline" size="sm">Verwalten</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Mitarbeiter</p>
                <p className="text-sm text-muted-foreground">Reservierungen und Kunden</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{userStats.staffUsers} Benutzer</Badge>
                <Button variant="outline" size="sm">Verwalten</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Küche</p>
                <p className="text-sm text-muted-foreground">Speisekarte und Allergene</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{userStats.kitchenUsers} Benutzer</Badge>
                <Button variant="outline" size="sm">Verwalten</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsLoading() {
  return (
    <div className="flex h-screen">
      <div className="w-64 bg-muted animate-pulse" />
      <div className="flex-1 p-6 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function EinstellungenPage({ searchParams }: SettingsPageProps) {
  const user = await requireRole(['ADMIN'])
  const params = await searchParams
  
  const [settings, userStats] = await Promise.all([
    getSystemSettings(),
    getUserStats()
  ])

  const currentSection = params?.section || 'general'

  return (
    <div className="flex h-full">
      <SettingsNav currentSection={currentSection} />
      
      <div className="flex-1 p-6">
        <SettingsHeader settings={settings} />

        <Suspense fallback={<SettingsLoading />}>
          {currentSection === 'general' && <GeneralSettingsForm settings={settings} />}
          {currentSection === 'business' && <BusinessSettingsForm settings={settings} />}
          {currentSection === 'staff' && <StaffManagement userStats={userStats} />}
          {currentSection === 'notifications' && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  Benachrichtigungseinstellungen werden implementiert...
                </div>
              </CardContent>
            </Card>
          )}
          {currentSection === 'email' && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  E-Mail-Konfiguration wird implementiert...
                </div>
              </CardContent>
            </Card>
          )}
          {currentSection === 'security' && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  Sicherheitseinstellungen werden implementiert...
                </div>
              </CardContent>
            </Card>
          )}
          {currentSection === 'integrations' && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  Integrationen werden implementiert...
                </div>
              </CardContent>
            </Card>
          )}
        </Suspense>
      </div>
    </div>
  )
}