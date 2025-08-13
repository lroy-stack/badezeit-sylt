'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CheckCircle,
  AlertCircle, 
  Clock,
  XCircle,
  Settings,
  RefreshCw,
  Users,
  MapPin,
  Calendar
} from 'lucide-react'

interface TableStatusPanelProps {
  tables: Array<{
    id: string
    number: number
    capacity: number
    location: string
    shape: string
    currentStatus: string
    currentReservation?: any
    reservations: any[]
    isActive: boolean
  }>
}

type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_ORDER'

export function TableStatusPanel({ tables: initialTables }: TableStatusPanelProps) {
  const [tables, setTables] = useState(initialTables)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [locationFilter, setLocationFilter] = useState<string>('ALL')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/tables/status')
        if (response.ok) {
          const statusData = await response.json()
          
          // Update table status
          setTables(prev => prev.map(table => {
            const updated = statusData.find((s: any) => s.id === table.id)
            return updated ? { ...table, currentStatus: updated.currentStatus, nextReservation: updated.nextReservation } : table
          }))
        }
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Status:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const updateTableStatus = async (tableId: string, status: TableStatus, notes?: string, estimatedFreeTime?: Date) => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/tables/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          status,
          notes,
          estimatedFreeTime
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Fehler beim Aktualisieren des Status')
      }

      const updatedTable = await response.json()
      
      // Update local state
      setTables(prev => prev.map(table => 
        table.id === tableId 
          ? { ...table, currentStatus: status, isActive: status !== 'OUT_OF_ORDER' }
          : table
      ))

      toast.success(`Tisch ${tables.find(t => t.id === tableId)?.number} Status aktualisiert`)
      setSelectedTable(null)
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Status')
    } finally {
      setIsUpdating(false)
    }
  }

  const bulkUpdateStatus = async (tableIds: string[], status: TableStatus) => {
    setIsUpdating(true)
    try {
      const updates = tableIds.map(id => ({ tableId: id, status }))
      
      const response = await fetch('/api/tables/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Fehler beim Bulk-Update')
      }

      const result = await response.json()
      
      // Update local state
      setTables(prev => prev.map(table => 
        tableIds.includes(table.id)
          ? { ...table, currentStatus: status, isActive: status !== 'OUT_OF_ORDER' }
          : table
      ))

      toast.success(`${tableIds.length} Tische erfolgreich aktualisiert`)
    } catch (error) {
      console.error('Fehler beim Bulk-Update:', error)
      toast.error('Fehler beim Bulk-Update der Tische')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'OCCUPIED':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'RESERVED':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'MAINTENANCE':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'OUT_OF_ORDER':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-4 w-4" />
      case 'OCCUPIED':
        return <AlertCircle className="h-4 w-4" />
      case 'RESERVED':
        return <Clock className="h-4 w-4" />
      case 'MAINTENANCE':
        return <Settings className="h-4 w-4" />
      case 'OUT_OF_ORDER':
        return <XCircle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Verfügbar'
      case 'OCCUPIED':
        return 'Besetzt'
      case 'RESERVED':
        return 'Reserviert'
      case 'MAINTENANCE':
        return 'Wartung'
      case 'OUT_OF_ORDER':
        return 'Außer Betrieb'
      default:
        return status
    }
  }

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

  // Filter tables
  const filteredTables = tables.filter(table => {
    const statusMatch = statusFilter === 'ALL' || table.currentStatus === statusFilter
    const locationMatch = locationFilter === 'ALL' || table.location === locationFilter
    return statusMatch && locationMatch
  })

  const StatusUpdateDialog = ({ table }: { table: any }) => {
    const [newStatus, setNewStatus] = useState<TableStatus>(table.currentStatus)
    const [notes, setNotes] = useState('')
    const [estimatedFreeTime, setEstimatedFreeTime] = useState('')

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Status aktualisieren - Tisch {table.number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Neuer Status</Label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as TableStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Verfügbar
                  </div>
                </SelectItem>
                <SelectItem value="OCCUPIED">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Besetzt
                  </div>
                </SelectItem>
                <SelectItem value="RESERVED">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    Reserviert
                  </div>
                </SelectItem>
                <SelectItem value="MAINTENANCE">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    Wartung
                  </div>
                </SelectItem>
                <SelectItem value="OUT_OF_ORDER">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-gray-600" />
                    Außer Betrieb
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(newStatus === 'MAINTENANCE' || newStatus === 'OUT_OF_ORDER') && (
            <>
              <div>
                <Label htmlFor="notes">Notizen (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Grund für Status-Änderung..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              {newStatus === 'MAINTENANCE' && (
                <div>
                  <Label htmlFor="freeTime">Voraussichtlich frei (optional)</Label>
                  <Input
                    id="freeTime"
                    type="datetime-local"
                    value={estimatedFreeTime}
                    onChange={(e) => setEstimatedFreeTime(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={() => updateTableStatus(
                table.id, 
                newStatus, 
                notes || undefined,
                estimatedFreeTime ? new Date(estimatedFreeTime) : undefined
              )}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Aktualisieren...' : 'Status aktualisieren'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedTable(null)}
              disabled={isUpdating}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            Tischstatus Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto-Refresh AN' : 'Auto-Refresh AUS'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Status Filter</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle Status</SelectItem>
                <SelectItem value="AVAILABLE">Verfügbar</SelectItem>
                <SelectItem value="OCCUPIED">Besetzt</SelectItem>
                <SelectItem value="RESERVED">Reserviert</SelectItem>
                <SelectItem value="MAINTENANCE">Wartung</SelectItem>
                <SelectItem value="OUT_OF_ORDER">Außer Betrieb</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Standort Filter</Label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle Standorte</SelectItem>
                <SelectItem value="TERRACE_SEA_VIEW">Terrasse Meerblick</SelectItem>
                <SelectItem value="TERRACE_STANDARD">Terrasse Standard</SelectItem>
                <SelectItem value="INDOOR_WINDOW">Innen Fenster</SelectItem>
                <SelectItem value="INDOOR_STANDARD">Innen Standard</SelectItem>
                <SelectItem value="BAR_AREA">Barbereich</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table) => (
            <Card key={table.id} className={`border-2 ${getStatusColor(table.currentStatus)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Tisch {table.number}</h3>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {table.capacity}
                    </Badge>
                  </div>
                  <Badge className="flex items-center gap-1">
                    {getStatusIcon(table.currentStatus)}
                    {getStatusLabel(table.currentStatus)}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{getLocationLabel(table.location)}</span>
                  </div>
                  
                  {table.currentReservation && (
                    <div className="flex items-center gap-2 p-2 bg-background rounded">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">
                        {table.currentReservation.customer.firstName} {table.currentReservation.customer.lastName} • {' '}
                        {table.currentReservation.partySize} Personen
                      </span>
                    </div>
                  )}
                  
                  {table.reservations.length > 0 && !table.currentReservation && (
                    <div className="text-xs text-muted-foreground">
                      Nächste Reservierung: {new Date(table.reservations[0].dateTime).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={() => setSelectedTable(table)}
                    >
                      Status ändern
                    </Button>
                  </DialogTrigger>
                  {selectedTable?.id === table.id && (
                    <StatusUpdateDialog table={table} />
                  )}
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredTables.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Keine Tische gefunden</h3>
            <p className="text-muted-foreground">
              Keine Tische entsprechen den ausgewählten Filterkriterien.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}