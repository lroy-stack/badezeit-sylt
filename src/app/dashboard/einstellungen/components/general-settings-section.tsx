"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, Globe, Clock, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface GeneralSettingsSectionProps {
  settings: Record<string, string>
}

export function GeneralSettingsSection({ settings }: GeneralSettingsSectionProps) {
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Einstellungen erfolgreich gespeichert')
      } else {
        throw new Error('Fehler beim Speichern')
      }
    } catch (error) {
      toast.error('Fehler beim Speichern der Einstellungen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Restaurant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Restaurant-Informationen
          </CardTitle>
          <CardDescription>
            Grundlegende Informationen über Ihr Restaurant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant-Name</Label>
              <Input
                id="restaurantName"
                name="restaurantName"
                defaultValue={settings.restaurantName}
                placeholder="z.B. Badezeit Sylt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={settings.website}
                placeholder="https://restaurant.de"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurantDescription">Beschreibung</Label>
            <Textarea
              id="restaurantDescription"
              name="restaurantDescription"
              defaultValue={settings.restaurantDescription}
              placeholder="Kurze Beschreibung Ihres Restaurants"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Regional-Einstellungen
          </CardTitle>
          <CardDescription>
            Sprache, Zeitzone und Währungseinstellungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">Sprache</Label>
              <Select name="defaultLanguage" defaultValue={settings.defaultLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zeitzone</Label>
              <Select name="timezone" defaultValue={settings.timezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Währung</Label>
              <Select name="currency" defaultValue={settings.currency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Datumsformat</Label>
              <Select name="dateFormat" defaultValue={settings.dateFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Zeitformat</Label>
              <Select name="timeFormat" defaultValue={settings.timeFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Stunden</SelectItem>
                  <SelectItem value="12h">12 Stunden (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kontaktinformationen */}
      <Card>
        <CardHeader>
          <CardTitle>Kontaktinformationen</CardTitle>
          <CardDescription>
            Ihre Kontaktdaten für Kunden und Reservierungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={settings.phone}
                placeholder="+49 123 456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={settings.email}
                placeholder="info@restaurant.de"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={settings.address}
              placeholder="Straße, PLZ Ort"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Speichern...' : 'Änderungen speichern'}
        </Button>
      </div>
    </form>
  )
}
