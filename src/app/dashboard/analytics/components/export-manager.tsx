'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  CheckCircle,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface DailyData {
  date: string
  revenue: number
  reservations: number
  guests: number
}

interface ExportManagerProps {
  dailyData: DailyData[]
  reservationsData: any[]
  totalRevenue: number
  totalReservations: number
  totalGuests: number
  averagePerReservation: number
  revPASH: number
  period: string
}

interface ExportOptions {
  format: 'pdf' | 'excel'
  dateRange: 'today' | 'week' | 'month' | 'custom'
  includeCharts: boolean
  includeDetails: boolean
  includeSummary: boolean
  customStartDate?: string
  customEndDate?: string
}

export function ExportManager({
  dailyData = [],
  reservationsData = [],
  totalRevenue,
  totalReservations,
  totalGuests,
  averagePerReservation,
  revPASH,
  period
}: ExportManagerProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: 'week',
    includeCharts: true,
    includeDetails: true,
    includeSummary: true
  })

  const generatePDF = async () => {
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const jsPDFModule = await import('jspdf')
      // Import autoTable
      await import('jspdf-autotable')

      const doc = new jsPDFModule.default()
      const pageWidth = doc.internal.pageSize.width
      const margin = 20
      let yPosition = margin

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > doc.internal.pageSize.height - margin) {
          doc.addPage()
          yPosition = margin
        }
      }

      // Header
      doc.setFontSize(20)
      doc.setTextColor(51, 51, 51)
      doc.text('Badezeit Sylt - Analytics Report', margin, yPosition)
      yPosition += 15

      doc.setFontSize(12)
      doc.setTextColor(102, 102, 102)
      doc.text(`Generiert am: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}`, margin, yPosition)
      yPosition += 10
      
      doc.text(`Zeitraum: ${period === 'today' ? 'Heute' : 'Letzte 7 Tage'}`, margin, yPosition)
      yPosition += 20

      // Summary Section
      if (exportOptions.includeSummary) {
        checkNewPage(60)
        
        doc.setFontSize(16)
        doc.setTextColor(51, 51, 51)
        doc.text('Zusammenfassung', margin, yPosition)
        yPosition += 15

        const summaryData = [
          ['Kennzahl', 'Wert'],
          ['Gesamtumsatz', `${totalRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`],
          ['Reservierungen gesamt', totalReservations.toString()],
          ['Gäste gesamt', totalGuests.toString()],
          ['Durchschnitt pro Reservierung', `${averagePerReservation.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`],
          ['RevPASH', `${revPASH.toFixed(2)}€`],
        ]

        ;(doc as any).autoTable({
          head: [summaryData[0]],
          body: summaryData.slice(1),
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'right' }
          }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 20
      }

      // Daily Data Section
      if (exportOptions.includeDetails && dailyData.length > 0) {
        checkNewPage(80)
        
        doc.setFontSize(16)
        doc.setTextColor(51, 51, 51)
        doc.text('Tägliche Daten', margin, yPosition)
        yPosition += 15

        const tableData = dailyData.map(day => [
          format(new Date(day.date), 'dd.MM.yyyy', { locale: de }),
          `${day.revenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`,
          day.reservations.toString(),
          day.guests.toString(),
          `${(day.guests > 0 ? day.revenue / day.guests : 0).toFixed(2)}€`
        ])

        ;(doc as any).autoTable({
          head: [['Datum', 'Umsatz', 'Reservierungen', 'Gäste', 'Ø pro Gast']],
          body: tableData,
          startY: yPosition,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 9 },
          columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'right' }
          }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 20
      }

      // Performance Metrics
      checkNewPage(40)
      
      doc.setFontSize(16)
      doc.setTextColor(51, 51, 51)
      doc.text('Leistungskennzahlen', margin, yPosition)
      yPosition += 15

      const avgRevenue = dailyData.length > 0 ? 
        dailyData.reduce((sum, day) => sum + day.revenue, 0) / dailyData.length : 0
      const avgGuests = dailyData.length > 0 ? 
        dailyData.reduce((sum, day) => sum + day.guests, 0) / dailyData.length : 0

      const metricsData = [
        ['Kennzahl', 'Wert', 'Bewertung'],
        ['Durchschnittlicher Tagesumsatz', `${avgRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`, avgRevenue > 1000 ? 'Gut' : 'Verbesserungsbedarf'],
        ['Durchschnittliche Gäste/Tag', avgGuests.toFixed(1), avgGuests > 50 ? 'Gut' : 'Verbesserungsbedarf'],
        ['Auslastung pro Reservierung', `${(totalGuests / totalReservations || 0).toFixed(1)} Personen`, 'Normal'],
        ['Tischproduktivität (RevPASH)', `${revPASH.toFixed(2)}€`, revPASH > 15 ? 'Sehr gut' : revPASH > 10 ? 'Gut' : 'Verbesserungsbedarf']
      ]

      ;(doc as any).autoTable({
        head: [metricsData[0]],
        body: metricsData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' },
          2: { halign: 'center' }
        }
      })

      // Footer  
      const pageCount = (doc as any).internal.pages.length
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(
          `Seite ${i} von ${pageCount} - Badezeit Sylt Analytics`,
          pageWidth - margin,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        )
      }

      // Save the PDF
      const fileName = `badezeit-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      doc.save(fileName)
      
      return true
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }

  const generateExcel = async () => {
    try {
      // Dynamically import XLSX to avoid SSR issues
      const XLSX = await import('xlsx')
      
      // Create a new workbook
      const wb = XLSX.utils.book_new()

      // Summary Sheet
      if (exportOptions.includeSummary) {
        const summaryData = [
          ['Badezeit Sylt - Analytics Report'],
          [''],
          [`Generiert am: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}`],
          [`Zeitraum: ${period === 'today' ? 'Heute' : 'Letzte 7 Tage'}`],
          [''],
          ['ZUSAMMENFASSUNG'],
          ['Kennzahl', 'Wert'],
          ['Gesamtumsatz', totalRevenue],
          ['Reservierungen gesamt', totalReservations],
          ['Gäste gesamt', totalGuests],
          ['Durchschnitt pro Reservierung', averagePerReservation],
          ['RevPASH', revPASH],
        ]

        const ws_summary = XLSX.utils.aoa_to_sheet(summaryData)
        
        // Style the summary sheet
        ws_summary['!cols'] = [{ width: 25 }, { width: 15 }]
        
        XLSX.utils.book_append_sheet(wb, ws_summary, 'Zusammenfassung')
      }

      // Daily Data Sheet
      if (exportOptions.includeDetails && dailyData.length > 0) {
        const dailyHeaders = ['Datum', 'Umsatz (€)', 'Reservierungen', 'Gäste', 'Ø pro Gast (€)']
        const dailyRows = dailyData.map(day => [
          format(new Date(day.date), 'dd.MM.yyyy', { locale: de }),
          day.revenue,
          day.reservations,
          day.guests,
          day.guests > 0 ? (day.revenue / day.guests) : 0
        ])

        const ws_daily = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyRows])
        
        // Set column widths
        ws_daily['!cols'] = [
          { width: 12 },  // Datum
          { width: 12 },  // Umsatz
          { width: 15 },  // Reservierungen
          { width: 10 },  // Gäste
          { width: 15 }   // Ø pro Gast
        ]

        XLSX.utils.book_append_sheet(wb, ws_daily, 'Tägliche Daten')
      }

      // Performance Metrics Sheet
      const avgRevenue = dailyData.length > 0 ? 
        dailyData.reduce((sum, day) => sum + day.revenue, 0) / dailyData.length : 0
      const avgGuests = dailyData.length > 0 ? 
        dailyData.reduce((sum, day) => sum + day.guests, 0) / dailyData.length : 0

      const metricsData = [
        ['LEISTUNGSKENNZAHLEN'],
        [''],
        ['Kennzahl', 'Wert', 'Bewertung'],
        ['Durchschnittlicher Tagesumsatz', avgRevenue, avgRevenue > 1000 ? 'Gut' : 'Verbesserungsbedarf'],
        ['Durchschnittliche Gäste/Tag', avgGuests, avgGuests > 50 ? 'Gut' : 'Verbesserungsbedarf'],
        ['Auslastung pro Reservierung', totalGuests / totalReservations || 0, 'Normal'],
        ['Tischproduktivität (RevPASH)', revPASH, revPASH > 15 ? 'Sehr gut' : revPASH > 10 ? 'Gut' : 'Verbesserungsbedarf']
      ]

      const ws_metrics = XLSX.utils.aoa_to_sheet(metricsData)
      ws_metrics['!cols'] = [{ width: 30 }, { width: 20 }, { width: 20 }]
      
      XLSX.utils.book_append_sheet(wb, ws_metrics, 'Kennzahlen')

      // Save the Excel file
      const fileName = `badezeit-analytics-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      XLSX.writeFile(wb, fileName)
      
      return true
    } catch (error) {
      console.error('Error generating Excel:', error)
      throw error
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      if (exportOptions.format === 'pdf') {
        await generatePDF()
        toast.success('PDF-Report erfolgreich erstellt')
      } else {
        await generateExcel()
        toast.success('Excel-Report erfolgreich erstellt')
      }
    } catch (error) {
      toast.error('Fehler beim Erstellen des Reports')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getExportSize = () => {
    let size = 'Klein (~50KB)'
    if (exportOptions.includeCharts && exportOptions.includeDetails) {
      size = 'Groß (~200KB)'
    } else if (exportOptions.includeDetails) {
      size = 'Mittel (~100KB)'
    }
    return size
  }

  const getExportDuration = () => {
    if (exportOptions.format === 'pdf' && exportOptions.includeCharts) {
      return '5-10 Sekunden'
    }
    return '2-5 Sekunden'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Analytics Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="options" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="options">Optionen</TabsTrigger>
            <TabsTrigger value="preview">Vorschau</TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Export-Format</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={exportOptions.format === 'pdf' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setExportOptions(prev => ({ ...prev, format: 'pdf' }))}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF Report
                </Button>
                <Button
                  variant={exportOptions.format === 'excel' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setExportOptions(prev => ({ ...prev, format: 'excel' }))}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel Datei
                </Button>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Zeitraum</label>
              <Select 
                value={exportOptions.dateRange} 
                onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Heute</SelectItem>
                  <SelectItem value="week">Diese Woche</SelectItem>
                  <SelectItem value="month">Dieser Monat</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Inhalt</label>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeSummary"
                    checked={exportOptions.includeSummary}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeSummary: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="includeSummary" className="text-sm cursor-pointer">
                    Zusammenfassung der Kennzahlen
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeDetails"
                    checked={exportOptions.includeDetails}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeDetails: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="includeDetails" className="text-sm cursor-pointer">
                    Detaillierte Tageswerte
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeCharts"
                    checked={exportOptions.includeCharts}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="includeCharts" className="text-sm cursor-pointer">
                    Diagramme einbetten (nur PDF)
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Export-Vorschau</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium mb-1">Format</div>
                  <div className="flex items-center gap-2">
                    {exportOptions.format === 'pdf' ? (
                      <FileText className="h-4 w-4 text-red-600" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    )}
                    {exportOptions.format.toUpperCase()}
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium mb-1">Geschätzte Größe</div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    {getExportSize()}
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium mb-1">Geschätzte Zeit</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    {getExportDuration()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium">Enthaltene Inhalte:</h5>
                <div className="space-y-1">
                  {exportOptions.includeSummary && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Zusammenfassung und Kennzahlen
                    </div>
                  )}
                  {exportOptions.includeDetails && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Detaillierte Tageswerte ({dailyData.length} Tage)
                    </div>
                  )}
                  {exportOptions.includeCharts && exportOptions.format === 'pdf' && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Diagramme und Visualisierungen
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Button */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            onClick={handleExport}
            disabled={isExporting || (!exportOptions.includeSummary && !exportOptions.includeDetails)}
            className="min-w-32"
          >
            {isExporting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Erstelle...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export starten
              </div>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          <strong>Tipp:</strong> PDF-Reports eignen sich für Präsentationen und Ausdrucke. 
          Excel-Dateien ermöglichen weitere Datenanalyse und eigene Berechnungen.
        </div>
      </CardContent>
    </Card>
  )
}