'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, 
  X, 
  Search,
  MapPin,
  Users,
  Square,
  Circle,
  RectangleHorizontal
} from 'lucide-react'

interface TableFiltersProps {
  currentFilters: {
    location?: string
    status?: string
    capacity?: string
    shape?: string
    view?: string
  }
}

export function TableFilters({ currentFilters }: TableFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [filters, setFilters] = useState({
    location: currentFilters.location || 'ALL',
    status: currentFilters.status || 'ALL',
    capacity: currentFilters.capacity || 'ALL',
    shape: currentFilters.shape || 'ALL',
    search: searchParams.get('search') || ''
  })

  const locationOptions = [
    { value: 'ALL', label: 'Alle Standorte' },
    { value: 'TERRACE_SEA_VIEW', label: 'Terrasse Meerblick' },
    { value: 'TERRACE_STANDARD', label: 'Terrasse Standard' },
    { value: 'INDOOR_WINDOW', label: 'Innen Fenster' },
    { value: 'INDOOR_STANDARD', label: 'Innen Standard' },
    { value: 'BAR_AREA', label: 'Barbereich' }
  ]

  const statusOptions = [
    { value: 'ALL', label: 'Alle Status' },
    { value: 'AVAILABLE', label: 'Verfügbar' },
    { value: 'OCCUPIED', label: 'Besetzt' },
    { value: 'RESERVED', label: 'Reserviert' },
    { value: 'MAINTENANCE', label: 'Wartung' },
    { value: 'OUT_OF_ORDER', label: 'Außer Betrieb' }
  ]

  const capacityOptions = [
    { value: 'ALL', label: 'Alle Kapazitäten' },
    { value: '2', label: '2 Personen' },
    { value: '4', label: '4 Personen' },
    { value: '6', label: '6 Personen' },
    { value: '8', label: '8+ Personen' }
  ]

  const shapeOptions = [
    { value: 'ALL', label: 'Alle Formen' },
    { value: 'RECTANGLE', label: 'Rechteckig' },
    { value: 'ROUND', label: 'Rund' },
    { value: 'SQUARE', label: 'Quadratisch' }
  ]

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      
      // Aktualisiere oder entferne Filter
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'ALL') {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      
      // Behalte andere Parameter wie tab
      const currentTab = searchParams.get('tab')
      if (currentTab) {
        params.set('tab', currentTab)
      }
      
      router.push(`/dashboard/tische?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setFilters({
      location: 'ALL',
      status: 'ALL',
      capacity: 'ALL',
      shape: 'ALL',
      search: ''
    })
    
    startTransition(() => {
      const params = new URLSearchParams()
      const currentTab = searchParams.get('tab')
      if (currentTab) {
        params.set('tab', currentTab)
      }
      router.push(`/dashboard/tische?${params.toString()}`)
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '' && value !== 'ALL')
  const activeFilterCount = Object.values(filters).filter(value => value && value !== '' && value !== 'ALL').length

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case 'RECTANGLE':
        return <RectangleHorizontal className="h-3 w-3" />
      case 'ROUND':
        return <Circle className="h-3 w-3" />
      case 'SQUARE':
        return <Square className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Suche */}
        <div className="lg:col-span-2">
          <Label htmlFor="search">Suche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Tischnummer, Beschreibung..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters()
                }
              }}
            />
          </div>
        </div>

        {/* Standort */}
        <div>
          <Label htmlFor="location">Standort</Label>
          <Select 
            value={filters.location} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Standort wählen">
                {filters.location && filters.location !== 'ALL' && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{locationOptions.find(opt => opt.value === filters.location)?.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kapazität */}
        <div>
          <Label htmlFor="capacity">Kapazität</Label>
          <Select 
            value={filters.capacity} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, capacity: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kapazität wählen">
                {filters.capacity && filters.capacity !== 'ALL' && (
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{capacityOptions.find(opt => opt.value === filters.capacity)?.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {capacityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Form */}
        <div>
          <Label htmlFor="shape">Form</Label>
          <Select 
            value={filters.shape} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, shape: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Form wählen">
                {filters.shape && filters.shape !== 'ALL' && (
                  <div className="flex items-center gap-2">
                    {getShapeIcon(filters.shape)}
                    <span>{shapeOptions.find(opt => opt.value === filters.shape)?.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {shapeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {getShapeIcon(option.value)}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={applyFilters} 
            disabled={isPending}
            className="flex-1"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Aktive Filter:</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            {activeFilterCount} Filter aktiv
          </Badge>
          
          {/* Individual filter badges */}
          {filters.search && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Suche: {filters.search}
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
          
          {filters.location && filters.location !== 'ALL' && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {locationOptions.find(opt => opt.value === filters.location)?.label}
              <button
                onClick={() => setFilters(prev => ({ ...prev, location: 'ALL' }))}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
          
          {filters.capacity && filters.capacity !== 'ALL' && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {capacityOptions.find(opt => opt.value === filters.capacity)?.label}
              <button
                onClick={() => setFilters(prev => ({ ...prev, capacity: 'ALL' }))}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
          
          {filters.shape && filters.shape !== 'ALL' && (
            <Badge variant="outline" className="flex items-center gap-1">
              {getShapeIcon(filters.shape)}
              {shapeOptions.find(opt => opt.value === filters.shape)?.label}
              <button
                onClick={() => setFilters(prev => ({ ...prev, shape: 'ALL' }))}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}