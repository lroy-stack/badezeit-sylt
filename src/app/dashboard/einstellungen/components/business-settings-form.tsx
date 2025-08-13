'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  RefreshCw,
  AlertCircle,
  Edit,
  Calendar,
  Users
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { businessInformationSchema, type BusinessInformation } from '@/lib/validations/settings'

interface BusinessSettingsFormProps {
  settings: any
}

const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function BusinessSettingsForm({ settings }: BusinessSettingsFormProps) {
  const [editingHours, setEditingHours] = useState<string | null>(null)
  const queryClient = useQueryClient()
  
  // Parse opening hours from settings
  const parseOpeningHours = () => {
    try {
      return JSON.parse(settings.openingHours || '{}') 
    } catch {
      // Return default hours if parsing fails
      return {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '11:00', close: '23:00', closed: false },
        sunday: { open: '12:00', close: '22:00', closed: false }
      }
    }
  }

  const form = useForm({
    resolver: zodResolver(businessInformationSchema),
    defaultValues: {
      address: settings.address || '',
      city: settings.city || 'Sylt',
      postalCode: settings.postalCode || '25980',
      country: settings.country || 'Deutschland',
      phone: settings.phone || '',
      fax: settings.fax || '',
      email: settings.email || '',
      website: settings.website || '',
      facebook: settings.facebook || '',
      instagram: settings.instagram || '',
      twitter: settings.twitter || '',
      linkedin: settings.linkedin || '',
      taxNumber: settings.taxNumber || '',
      vatNumber: settings.vatNumber || '',
      commercialRegister: settings.commercialRegister || '',
      managingDirector: settings.managingDirector || '',
      openingHours: parseOpeningHours()
    }
  })

  const saveBusinessMutation = useMutation({
    mutationFn: async (data: BusinessInformation) => {
      const settingsArray = [
        { key: 'address', value: data.address, description: 'Restaurant address' },
        { key: 'city', value: data.city, description: 'Restaurant city' },
        { key: 'postalCode', value: data.postalCode, description: 'Restaurant postal code' },
        { key: 'country', value: data.country, description: 'Restaurant country' },
        { key: 'phone', value: data.phone, description: 'Restaurant phone number' },
        { key: 'fax', value: data.fax || '', description: 'Restaurant fax number' },
        { key: 'email', value: data.email, description: 'Restaurant email address' },
        { key: 'website', value: data.website || '', description: 'Restaurant website' },
        { key: 'facebook', value: data.facebook || '', description: 'Facebook page URL' },
        { key: 'instagram', value: data.instagram || '', description: 'Instagram profile URL' },
        { key: 'twitter', value: data.twitter || '', description: 'Twitter profile URL' },
        { key: 'linkedin', value: data.linkedin || '', description: 'LinkedIn profile URL' },
        { key: 'taxNumber', value: data.taxNumber || '', description: 'Tax number' },
        { key: 'vatNumber', value: data.vatNumber || '', description: 'VAT number' },
        { key: 'commercialRegister', value: data.commercialRegister || '', description: 'Commercial register' },
        { key: 'managingDirector', value: data.managingDirector || '', description: 'Managing director' },
        { key: 'openingHours', value: JSON.stringify(data.openingHours), description: 'Restaurant opening hours' }
      ]

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
      toast.success('Geschäftseinstellungen gespeichert')
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Speichern: ${error.message}`)
    }
  })

  const onSubmit = (data: any) => {
    saveBusinessMutation.mutate(data)
  }

  const updateOpeningHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const currentHours = form.getValues('openingHours')
    const updatedHours = {
      ...currentHours,
      [day]: {
        ...currentHours[day as keyof typeof currentHours],
        [field]: value
      }
    }
    form.setValue('openingHours', updatedHours)
  }

  const { formState: { errors, isDirty } } = form
  const openingHours = form.watch('openingHours')

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Kontaktinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse *
              </Label>
              <Input
                id="address"
                {...form.register('address')}
                placeholder="Strandstraße 1"
                className="mt-1"
              />
              {errors.address && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.address.message}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="postalCode">PLZ *</Label>
                <Input
                  id="postalCode"
                  {...form.register('postalCode')}
                  placeholder="25980"
                  className="mt-1"
                />
                {errors.postalCode && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="city">Stadt *</Label>
                <Input
                  id="city"
                  {...form.register('city')}
                  placeholder="Sylt"
                  className="mt-1"
                />
                {errors.city && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="country">Land *</Label>
              <Input
                id="country"
                {...form.register('country')}
                placeholder="Deutschland"
                className="mt-1"
              />
              {errors.country && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.country.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefon *
              </Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                placeholder="+49 4651 123456"
                className="mt-1"
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                type="tel"
                {...form.register('fax')}
                placeholder="+49 4651 123457"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-Mail *
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="info@badezeit-sylt.de"
                className="mt-1"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                {...form.register('website')}
                placeholder="https://badezeit-sylt.de"
                className="mt-1"
              />
              {errors.website && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                type="url"
                {...form.register('facebook')}
                placeholder="https://facebook.com/badezeit-sylt"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="url"
                {...form.register('instagram')}
                placeholder="https://instagram.com/badezeit_sylt"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                type="url"
                {...form.register('twitter')}
                placeholder="https://twitter.com/badezeit_sylt"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                {...form.register('linkedin')}
                placeholder="https://linkedin.com/company/badezeit-sylt"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Öffnungszeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dayKeys.map((day, index) => {
              const dayData = openingHours[day as keyof typeof openingHours]
              const isEditing = editingHours === day
              
              return (
                <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium">
                      {dayNames[index]}
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!dayData.closed}
                          onCheckedChange={(checked: boolean) => {
                            updateOpeningHours(day, 'closed', !checked)
                          }}
                        />
                        {!dayData.closed && (
                          <>
                            <Input
                              type="time"
                              value={dayData.open}
                              onChange={(e) => updateOpeningHours(day, 'open', e.target.value)}
                              className="w-24"
                            />
                            <span>-</span>
                            <Input
                              type="time"
                              value={dayData.close}
                              onChange={(e) => updateOpeningHours(day, 'close', e.target.value)}
                              className="w-24"
                            />
                          </>
                        )}
                        {dayData.closed && (
                          <Badge variant="secondary">Geschlossen</Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {dayData.closed ? (
                          <Badge variant="secondary">Geschlossen</Badge>
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            {dayData.open} - {dayData.close}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (isEditing) {
                        setEditingHours(null)
                      } else {
                        setEditingHours(day)
                      }
                    }}
                  >
                    {isEditing ? 'Fertig' : 'Bearbeiten'}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Rechtliche Angaben</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="managingDirector">Geschäftsführer</Label>
              <Input
                id="managingDirector"
                {...form.register('managingDirector')}
                placeholder="Max Mustermann"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="commercialRegister">Handelsregister</Label>
              <Input
                id="commercialRegister"
                {...form.register('commercialRegister')}
                placeholder="HRB 12345, AG Hamburg"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="taxNumber">Steuernummer</Label>
              <Input
                id="taxNumber"
                {...form.register('taxNumber')}
                placeholder="12/345/67890"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="vatNumber">USt-IdNr.</Label>
              <Input
                id="vatNumber"
                {...form.register('vatNumber')}
                placeholder="DE123456789"
                className="mt-1"
              />
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
          disabled={!isDirty || saveBusinessMutation.isPending}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Zurücksetzen
        </Button>
        
        <Button 
          type="submit" 
          disabled={!isDirty || saveBusinessMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {saveBusinessMutation.isPending ? 'Speichere...' : 'Änderungen speichern'}
        </Button>
      </div>
    </form>
  )
}