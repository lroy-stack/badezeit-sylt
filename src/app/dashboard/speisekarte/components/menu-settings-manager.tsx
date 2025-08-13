'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Save, 
  RotateCcw,
  DollarSign,
  Clock,
  Globe,
  Palette,
  Database,
  Shield,
  Zap,
  Bell,
  Eye
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Validation schema
const menuSettingsSchema = z.object({
  // Display Settings
  itemsPerPage: z.number().min(5).max(50).default(12),
  showPrices: z.boolean().default(true),
  showDescriptions: z.boolean().default(true),
  showAllergens: z.boolean().default(true),
  showDietaryLabels: z.boolean().default(true),
  showImages: z.boolean().default(true),
  
  // Pricing Settings
  currency: z.string().default('EUR'),
  showCentsAlways: z.boolean().default(false),
  taxIncluded: z.boolean().default(true),
  taxRate: z.number().min(0).max(30).default(19),
  
  // Availability Settings
  hideUnavailableItems: z.boolean().default(false),
  showAvailabilityStatus: z.boolean().default(true),
  outOfStockMessage: z.string().default('Nicht verfügbar'),
  
  // Language Settings
  defaultLanguage: z.enum(['de', 'en']).default('de'),
  showBothLanguages: z.boolean().default(false),
  autoTranslateEnabled: z.boolean().default(false),
  
  // Menu Layout
  categoriesPerRow: z.number().min(1).max(6).default(3),
  itemsPerCategory: z.number().min(5).max(100).default(20),
  compactMode: z.boolean().default(false),
  
  // Public Menu Settings
  enablePublicMenu: z.boolean().default(true),
  publicMenuSlug: z.string().default('menu'),
  enableQRMenu: z.boolean().default(true),
  showLastUpdated: z.boolean().default(true),
  
  // SEO Settings
  metaTitle: z.string().default('Speisekarte - Badezeit Sylt'),
  metaDescription: z.string().default('Entdecken Sie unsere köstliche Speisekarte mit frischen, regionalen Spezialitäten auf Sylt.'),
  
  // Cache Settings
  cacheEnabled: z.boolean().default(true),
  cacheDuration: z.number().min(5).max(60).default(15), // minutes
})

type MenuSettingsData = z.infer<typeof menuSettingsSchema>

interface MenuSettingsManagerProps {
  userRole: string
}

export function MenuSettingsManager({ userRole }: MenuSettingsManagerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const canEdit = ['ADMIN', 'MANAGER'].includes(userRole)

  // Form setup with default values
  const form = useForm({
    resolver: zodResolver(menuSettingsSchema),
    defaultValues: {
      itemsPerPage: 12,
      showPrices: true,
      showDescriptions: true,
      showAllergens: true,
      showDietaryLabels: true,
      showImages: true,
      currency: 'EUR',
      showCentsAlways: false,
      taxIncluded: true,
      taxRate: 19,
      hideUnavailableItems: false,
      showAvailabilityStatus: true,
      outOfStockMessage: 'Nicht verfügbar',
      defaultLanguage: 'de',
      showBothLanguages: false,
      autoTranslateEnabled: false,
      categoriesPerRow: 3,
      itemsPerCategory: 20,
      compactMode: false,
      enablePublicMenu: true,
      publicMenuSlug: 'menu',
      enableQRMenu: true,
      showLastUpdated: true,
      metaTitle: 'Speisekarte - Badezeit Sylt',
      metaDescription: 'Entdecken Sie unsere köstliche Speisekarte mit frischen, regionalen Spezialitäten auf Sylt.',
      cacheEnabled: true,
      cacheDuration: 15,
    }
  })

  const onSubmit = async (data: any) => {
    if (!canEdit) return
    
    setIsLoading(true)
    try {
      // Here would be the API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Menü-Einstellungen erfolgreich gespeichert')
    } catch (error) {
      toast.error('Fehler beim Speichern der Einstellungen')
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    form.reset()
    toast.info('Einstellungen auf Standardwerte zurückgesetzt')
  }

  if (!canEdit) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <p>Sie haben keine Berechtigung, Menü-Einstellungen zu ändern.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Menü-Einstellungen</h3>
          <p className="text-sm text-muted-foreground">
            Konfigurieren Sie die Darstellung und Funktionalität Ihrer Speisekarte
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Speichere...' : 'Speichern'}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="display" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="display">
              <Eye className="h-4 w-4 mr-2" />
              Anzeige
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <DollarSign className="h-4 w-4 mr-2" />
              Preise
            </TabsTrigger>
            <TabsTrigger value="language">
              <Globe className="h-4 w-4 mr-2" />
              Sprache
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Palette className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="public">
              <Globe className="h-4 w-4 mr-2" />
              Öffentlich
            </TabsTrigger>
            <TabsTrigger value="system">
              <Database className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Anzeige-Optionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="itemsPerPage">Gerichte pro Seite</Label>
                      <Input
                        id="itemsPerPage"
                        type="number"
                        min="5"
                        max="50"
                        {...form.register('itemsPerPage', { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showPrices"
                          {...form.register('showPrices')}
                          className="rounded"
                        />
                        <Label htmlFor="showPrices">Preise anzeigen</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showDescriptions"
                          {...form.register('showDescriptions')}
                          className="rounded"
                        />
                        <Label htmlFor="showDescriptions">Beschreibungen anzeigen</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showAllergens"
                          {...form.register('showAllergens')}
                          className="rounded"
                        />
                        <Label htmlFor="showAllergens">Allergene anzeigen</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showDietaryLabels"
                          {...form.register('showDietaryLabels')}
                          className="rounded"
                        />
                        <Label htmlFor="showDietaryLabels">Diät-Labels anzeigen</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showImages"
                          {...form.register('showImages')}
                          className="rounded"
                        />
                        <Label htmlFor="showImages">Bilder anzeigen</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showAvailabilityStatus"
                          {...form.register('showAvailabilityStatus')}
                          className="rounded"
                        />
                        <Label htmlFor="showAvailabilityStatus">Verfügbarkeitsstatus anzeigen</Label>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="outOfStockMessage">Nachricht für nicht verfügbare Gerichte</Label>
                      <Input
                        id="outOfStockMessage"
                        {...form.register('outOfStockMessage')}
                        placeholder="z.B. Nicht verfügbar"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preis-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currency">Währung</Label>
                      <Input
                        id="currency"
                        {...form.register('currency')}
                        placeholder="EUR"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="taxRate">Mehrwertsteuersatz (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        min="0"
                        max="30"
                        step="0.1"
                        {...form.register('taxRate', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showCentsAlways"
                        {...form.register('showCentsAlways')}
                        className="rounded"
                      />
                      <Label htmlFor="showCentsAlways">Cents immer anzeigen (z.B. 15,00€)</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="taxIncluded"
                        {...form.register('taxIncluded')}
                        className="rounded"
                      />
                      <Label htmlFor="taxIncluded">Preise inkl. MwSt.</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hideUnavailableItems"
                        {...form.register('hideUnavailableItems')}
                        className="rounded"
                      />
                      <Label htmlFor="hideUnavailableItems">Nicht verfügbare Gerichte ausblenden</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sprach-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="defaultLanguage">Standard-Sprache</Label>
                      <select
                        id="defaultLanguage"
                        {...form.register('defaultLanguage')}
                        className="w-full p-2 border rounded"
                      >
                        <option value="de">Deutsch</option>
                        <option value="en">Englisch</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showBothLanguages"
                        {...form.register('showBothLanguages')}
                        className="rounded"
                      />
                      <Label htmlFor="showBothLanguages">Beide Sprachen anzeigen</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoTranslateEnabled"
                        {...form.register('autoTranslateEnabled')}
                        className="rounded"
                      />
                      <Label htmlFor="autoTranslateEnabled">Automatische Übersetzung aktivieren</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoriesPerRow">Kategorien pro Zeile</Label>
                      <Input
                        id="categoriesPerRow"
                        type="number"
                        min="1"
                        max="6"
                        {...form.register('categoriesPerRow', { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="itemsPerCategory">Gerichte pro Kategorie</Label>
                      <Input
                        id="itemsPerCategory"
                        type="number"
                        min="5"
                        max="100"
                        {...form.register('itemsPerCategory', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="compactMode"
                        {...form.register('compactMode')}
                        className="rounded"
                      />
                      <Label htmlFor="compactMode">Kompakte Ansicht</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="public" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Öffentliche Menü-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enablePublicMenu"
                        {...form.register('enablePublicMenu')}
                        className="rounded"
                      />
                      <Label htmlFor="enablePublicMenu">Öffentliches Menü aktivieren</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="publicMenuSlug">URL-Pfad für öffentliches Menü</Label>
                      <Input
                        id="publicMenuSlug"
                        {...form.register('publicMenuSlug')}
                        placeholder="menu"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        URL: /speisekarte/{form.watch('publicMenuSlug')}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="metaTitle">SEO: Meta Title</Label>
                      <Input
                        id="metaTitle"
                        {...form.register('metaTitle')}
                        placeholder="Speisekarte - Badezeit Sylt"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="metaDescription">SEO: Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        {...form.register('metaDescription')}
                        placeholder="Beschreibung für Suchmaschinen..."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enableQRMenu"
                        {...form.register('enableQRMenu')}
                        className="rounded"
                      />
                      <Label htmlFor="enableQRMenu">QR-Code Menü aktivieren</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showLastUpdated"
                        {...form.register('showLastUpdated')}
                        className="rounded"
                      />
                      <Label htmlFor="showLastUpdated">&quot;Zuletzt aktualisiert&quot; anzeigen</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cacheEnabled"
                        {...form.register('cacheEnabled')}
                        className="rounded"
                      />
                      <Label htmlFor="cacheEnabled">Cache aktivieren</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="cacheDuration">Cache-Dauer (Minuten)</Label>
                      <Input
                        id="cacheDuration"
                        type="number"
                        min="5"
                        max="60"
                        {...form.register('cacheDuration', { valueAsNumber: true })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Wie lange das Menü im Cache gespeichert wird
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}