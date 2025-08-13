'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Filter, Star, Shield } from 'lucide-react'

interface CustomerFiltersProps {
  currentFilters: {
    search?: string
    isVip?: string
    language?: string
    consent?: string
    sortBy?: string
    sortOrder?: string
  }
}

const sortOptions = [
  { value: 'createdAt', label: 'Registrierungsdatum' },
  { value: 'lastName', label: 'Nachname' },
  { value: 'totalVisits', label: 'Anzahl Besuche' },
  { value: 'totalSpent', label: 'Gesamtumsatz' },
  { value: 'lastVisit', label: 'Letzter Besuch' }
]

const consentOptions = [
  { value: 'all', label: 'Alle Kunden' },
  { value: 'email', label: 'E-Mail-Zustimmung' },
  { value: 'marketing', label: 'Marketing-Zustimmung' },
  { value: 'no-consent', label: 'Keine Zustimmungen' }
]

export function CustomerFilters({ currentFilters }: CustomerFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '')

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to page 1 when filters change
    params.delete('page')
    
    router.push(`/dashboard/kunden?${params.toString()}`)
  }

  const handleSearch = () => {
    updateFilter('search', searchTerm || undefined)
  }

  const clearFilters = () => {
    setSearchTerm('')
    router.push('/dashboard/kunden')
  }

  const activeFiltersCount = [
    currentFilters.search,
    currentFilters.isVip && currentFilters.isVip !== 'all' ? currentFilters.isVip : null,
    currentFilters.language && currentFilters.language !== 'all' ? currentFilters.language : null,
    currentFilters.consent && currentFilters.consent !== 'all' ? currentFilters.consent : null,
    currentFilters.sortBy && currentFilters.sortBy !== 'createdAt' ? currentFilters.sortBy : null
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="space-y-1">
          <Label htmlFor="search" className="text-xs">Suche</Label>
          <div className="flex gap-1">
            <Input
              id="search"
              placeholder="Name, E-Mail, Telefon..."
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

        {/* VIP Status */}
        <div className="space-y-1">
          <Label className="text-xs">VIP Status</Label>
          <Select
            value={currentFilters.isVip || 'all'}
            onValueChange={(value) => updateFilter('isVip', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kunden</SelectItem>
              <SelectItem value="true">
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-600" />
                  Nur VIP
                </div>
              </SelectItem>
              <SelectItem value="false">Nur Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-1">
          <Label className="text-xs">Sprache</Label>
          <Select
            value={currentFilters.language || 'all'}
            onValueChange={(value) => updateFilter('language', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Sprachen</SelectItem>
              <SelectItem value="DE">Deutsch</SelectItem>
              <SelectItem value="EN">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Consent Status */}
        <div className="space-y-1">
          <Label className="text-xs">GDPR Status</Label>
          <Select
            value={currentFilters.consent || 'all'}
            onValueChange={(value) => updateFilter('consent', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {consentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value === 'no-consent' && <Shield className="h-3 w-3 mr-2 text-red-600" />}
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-1">
          <Label className="text-xs">Sortieren nach</Label>
          <Select
            value={currentFilters.sortBy || 'createdAt'}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="space-y-1">
          <Label className="text-xs">Reihenfolge</Label>
          <Select
            value={currentFilters.sortOrder || 'desc'}
            onValueChange={(value) => updateFilter('sortOrder', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Absteigend</SelectItem>
              <SelectItem value="asc">Aufsteigend</SelectItem>
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
          {currentFilters.isVip && currentFilters.isVip !== 'all' && (
            <Badge variant="outline" className="text-xs">
              VIP: {currentFilters.isVip === 'true' ? 'Ja' : 'Nein'}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('isVip', undefined)}
              />
            </Badge>
          )}
          {currentFilters.language && currentFilters.language !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Sprache: {currentFilters.language}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('language', undefined)}
              />
            </Badge>
          )}
          {currentFilters.consent && currentFilters.consent !== 'all' && (
            <Badge variant="outline" className="text-xs">
              GDPR: {consentOptions.find(c => c.value === currentFilters.consent)?.label}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('consent', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
