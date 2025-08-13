'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { CalendarIcon, Search, X, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Table {
  id: string
  number: number
  capacity: number
  location: string
}

interface ReservationFiltersProps {
  tables: Table[]
  currentFilters: {
    date?: string
    status?: string
    tableId?: string
    search?: string
  }
}

const statusOptions = [
  { value: 'all', label: 'Alle Status' },
  { value: 'PENDING', label: 'Wartend' },
  { value: 'CONFIRMED', label: 'Bestätigt' },
  { value: 'SEATED', label: 'Eingetroffen' },
  { value: 'COMPLETED', label: 'Abgeschlossen' },
  { value: 'CANCELLED', label: 'Storniert' },
  { value: 'NO_SHOW', label: 'Nicht erschienen' }
]

const locationOptions = [
  { value: 'all', label: 'Alle Bereiche' },
  { value: 'TERRACE_SEA_VIEW', label: 'Terrasse Meerblick' },
  { value: 'TERRACE_STANDARD', label: 'Terrasse Standard' },
  { value: 'INDOOR_WINDOW', label: 'Innenbereich Fenster' },
  { value: 'INDOOR_STANDARD', label: 'Innenbereich Standard' },
  { value: 'BAR_AREA', label: 'Barbereich' }
]

export function ReservationFilters({ tables, currentFilters }: ReservationFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '')
  const [date, setDate] = useState<Date | undefined>(
    currentFilters.date ? new Date(currentFilters.date) : undefined
  )

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/dashboard/reservierungen?${params.toString()}`)
  }

  const handleSearch = () => {
    updateFilter('search', searchTerm || undefined)
  }

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    updateFilter('date', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDate(undefined)
    router.push('/dashboard/reservierungen')
  }

  const activeFiltersCount = [
    currentFilters.search,
    currentFilters.status && currentFilters.status !== 'all' ? currentFilters.status : null,
    currentFilters.tableId && currentFilters.tableId !== 'all' ? currentFilters.tableId : null,
    currentFilters.date
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Label className="text-sm font-medium">Filter & Suche</Label>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} aktiv
            </Badge>
          )}
        </div>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Zurücksetzen
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="space-y-1">
          <Label htmlFor="search" className="text-xs">Suche</Label>
          <div className="flex gap-1">
            <Input
              id="search"
              placeholder="Name, E-Mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="text-sm"
            />
            <Button size="sm" onClick={handleSearch}>
              <Search className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Datum</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal text-sm",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {date ? format(date, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                locale={de}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select
            value={currentFilters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Tisch</Label>
          <Select
            value={currentFilters.tableId || 'all'}
            onValueChange={(value) => updateFilter('tableId', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Tische</SelectItem>
              <SelectItem value="unassigned">Ohne Tisch</SelectItem>
              {tables.map((table) => (
                <SelectItem key={table.id} value={table.id}>
                  Tisch {table.number} ({table.capacity}P, {table.location})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Bereich</Label>
          <Select
            value={currentFilters.tableId || 'all'}
            onValueChange={(value) => {
              // Filter tables by location and then update tableId filter
              if (value === 'all') {
                updateFilter('tableId', undefined)
              } else {
                const locationTables = tables.filter(t => t.location === value)
                if (locationTables.length > 0) {
                  updateFilter('tableId', locationTables[0].id)
                }
              }
            }}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Label className="text-xs text-muted-foreground">Aktive Filter:</Label>
          {currentFilters.search && (
            <Badge variant="outline" className="text-xs">
              Suche: {currentFilters.search}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => {
                  setSearchTerm('')
                  updateFilter('search', undefined)
                }}
              />
            </Badge>
          )}
          {currentFilters.status && currentFilters.status !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Status: {statusOptions.find(s => s.value === currentFilters.status)?.label}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('status', undefined)}
              />
            </Badge>
          )}
          {currentFilters.tableId && currentFilters.tableId !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Tisch: {tables.find(t => t.id === currentFilters.tableId)?.number || 'Unbekannt'}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('tableId', undefined)}
              />
            </Badge>
          )}
          {currentFilters.date && (
            <Badge variant="outline" className="text-xs">
              Datum: {format(new Date(currentFilters.date), "dd.MM.yyyy", { locale: de })}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => {
                  setDate(undefined)
                  updateFilter('date', undefined)
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
