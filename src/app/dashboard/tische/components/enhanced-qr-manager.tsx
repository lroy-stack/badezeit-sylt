'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'
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
  Trash2,
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  FileText,
  Palette,
  Settings,
  Activity,
  Zap,
  Upload,
  Users
} from 'lucide-react'
import QRCodeLib from 'qrcode'
import jsPDF from 'jspdf'

// Enhanced interfaces for analytics
interface QRCodeWithAnalytics {
  id: string
  code: string
  isActive: boolean
  createdAt: string | Date
  menuLink?: string
  wifiInfo?: string
  customMessage?: string
  scans?: number
  lastScanned?: Date
  uniqueVisitors?: number
  conversionRate?: number
  template?: 'default' | 'premium' | 'branded'
}

interface QRAnalytics {
  totalScans: number
  totalCodes: number
  avgScansPerCode: number
  topPerformingTable: number
  conversionRate: number
  weeklyTrend: Array<{ day: string; scans: number; conversions: number }>
  tablePerformance: Array<{ tableNumber: number; scans: number; conversionRate: number }>
}

interface EnhancedQRCodeManagerProps {
  tables: Array<{
    id: string
    number: number
    capacity: number
    location: string
    qrCodes: QRCodeWithAnalytics[]
  }>
}

const qrTemplates = {
  default: {
    name: 'Standard',
    description: 'Einfaches QR-Design',
    colors: { background: '#FFFFFF', foreground: '#000000' },
    logo: false
  },
  premium: {
    name: 'Premium',
    description: 'Elegantes Design mit Ocean-Farben',
    colors: { background: '#F0F9FF', foreground: '#0F172A' },
    logo: false
  },
  branded: {
    name: 'Branded',
    description: 'Mit Badezeit-Logo und Branding',
    colors: { background: '#FFFFFF', foreground: '#1E40AF' },
    logo: true
  }
}

// Chart configurations
const analyticsChartConfig = {
  scans: {
    label: 'Scans',
    color: 'hsl(var(--chart-1))'
  },
  conversions: {
    label: 'Bestellungen',
    color: 'hsl(var(--chart-2))'
  },
  visitors: {
    label: 'Besucher',
    color: 'hsl(var(--chart-3))'
  }
} satisfies ChartConfig

export function EnhancedQRManager({ tables: initialTables }: EnhancedQRCodeManagerProps) {
  const [tables, setTables] = useState(initialTables)
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string>('')
  const [activeTab, setActiveTab] = useState('management')
  
  const [qrConfig, setQrConfig] = useState({
    includeMenuLink: true,
    includeWifiInfo: false,
    customMessage: '',
    wifiSSID: 'Badezeit_Guest',
    wifiPassword: '',
    menuUrl: 'https://badezeit.de/speisekarte',
    template: 'default' as keyof typeof qrTemplates,
    branding: true,
    callToAction: 'Speisekarte ansehen'
  })

  // Generate mock analytics data (in production, this would come from API)
  const mockAnalytics: QRAnalytics = useMemo(() => {
    const totalCodes = tables.reduce((sum, table) => sum + table.qrCodes.length, 0)
    const totalScans = tables.reduce((sum, table) => 
      sum + table.qrCodes.reduce((codeSum, qr) => codeSum + (qr.scans || Math.floor(Math.random() * 100)), 0), 0
    )

    return {
      totalScans,
      totalCodes,
      avgScansPerCode: totalCodes > 0 ? Math.round(totalScans / totalCodes) : 0,
      topPerformingTable: Math.floor(Math.random() * 20) + 1,
      conversionRate: 78,
      weeklyTrend: Array.from({ length: 7 }, (_, i) => ({
        day: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][i],
        scans: Math.floor(Math.random() * 200) + 50,
        conversions: Math.floor(Math.random() * 80) + 20
      })),
      tablePerformance: tables.slice(0, 10).map(table => ({
        tableNumber: table.number,
        scans: Math.floor(Math.random() * 150) + 30,
        conversionRate: Math.floor(Math.random() * 40) + 60
      }))
    }
  }, [tables])

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

  // Enhanced QR code content generation with templates
  const generateEnhancedQRContent = (tableNumber: number, template: keyof typeof qrTemplates = 'default') => {
    const baseUrl = qrConfig.menuUrl + `?table=${tableNumber}&utm_source=qr&utm_medium=table&utm_campaign=restaurant`
    
    if (template === 'branded') {
      return {
        url: baseUrl,
        data: {
          restaurant: 'Badezeit Sylt',
          table: tableNumber,
          action: qrConfig.callToAction,
          wifi: qrConfig.includeWifiInfo ? {
            ssid: qrConfig.wifiSSID,
            password: qrConfig.wifiPassword
          } : null,
          message: qrConfig.customMessage
        }
      }
    }

    // Simple URL for standard templates
    return baseUrl
  }

  // Advanced QR code generation with custom styling
  const generateStyledQRCode = async (content: string, template: keyof typeof qrTemplates, tableNumber: number) => {
    const templateConfig = qrTemplates[template]
    
    const options = {
      width: 400,
      margin: 3,
      color: {
        dark: templateConfig.colors.foreground,
        light: templateConfig.colors.background
      },
      errorCorrectionLevel: 'H' as const
    }

    try {
      const qrDataUrl = await QRCodeLib.toDataURL(content, options)
      
      if (template === 'branded') {
        // Add branding overlay (simplified implementation)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          canvas.width = 400
          canvas.height = 450 // Extra space for branding
          
          // Draw QR code
          const img = new Image()
          img.src = qrDataUrl
          
          return new Promise<string>((resolve) => {
            img.onload = () => {
              ctx.fillStyle = templateConfig.colors.background
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              
              ctx.drawImage(img, 0, 25)
              
              // Add branding text
              ctx.fillStyle = templateConfig.colors.foreground
              ctx.font = 'bold 18px Arial'
              ctx.textAlign = 'center'
              ctx.fillText('🍽️ Badezeit Sylt', canvas.width / 2, 20)
              
              ctx.font = '14px Arial'
              ctx.fillText(`Tisch ${tableNumber}`, canvas.width / 2, canvas.height - 20)
              ctx.fillText(qrConfig.callToAction, canvas.width / 2, canvas.height - 5)
              
              resolve(canvas.toDataURL())
            }
          })
        }
      }
      
      return qrDataUrl
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw error
    }
  }

  // Batch QR code generation with progress tracking
  const generateBatchQRCodes = async () => {
    if (selectedTables.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Tisch aus')
      return
    }

    setIsGenerating(true)
    setBatchProgress(0)

    try {
      const results = []
      
      for (let i = 0; i < selectedTables.length; i++) {
        const tableId = selectedTables[i]
        const table = tables.find(t => t.id === tableId)
        
        if (!table) continue

        const content = typeof generateEnhancedQRContent(table.number, qrConfig.template) === 'string' 
          ? generateEnhancedQRContent(table.number, qrConfig.template) as string
          : (generateEnhancedQRContent(table.number, qrConfig.template) as any).url

        const qrDataUrl = await generateStyledQRCode(content, qrConfig.template, table.number)
        
        results.push({
          tableId,
          tableNumber: table.number,
          dataUrl: qrDataUrl,
          content
        })

        // Update progress
        setBatchProgress(Math.round(((i + 1) / selectedTables.length) * 100))
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Save to API (mock implementation)
      setTimeout(() => {
        toast.success(`${results.length} QR-Codes erfolgreich generiert`)
        setSelectedTables([])
        setBatchProgress(0)
        setIsGenerating(false)
      }, 500)

    } catch (error) {
      console.error('Error in batch generation:', error)
      toast.error('Fehler bei der Stapelverarbeitung')
      setIsGenerating(false)
      setBatchProgress(0)
    }
  }

  // Export QR codes as PDF
  const exportQRCodesPDF = async () => {
    if (selectedTables.length === 0) {
      toast.error('Bitte wählen Sie Tische für den Export aus')
      return
    }

    try {
      const pdf = new jsPDF()
      let yPosition = 20

      pdf.setFontSize(20)
      pdf.text('Badezeit Sylt - QR-Codes', 20, yPosition)
      yPosition += 20

      for (const tableId of selectedTables.slice(0, 10)) { // Limit to 10 for demo
        const table = tables.find(t => t.id === tableId)
        if (!table) continue

        const content = typeof generateEnhancedQRContent(table.number, qrConfig.template) === 'string' 
          ? generateEnhancedQRContent(table.number, qrConfig.template) as string
          : (generateEnhancedQRContent(table.number, qrConfig.template) as any).url

        const qrDataUrl = await generateStyledQRCode(content, qrConfig.template, table.number)
        
        // Add QR code to PDF
        pdf.addImage(qrDataUrl, 'PNG', 20, yPosition, 50, 50)
        
        pdf.setFontSize(14)
        pdf.text(`Tisch ${table.number}`, 80, yPosition + 20)
        pdf.text(`${getLocationLabel(table.location)}`, 80, yPosition + 35)
        pdf.text(`Kapazität: ${table.capacity} Personen`, 80, yPosition + 50)
        
        yPosition += 70
        
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }
      }

      pdf.save(`badezeit-qr-codes-${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('QR-Codes als PDF exportiert')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Fehler beim PDF-Export')
    }
  }

  // Copy QR content to clipboard
  const copyToClipboard = async (content: string, tableNumber: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedCode(`table-${tableNumber}`)
      toast.success('QR-Code URL kopiert')
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

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="management">QR-Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4">
          {/* Control Panel */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedTables.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <QrCode className="h-3 w-3" />
                  {selectedTables.length} ausgewählt
                </Badge>
              )}
              
              {isGenerating && (
                <div className="flex items-center gap-2">
                  <Progress value={batchProgress} className="w-32" />
                  <span className="text-sm text-muted-foreground">{batchProgress}%</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={exportQRCodesPDF}
                disabled={selectedTables.length === 0 || isGenerating}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF Export
              </Button>
              
              <Button 
                onClick={generateBatchQRCodes}
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

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Konfiguration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template">Vorlage</Label>
                  <Select 
                    value={qrConfig.template} 
                    onValueChange={(value: keyof typeof qrTemplates) => 
                      setQrConfig(prev => ({ ...prev, template: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(qrTemplates).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Palette className="h-3 w-3" />
                            {template.name} - {template.description}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="callToAction">Call-to-Action</Label>
                  <Input
                    id="callToAction"
                    value={qrConfig.callToAction}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, callToAction: e.target.value }))}
                    placeholder="Speisekarte ansehen"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="branding"
                  checked={qrConfig.branding}
                  onCheckedChange={(checked) => 
                    setQrConfig(prev => ({ ...prev, branding: checked as boolean }))
                  }
                />
                <Label htmlFor="branding" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Restaurant-Branding einschließen
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Tables Grid */}
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
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedTables.includes(table.id)} />
                      {table.qrCodes.length > 0 && (
                        <Badge variant="outline">
                          {table.qrCodes.filter(qr => qr.isActive).length} QR aktiv
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {getLocationLabel(table.location)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {table.capacity} Personen
                    </div>
                    {table.qrCodes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        {table.qrCodes.reduce((sum, qr) => sum + (qr.scans || 0), 0)} Scans
                      </div>
                    )}
                  </div>
                  
                  {/* QR Code Actions */}
                  {table.qrCodes.length > 0 && (
                    <div className="mt-3 pt-3 border-t flex gap-1">
                      {table.qrCodes.map((qr) => (
                        <div key={qr.id} className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(qr.menuLink || '', table.number)
                            }}
                          >
                            {copiedCode === `table-${table.number}` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Download individual QR code
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gesamt-Scans</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{mockAnalytics.totalScans.toLocaleString()}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span>+12.5% diese Woche</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive QR-Codes</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalytics.totalCodes}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{mockAnalytics.avgScansPerCode} ⌀ Scans pro Code</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockAnalytics.conversionRate}%</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>QR-Scan zu Bestellung</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Tisch</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#{mockAnalytics.topPerformingTable}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Meiste QR-Scans</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Wöchentlicher Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={analyticsChartConfig} className="h-[300px] w-full">
                  <LineChart data={mockAnalytics.weeklyTrend} accessibilityLayer>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="scans"
                      stroke="var(--color-scans)"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversions"
                      stroke="var(--color-conversions)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tisch-Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={analyticsChartConfig} className="h-[300px] w-full">
                  <BarChart data={mockAnalytics.tablePerformance} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                      dataKey="tableNumber"
                      tickFormatter={(value) => `#${value}`}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="scans" fill="var(--color-scans)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(qrTemplates).map(([key, template]) => (
              <Card 
                key={key} 
                className={`cursor-pointer transition-all ${
                  qrConfig.template === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setQrConfig(prev => ({ ...prev, template: key as keyof typeof qrTemplates }))}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: template.colors.background, borderColor: template.colors.foreground }}
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: template.colors.foreground }}
                      />
                      <span className="text-xs text-muted-foreground">Farbschema</span>
                    </div>
                    
                    {template.logo && (
                      <Badge variant="secondary">Mit Logo</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}