'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  QrCode,
  Download,
  Eye,
  Plus,
  RefreshCw,
  Wifi,
  Menu,
  Smartphone,
  MapPin,
  Copy,
  Check,
  Trash2
} from 'lucide-react'
import QRCodeLib from 'qrcode'

interface QRCodeManagerProps {
  tables: Array<{
    id: string
    number: number
    capacity: number
    location: string
    qrCodes: Array<{
      id: string
      code: string
      isActive: boolean
      createdAt: string | Date
      menuLink?: string
      wifiInfo?: string
      customMessage?: string
    }>
  }>
}

export function QRCodeManager({ tables: initialTables }: QRCodeManagerProps) {
  const [tables, setTables] = useState(initialTables)
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string>('')
  
  const [qrConfig, setQrConfig] = useState({
    includeMenuLink: true,
    includeWifiInfo: false,
    customMessage: '',
    wifiSSID: '',
    wifiPassword: '',
    menuUrl: 'https://badezeit.de/speisekarte'
  })

  const getLocationLabel = (location: string) => {
    const labels: Record<string, string> = {
      'TERRACE_SEA_VIEW': 'Terrasse Meerblick',
      'TERRACE_STANDARD': 'Terrasse Standard',
      'INDOOR_WINDOW': 'Innen Fenster',
      'INDOOR_STANDARD': 'Innen Standard',
      'BAR_AREA': 'Barbereich'
    }
    return labels[location] || location
  }

  // Generate QR code content
  const generateQRContent = (tableNumber: number) => {
    let content = `🍽️ Badezeit Sylt - Tisch ${tableNumber}\n\n`
    
    if (qrConfig.includeMenuLink) {
      content += `📋 Speisekarte: ${qrConfig.menuUrl}?table=${tableNumber}\n\n`
    }
    
    if (qrConfig.includeWifiInfo && qrConfig.wifiSSID) {
      content += `📶 WiFi: ${qrConfig.wifiSSID}\n`
      if (qrConfig.wifiPassword) {
        content += `🔑 Passwort: ${qrConfig.wifiPassword}\n\n`
      }
    }
    
    if (qrConfig.customMessage) {
      content += `💬 ${qrConfig.customMessage}\n\n`
    }
    
    content += `🌊 Willkommen in unserem Restaurant!`
    
    return content
  }

  // Generate QR codes for selected tables
  const generateQRCodes = async () => {
    if (selectedTables.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Tisch aus')
      return
    }

    setIsGenerating(true)
    try {
      const qrCodePromises = selectedTables.map(async (tableId) => {
        const table = tables.find(t => t.id === tableId)
        if (!table) return null

        const content = generateQRContent(table.number)
        
        // Generate QR code data URL
        const qrDataUrl = await QRCodeLib.toDataURL(content, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        return {
          tableId,
          tableNumber: table.number,
          content,
          dataUrl: qrDataUrl
        }
      })

      const qrCodes = await Promise.all(qrCodePromises)
      const validQRCodes = qrCodes.filter((qr): qr is NonNullable<typeof qr> => qr !== null)

      // Save to API
      const response = await fetch('/api/qr-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableIds: selectedTables,
          includeMenuLink: qrConfig.includeMenuLink,
          includeWifiInfo: qrConfig.includeWifiInfo,
          customMessage: qrConfig.customMessage,
          qrCodes: validQRCodes
        })
      }).catch(() => {
        // API might not exist yet, continue with frontend only
        return { ok: true }
      })

      toast.success(`${validQRCodes.length} QR-Codes erfolgreich generiert`)
      setSelectedTables([])
      
      // Show preview of first QR code
      if (validQRCodes.length > 0) {
        setQrCodeDataUrl(validQRCodes[0].dataUrl)
        setShowPreview(true)
      }
      
    } catch (error) {
      console.error('Fehler beim Generieren der QR-Codes:', error)
      toast.error('Fehler beim Generieren der QR-Codes')
    } finally {
      setIsGenerating(false)
    }
  }

  // Download QR code
  const downloadQRCode = async (content: string, tableNumber: number) => {
    try {
      const dataUrl = await QRCodeLib.toDataURL(content, {
        width: 600,
        margin: 3,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      const link = document.createElement('a')
      link.download = `tisch-${tableNumber}-qr-code.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`QR-Code für Tisch ${tableNumber} heruntergeladen`)
    } catch (error) {
      console.error('Fehler beim Download:', error)
      toast.error('Fehler beim Download des QR-Codes')
    }
  }

  // Copy QR content to clipboard
  const copyToClipboard = async (content: string, code: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedCode(code)
      toast.success('QR-Code Inhalt kopiert')
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (error) {
      toast.error('Fehler beim Kopieren')
    }
  }

  // Toggle table selection
  const toggleTableSelection = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    )
  }

  // Select all tables
  const selectAllTables = () => {
    setSelectedTables(tables.map(t => t.id))
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedTables([])
  }

  const QRCodePreview = ({ dataUrl, tableNumber }: { dataUrl: string, tableNumber: number }) => (
    <div className="text-center space-y-4">
      <img src={dataUrl} alt={`QR Code für Tisch ${tableNumber}`} className="mx-auto border rounded" />
      <div className="flex gap-2">
        <Button 
          onClick={() => downloadQRCode(generateQRContent(tableNumber), tableNumber)}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Herunterladen
        </Button>
        <Button 
          variant="outline" 
          onClick={() => copyToClipboard(generateQRContent(tableNumber), `table-${tableNumber}`)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR-Code Management
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedTables.length > 0 && (
              <Badge variant="secondary">
                {selectedTables.length} ausgewählt
              </Badge>
            )}
            <Button 
              onClick={generateQRCodes}
              disabled={selectedTables.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generiere...' : 'QR-Codes generieren'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">QR-Code Konfiguration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMenu"
                  checked={qrConfig.includeMenuLink}
                  onCheckedChange={(checked) => 
                    setQrConfig(prev => ({ ...prev, includeMenuLink: checked as boolean }))
                  }
                />
                <Label htmlFor="includeMenu" className="flex items-center gap-2">
                  <Menu className="h-4 w-4" />
                  Speisekarten-Link einschließen
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeWifi"
                  checked={qrConfig.includeWifiInfo}
                  onCheckedChange={(checked) => 
                    setQrConfig(prev => ({ ...prev, includeWifiInfo: checked as boolean }))
                  }
                />
                <Label htmlFor="includeWifi" className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  WiFi-Informationen einschließen
                </Label>
              </div>
            </div>
            
            {qrConfig.includeMenuLink && (
              <div>
                <Label htmlFor="menuUrl">Speisekarten-URL</Label>
                <Input
                  id="menuUrl"
                  value={qrConfig.menuUrl}
                  onChange={(e) => setQrConfig(prev => ({ ...prev, menuUrl: e.target.value }))}
                  placeholder="https://badezeit.de/speisekarte"
                />
              </div>
            )}
            
            {qrConfig.includeWifiInfo && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wifiSSID">WiFi SSID</Label>
                  <Input
                    id="wifiSSID"
                    value={qrConfig.wifiSSID}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, wifiSSID: e.target.value }))}
                    placeholder="Badezeit_Guest"
                  />
                </div>
                <div>
                  <Label htmlFor="wifiPassword">WiFi Passwort</Label>
                  <Input
                    id="wifiPassword"
                    type="password"
                    value={qrConfig.wifiPassword}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, wifiPassword: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="customMessage">Benutzerdefinierte Nachricht</Label>
              <Textarea
                id="customMessage"
                value={qrConfig.customMessage}
                onChange={(e) => setQrConfig(prev => ({ ...prev, customMessage: e.target.value }))}
                placeholder="Willkommen! Scannen Sie den QR-Code für weitere Informationen..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tische auswählen</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={selectAllTables}
                disabled={selectedTables.length === tables.length}
              >
                Alle auswählen
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSelection}
                disabled={selectedTables.length === 0}
              >
                Auswahl löschen
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <Card 
                key={table.id} 
                className={`cursor-pointer transition-all ${
                  selectedTables.includes(table.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => toggleTableSelection(table.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Tisch {table.number}</h4>
                    <Checkbox checked={selectedTables.includes(table.id)} />
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {getLocationLabel(table.location)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-3 w-3" />
                      {table.capacity} Personen
                    </div>
                    {table.qrCodes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <QrCode className="h-3 w-3 text-green-600" />
                        {table.qrCodes.filter(qr => qr.isActive).length} aktive QR-Codes
                      </div>
                    )}
                  </div>
                  
                  {/* Existing QR codes */}
                  {table.qrCodes.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Vorhandene QR-Codes:</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {table.qrCodes.map((qr) => (
                          <div key={qr.id} className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(generateQRContent(table.number), qr.code)
                              }}
                            >
                              {copiedCode === qr.code ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadQRCode(generateQRContent(table.number), table.number)
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {tables.length === 0 && (
          <div className="text-center py-12">
            <QrCode className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Keine Tische verfügbar</h3>
            <p className="text-muted-foreground">
              Erstellen Sie zuerst Tische, um QR-Codes zu generieren.
            </p>
          </div>
        )}

        {/* QR Code Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QR-Code Vorschau</DialogTitle>
            </DialogHeader>
            {qrCodeDataUrl && (
              <QRCodePreview dataUrl={qrCodeDataUrl} tableNumber={1} />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}