"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Palette, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface BrandingSettingsSectionProps {
  settings: Record<string, string>
}

export function BrandingSettingsSection({ settings }: BrandingSettingsSectionProps) {
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
        toast.success('Branding-Einstellungen gespeichert')
      } else {
        throw new Error('Fehler beim Speichern')
      }
    } catch (error) {
      toast.error('Fehler beim Speichern')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logos und Bilder
          </CardTitle>
          <CardDescription>
            Laden Sie Ihr Logo und Favicon hoch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                defaultValue={settings.logoUrl}
                placeholder="https://..."
              />
              <Button type="button" variant="outline" size="sm" className="w-full mt-2">
                <Upload className="h-4 w-4 mr-2" />
                Logo hochladen
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                name="faviconUrl"
                defaultValue={settings.faviconUrl}
                placeholder="https://..."
              />
              <Button type="button" variant="outline" size="sm" className="w-full mt-2">
                <Upload className="h-4 w-4 mr-2" />
                Favicon hochladen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farbschema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Farbschema
          </CardTitle>
          <CardDescription>
            Passen Sie die Farben Ihrer Marke an
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primärfarbe</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  type="color"
                  defaultValue={settings.primaryColor}
                  className="h-12 w-20"
                />
                <Input
                  defaultValue={settings.primaryColor}
                  placeholder="#FF6B35"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Sekundärfarbe</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  name="secondaryColor"
                  type="color"
                  defaultValue={settings.secondaryColor}
                  className="h-12 w-20"
                />
                <Input
                  defaultValue={settings.secondaryColor}
                  placeholder="#004E89"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Akzentfarbe</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  name="accentColor"
                  type="color"
                  defaultValue={settings.accentColor}
                  className="h-12 w-20"
                />
                <Input
                  defaultValue={settings.accentColor}
                  placeholder="#F7931E"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Speichern...' : 'Änderungen speichern'}
        </Button>
      </div>
    </form>
  )
}
