"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, Shield, Database, Download, Upload, Users } from "lucide-react"

interface SystemSettingsSectionProps {
  settings: Record<string, string>
  userStats: {
    total: number
    admins: number
    managers: number
    staff: number
  }
}

export function SystemSettingsSection({ settings, userStats }: SystemSettingsSectionProps) {
  return (
    <form className="space-y-6">
      {/* Benutzerstatistiken */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Benutzerstatistiken
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">{userStats.total}</div>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-red-500">{userStats.admins}</div>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-500">{userStats.managers}</div>
              <p className="text-sm text-muted-foreground">Manager</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-500">{userStats.staff}</div>
              <p className="text-sm text-muted-foreground">Mitarbeiter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wartungsmodus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Systemsteuerung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Wartungsmodus</Label>
              <p className="text-sm text-muted-foreground">
                System vorübergehend deaktivieren
              </p>
            </div>
            <Switch
              defaultChecked={settings.maintenanceMode === 'true'}
              name="maintenanceMode"
            />
          </div>
        </CardContent>
      </Card>

      {/* Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Automatische Backups</Label>
              <p className="text-sm text-muted-foreground">
                Regelmäßige Datensicherung aktivieren
              </p>
            </div>
            <Switch
              defaultChecked={settings.autoBackupEnabled === 'true'}
              name="autoBackupEnabled"
            />
          </div>

          <div className="space-y-2">
            <Label>Backup-Häufigkeit</Label>
            <Select name="backupFrequency" defaultValue={settings.backupFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Stündlich</SelectItem>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Backup herunterladen
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Backup hochladen
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Änderungen speichern
        </Button>
      </div>
    </form>
  )
}
