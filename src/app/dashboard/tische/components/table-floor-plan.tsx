'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Save, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Grid3X3,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Settings
} from 'lucide-react'

// Dynamically import react-grid-layout components to avoid SSR issues
const ResponsiveGridLayout = dynamic(
  () => import('react-grid-layout').then(mod => mod.WidthProvider(mod.Responsive)),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-muted animate-pulse rounded" />
  }
)

interface TableFloorPlanProps {
  tables: Array<{
    id: string
    number: number
    capacity: number
    location: string
    shape: string
    xPosition?: number | null
    yPosition?: number | null
    currentStatus: string
    currentReservation?: any
    isActive: boolean
  }>
}

export function TableFloorPlan({ tables }: TableFloorPlanProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL')
  const [isDragging, setIsDragging] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [zoom, setZoom] = useState(100)
  

  // Filter tables by location
  const filteredTables = useMemo(() => {
    return selectedLocation === 'ALL' 
      ? tables 
      : tables.filter(table => table.location === selectedLocation)
  }, [tables, selectedLocation])

  // Generate layout data for react-grid-layout
  const generateLayout = useCallback(() => {
    return filteredTables.map((table, index) => ({
      i: table.id,
      x: table.xPosition ? Math.round(table.xPosition / 100) : (index % 6), // Default grid position
      y: table.yPosition ? Math.round(table.yPosition / 100) : Math.floor(index / 6),
      w: getTableWidth(table.shape, table.capacity),
      h: getTableHeight(table.shape, table.capacity),
      minW: 1,
      maxW: 4,
      minH: 1,
      maxH: 3,
      isDraggable: table.isActive,
      isResizable: false,
      static: !table.isActive || table.currentStatus === 'OCCUPIED'
    }))
  }, [filteredTables])

  const [layout, setLayout] = useState(() => generateLayout())

  // Update layout when filtered tables change
  useEffect(() => {
    setLayout(generateLayout())
  }, [generateLayout])

  // Handle layout changes from drag operations
  const handleLayoutChange = useCallback((newLayout: any) => {
    setLayout(newLayout)
    setHasChanges(true)
  }, [])

  // Save layout changes to the API
  const saveLayout = async () => {
    if (!hasChanges) return

    setIsSaving(true)
    try {
      const updates = layout.map(item => ({
        id: item.i,
        xPosition: item.x * 100, // Convert back to 0-1000 scale
        yPosition: item.y * 100,
        shape: filteredTables.find(t => t.id === item.i)?.shape || 'RECTANGLE'
      }))

      const response = await fetch('/api/tables/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables: updates })
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Layouts')
      }

      const result = await response.json()
      
      if (result.warnings?.collisions?.length > 0) {
        toast.warning('Layout gespeichert', {
          description: `${result.warnings.collisions.length} Kollisionen zwischen Tischen erkannt.`
        })
      } else {
        toast.success('Layout erfolgreich gespeichert')
      }
      
      setHasChanges(false)
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      toast.error('Layout konnte nicht gespeichert werden')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset layout to original positions
  const resetLayout = () => {
    setLayout(generateLayout())
    setHasChanges(false)
    toast.info('Layout zurückgesetzt')
  }

  const locationOptions = [
    { value: 'ALL', label: 'Alle Bereiche' },
    { value: 'TERRACE_SEA_VIEW', label: 'Terrasse Meerblick' },
    { value: 'TERRACE_STANDARD', label: 'Terrasse Standard' },
    { value: 'INDOOR_WINDOW', label: 'Innen Fenster' },
    { value: 'INDOOR_STANDARD', label: 'Innen Standard' },
    { value: 'BAR_AREA', label: 'Barbereich' }
  ]

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 border-green-300 hover:bg-green-200'
      case 'OCCUPIED':
        return 'bg-red-100 border-red-300 hover:bg-red-200'
      case 'RESERVED':
        return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
      case 'MAINTENANCE':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200'
      case 'OUT_OF_ORDER':
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200'
      default:
        return 'bg-white border-gray-300 hover:bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'OCCUPIED':
        return <AlertCircle className="h-3 w-3 text-red-600" />
      case 'RESERVED':
        return <Clock className="h-3 w-3 text-yellow-600" />
      case 'MAINTENANCE':
        return <Settings className="h-3 w-3 text-blue-600" />
      case 'OUT_OF_ORDER':
        return <XCircle className="h-3 w-3 text-gray-600" />
      default:
        return <CheckCircle className="h-3 w-3 text-green-600" />
    }
  }

  const getTableShape = (shape: string): string => {
    switch (shape) {
      case 'ROUND':
        return 'rounded-full'
      case 'SQUARE':
        return 'rounded-lg'
      default:
        return 'rounded-md'
    }
  }

  // Table component for grid items
  const TableItem = ({ table }: { table: any }) => (
    <div
      className={`
        p-2 border-2 cursor-move transition-all duration-200
        ${getStatusColor(table.currentStatus)}
        ${getTableShape(table.shape)}
        ${isDragging ? 'shadow-lg scale-105' : 'shadow-sm'}
        ${!table.isActive ? 'opacity-60' : ''}
        flex flex-col items-center justify-center text-center
        min-h-[60px]
      `}
      style={{ 
        fontSize: `${Math.max(10, zoom / 10)}px`,
        transform: `scale(${zoom / 100})`
      }}
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        {getStatusIcon(table.currentStatus)}
        <span className="font-semibold text-xs">#{table.number}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        {table.capacity}P
      </div>
      {table.currentReservation && (
        <div className="text-xs text-muted-foreground truncate w-full">
          {table.currentReservation.customer.firstName}
        </div>
      )}
    </div>
  )


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Tischgrundriß
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1 border rounded-md">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs px-2">{zoom}%</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                disabled={zoom >= 150}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {hasChanges && (
              <>
                <Button variant="outline" size="sm" onClick={resetLayout}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Zurücksetzen
                </Button>
                <Button size="sm" onClick={saveLayout} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasChanges && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Ungespeicherte Änderungen am Layout. Klicken Sie auf "Speichern", um die Änderungen zu übernehmen.
            </p>
          </div>
        )}

        <div className="border rounded-lg bg-gray-50 p-4 min-h-[500px]" style={{ height: '600px', overflow: 'auto' }}>
          {filteredTables.length > 0 ? (
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: layout }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={60}
              margin={[10, 10]}
              onLayoutChange={handleLayoutChange}
              onDragStart={() => setIsDragging(true)}
              onDragStop={() => setIsDragging(false)}
              isDraggable={true}
              isResizable={false}
              preventCollision={false}
              compactType="vertical"
              useCSSTransforms={true}
            >
              {filteredTables.map((table) => (
                <div key={table.id}>
                  <TableItem table={table} />
                </div>
              ))}
            </ResponsiveGridLayout>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Grid3X3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Keine Tische im gewählten Bereich</h3>
                <p className="text-muted-foreground">
                  Wählen Sie einen anderen Bereich oder erstellen Sie neue Tische.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">Legende</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-green-300 border rounded"></div>
              <span>Verfügbar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-red-300 border rounded"></div>
              <span>Besetzt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border-yellow-300 border rounded"></div>
              <span>Reserviert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-blue-300 border rounded"></div>
              <span>Wartung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border-gray-300 border rounded"></div>
              <span>Außer Betrieb</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions for table sizing
function getTableWidth(shape: string, capacity: number): number {
  if (capacity <= 2) return 1
  if (capacity <= 4) return 2
  if (capacity <= 6) return 3
  return 4
}

function getTableHeight(shape: string, capacity: number): number {
  if (shape === 'ROUND') {
    if (capacity <= 4) return 2
    if (capacity <= 8) return 3
    return 4
  }
  
  if (shape === 'SQUARE') {
    if (capacity <= 4) return 2
    return 3
  }
  
  // RECTANGLE
  if (capacity <= 2) return 1
  if (capacity <= 6) return 2
  return 3
}