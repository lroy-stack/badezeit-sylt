"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Save, Bell, Mail } from "lucide-react"

interface NotificationSettingsSectionProps {
  settings: Record<string, string>
}

export function NotificationSettingsSection({ settings }: NotificationSettingsSectionProps) {
  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungseinstellungen
          </CardTitle>
          <CardDescription>
            Verwalten Sie E-Mail- und SMS-Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>E-Mail-Benachrichtigungen</Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigungen per E-Mail erhalten
              </p>
            </div>
            <Switch
              defaultChecked={settings.emailNotificationsEnabled === 'true'}
              name="emailNotificationsEnabled"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>SMS-Benachrichtigungen</Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigungen per SMS erhalten
              </p>
            </div>
            <Switch
              defaultChecked={settings.smsNotificationsEnabled === 'true'}
              name="smsNotificationsEnabled"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notificationEmailFrom">Absender E-Mail</Label>
            <Input
              id="notificationEmailFrom"
              name="notificationEmailFrom"
              type="email"
              defaultValue={settings.notificationEmailFrom}
            />
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
