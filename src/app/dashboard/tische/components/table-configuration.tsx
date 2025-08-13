'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Plus,
  Edit,
  Trash2,
  Settings,
  Users,
  MapPin,
  Square,
  Circle,
  RectangleHorizontal,
  Copy,
  Save
} from 'lucide-react'

interface TableConfigurationProps {
  tables: Array<{
    id: string
    number: number
    capacity: number
    location: string
    shape: string
    description?: string | null
    isActive: boolean
    reservations: any[]
    _count: { reservations: number }
  }>
  user: {
    role: string
  }
}

type TableFormData = {
  number: number
  capacity: number
  location: string
  shape: string
  description: string
  isActive: boolean
}

export function TableConfiguration({ tables: initialTables, user }: TableConfigurationProps) {
  const [tables, setTables] = useState(initialTables)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const [formData, setFormData] = useState<TableFormData>({
    number: 1,
    capacity: 4,
    location: 'INDOOR_STANDARD',
    shape: 'RECTANGLE',
    description: '',
    isActive: true
  })

  const locationOptions = [
    { value: 'TERRACE_SEA_VIEW', label: 'Terrasse Meerblick' },
    { value: 'TERRACE_STANDARD', label: 'Terrasse Standard' },
    { value: 'INDOOR_WINDOW', label: 'Innen Fenster' },
    { value: 'INDOOR_STANDARD', label: 'Innen Standard' },
    { value: 'BAR_AREA', label: 'Barbereich' }
  ]

  const shapeOptions = [
    { value: 'RECTANGLE', label: 'Rechteckig', icon: <RectangleHorizontal className="h-4 w-4" /> },
    { value: 'ROUND', label: 'Rund', icon: <Circle className="h-4 w-4" /> },
    { value: 'SQUARE', label: 'Quadratisch', icon: <Square className="h-4 w-4" /> }
  ]

  const getLocationLabel = (location: string) => {
    return locationOptions.find(opt => opt.value === location)?.label || location
  }

  const getShapeLabel = (shape: string) => {
    return shapeOptions.find(opt => opt.value === shape)?.label || shape
  }

  const getShapeIcon = (shape: string) => {
    return shapeOptions.find(opt => opt.value === shape)?.icon
  }

  // Get next available table number
  const getNextTableNumber = () => {
    const existingNumbers = tables.map(t => t.number).sort((a, b) => a - b)
    for (let i = 1; i <= existingNumbers.length + 1; i++) {
      if (!existingNumbers.includes(i)) {
        return i
      }
    }
    return existingNumbers.length + 1
  }

  const validateForm = (data: TableFormData): string | null => {
    if (data.number < 1 || data.number > 999) {
      return 'Tischnummer muss zwischen 1 und 999 liegen'
    }
    if (data.capacity < 1 || data.capacity > 20) {
      return 'Kapazität muss zwischen 1 und 20 Personen liegen'
    }
    
    // Check for duplicate table number (when creating or editing different table)
    const existingTable = tables.find(t => t.number === data.number && t.id !== selectedTable?.id)
    if (existingTable) {
      return `Tisch ${data.number} existiert bereits`
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const error = validateForm(formData)
    if (error) {
      toast.error(error)
      return
    }

    setIsSubmitting(true)
    try {
      const isEdit = selectedTable !== null
      const url = isEdit ? `/api/tables/${selectedTable.id}` : '/api/tables'
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      const savedTable = await response.json()
      
      if (isEdit) {
        setTables(prev => prev.map(table => 
          table.id === selectedTable.id 
            ? { ...table, ...formData }
            : table
        ))
        toast.success(`Tisch ${formData.number} erfolgreich aktualisiert`)
      } else {
        setTables(prev => [...prev, savedTable])
        toast.success(`Tisch ${formData.number} erfolgreich erstellt`)
      }
      
      resetForm()
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (table: any) => {
    setSelectedTable(table)
    setFormData({
      number: table.number,
      capacity: table.capacity,
      location: table.location,
      shape: table.shape,
      description: table.description || '',
      isActive: table.isActive
    })
    setShowCreateForm(true)
  }

  const handleDuplicate = (table: any) => {
    setSelectedTable(null)
    setFormData({
      number: getNextTableNumber(),
      capacity: table.capacity,
      location: table.location,
      shape: table.shape,
      description: table.description || '',
      isActive: true
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (tableId: string) => {
    if (user.role !== 'ADMIN') {
      toast.error('Nur Administratoren können Tische löschen')
      return
    }

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Fehler beim Löschen')
      }

      setTables(prev => prev.filter(table => table.id !== tableId))
      toast.success('Tisch erfolgreich gelöscht')
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen')
    }
  }

  const resetForm = () => {
    setSelectedTable(null)
    setShowCreateForm(false)
    setFormData({
      number: getNextTableNumber(),
      capacity: 4,
      location: 'INDOOR_STANDARD',
      shape: 'RECTANGLE',
      description: '',
      isActive: true
    })
  }

  const TableForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="number">Tischnummer *</Label>
          <Input
            id="number"
            type="number"
            min="1"
            max="999"
            value={formData.number}
            onChange={(e) => setFormData(prev => ({ ...prev, number: parseInt(e.target.value) || 1 }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="capacity">Kapazität *</Label>
          <div className="relative">
            <Input
              id="capacity"
              type="number"
              min="1"
              max="20"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
              required
            />
            <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Standort *</Label>
          <Select 
            value={formData.location} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="shape">Form *</Label>
          <Select 
            value={formData.shape} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, shape: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shapeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Beschreibung (optional)</Label>
        <Textarea
          id="description"
          placeholder="Besondere Merkmale, Notizen..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
        <Label htmlFor="isActive">Tisch aktiv</Label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Speichern...' : selectedTable ? 'Aktualisieren' : 'Erstellen'}
        </Button>
        <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
          Abbrechen
        </Button>
      </div>
    </form>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tischkonfiguration
          </CardTitle>
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Tisch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedTable ? `Tisch ${selectedTable.number} bearbeiten` : 'Neuen Tisch erstellen'}
                  </DialogTitle>
                </DialogHeader>
                <TableForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <Card key={table.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Tisch {table.number}</h3>
                  <Badge variant={table.isActive ? 'default' : 'secondary'}>
                    {table.isActive ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Kapazität:</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {table.capacity} Personen
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Standort:</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {getLocationLabel(table.location)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Form:</span>
                    <span className="flex items-center gap-1">
                      {getShapeIcon(table.shape)}
                      {getShapeLabel(table.shape)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reservierungen:</span>
                    <span>{table._count.reservations}</span>
                  </div>
                  
                  {table.description && (
                    <div className="mt-3 p-2 bg-muted rounded text-xs">
                      <p className="font-medium">Beschreibung:</p>
                      <p className="text-muted-foreground">{table.description}</p>
                    </div>
                  )}
                </div>
                
                {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(table)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Bearbeiten
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(table)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    
                    {user.role === 'ADMIN' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tisch löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sind Sie sicher, dass Sie Tisch {table.number} löschen möchten? 
                              {table._count.reservations > 0 && (
                                <span className="text-destructive font-medium">
                                  {' '}Dieser Tisch hat {table._count.reservations} Reservierungen und kann möglicherweise nicht gelöscht werden.
                                </span>
                              )}
                              {' '}Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(table.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {tables.length === 0 && (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Keine Tische konfiguriert</h3>
            <p className="text-muted-foreground mb-4">
              Erstellen Sie Ihren ersten Tisch, um zu beginnen.
            </p>
            {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Tisch erstellen
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}