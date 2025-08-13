'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Save, 
  Upload, 
  Building2,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { generalSettingsSchema, type GeneralSettings } from '@/lib/validations/settings'

interface GeneralSettingsFormProps {
  settings: any
}

export function GeneralSettingsForm({ settings }: GeneralSettingsFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      restaurantName: settings.restaurantName || 'Badezeit Sylt',
      restaurantDescription: settings.restaurantDescription || '',
      defaultLanguage: settings.defaultLanguage || 'de',
      timezone: settings.timezone || 'Europe/Berlin',
      currency: settings.currency || 'EUR',
      logoUrl: settings.logoUrl || '',
      faviconUrl: settings.faviconUrl || '',
      primaryColor: settings.primaryColor || '',
      secondaryColor: settings.secondaryColor || '',
      dateFormat: settings.dateFormat || 'DD.MM.YYYY',
      timeFormat: settings.timeFormat || '24h'
    }
  })

  const saveGeneralMutation = useMutation({
    mutationFn: async (data: GeneralSettings) => {
      const settingsArray = Object.entries(data).map(([key, value]) => ({
        key,
        value: String(value || ''),
        description: `General setting: ${key}`
      }))

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsArray)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Allgemeine Einstellungen gespeichert')
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Speichern: ${error.message}`)
    }
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Datei zu groß. Maximum 2MB.')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Nur Bilddateien sind erlaubt.')
      return
    }

    setIsUploading(true)

    try {
      // In a real app, you would upload to a file storage service
      // For now, we'll simulate the upload and use a placeholder URL
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const logoUrl = `/uploads/logo-${Date.now()}.${file.name.split('.').pop()}`
      form.setValue('logoUrl', logoUrl)
      toast.success('Logo erfolgreich hochgeladen')
    } catch (error) {
      toast.error('Fehler beim Hochladen des Logos')
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = (data: any) => {
    saveGeneralMutation.mutate(data)
  }

  const { formState: { errors, isDirty } } = form

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Restaurant Information */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant-Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="restaurantName">Restaurant Name *</Label>
              <Input
                id="restaurantName"
                {...form.register('restaurantName')}
                placeholder="z.B. Badezeit Sylt"
                className="mt-1"
              />
              {errors.restaurantName && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.restaurantName.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="defaultLanguage">Standardsprache</Label>
              <Select 
                value={form.watch('defaultLanguage')} 
                onValueChange={(value) => form.setValue('defaultLanguage', value as 'de' | 'en')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sprache wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timezone">Zeitzone *</Label>
              <Select 
                value={form.watch('timezone')} 
                onValueChange={(value) => form.setValue('timezone', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Zeitzone wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Berlin">Europa/Berlin</SelectItem>
                  <SelectItem value="Europe/London">Europa/London</SelectItem>
                  <SelectItem value="Europe/Paris">Europa/Paris</SelectItem>
                  <SelectItem value="Europe/Amsterdam">Europa/Amsterdam</SelectItem>
                  <SelectItem value="Europe/Vienna">Europa/Wien</SelectItem>
                  <SelectItem value="Europe/Zurich">Europa/Zürich</SelectItem>
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.timezone.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="currency">Währung</Label>
              <Select 
                value={form.watch('currency')} 
                onValueChange={(value) => form.setValue('currency', value as 'EUR' | 'USD' | 'GBP' | 'CHF')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Währung wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="GBP">Britisches Pfund (GBP)</SelectItem>
                  <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="restaurantDescription">Beschreibung</Label>
            <Textarea
              id="restaurantDescription"
              {...form.register('restaurantDescription')}
              placeholder="Kurze Beschreibung des Restaurants..."
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Diese Beschreibung wird auf der Website und in Reservierungsbestätigungen verwendet.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logo & Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Logo & Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
              {form.watch('logoUrl') ? (
                <img 
                  src={form.watch('logoUrl')} 
                  alt="Restaurant Logo" 
                  className="w-full h-full object-contain rounded-lg" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = ''
                    form.setValue('logoUrl', '')
                  }}
                />
              ) : (
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="space-y-2">
                <p className="text-sm font-medium">Restaurant Logo</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG oder SVG bis 2MB. Empfohlene Größe: 400x400px
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    disabled={isUploading}
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    {isUploading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? 'Hochladen...' : 'Logo hochladen'}
                  </Button>
                  
                  {form.watch('logoUrl') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue('logoUrl', '')}
                    >
                      Entfernen
                    </Button>
                  )}
                </div>
                
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primärfarbe</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primaryColor"
                  type="color"
                  {...form.register('primaryColor')}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  {...form.register('primaryColor')}
                  placeholder="#0066cc"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondaryColor">Sekundärfarbe</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="secondaryColor"
                  type="color"
                  {...form.register('secondaryColor')}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  {...form.register('secondaryColor')}
                  placeholder="#66a3ff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Anzeigeeinstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateFormat">Datumsformat</Label>
              <Select 
                value={form.watch('dateFormat')} 
                onValueChange={(value) => form.setValue('dateFormat', value as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Format wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timeFormat">Zeitformat</Label>
              <Select 
                value={form.watch('timeFormat')} 
                onValueChange={(value) => form.setValue('timeFormat', value as '24h' | '12h')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Format wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Stunden (14:30)</SelectItem>
                  <SelectItem value="12h">12 Stunden (2:30 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={!isDirty || saveGeneralMutation.isPending}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Zurücksetzen
        </Button>
        
        <Button 
          type="submit" 
          disabled={!isDirty || saveGeneralMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {saveGeneralMutation.isPending ? 'Speichere...' : 'Änderungen speichern'}
        </Button>
      </div>
    </form>
  )
}