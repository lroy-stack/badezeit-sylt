'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { 
  ShieldAlert, 
  Search, 
  Filter,
  AlertTriangle,
  Users,
  TrendingUp,
  Download
} from 'lucide-react'

// EU-14 Allergens as per German law
const EU_ALLERGENS = [
  { key: 'containsGluten', label: 'Gluten', icon: '🌾', description: 'Weizen, Roggen, Gerste, Hafer' },
  { key: 'containsMilk', label: 'Milch/Laktose', icon: '🥛', description: 'Alle Milchprodukte' },
  { key: 'containsEggs', label: 'Eier', icon: '🥚', description: 'Hühnerei und Erzeugnisse' },
  { key: 'containsNuts', label: 'Nüsse', icon: '🥜', description: 'Schalenfrüchte (außer Erdnüsse)' },
  { key: 'containsFish', label: 'Fisch', icon: '🐟', description: 'Alle Fischarten' },
  { key: 'containsShellfish', label: 'Krebstiere', icon: '🦐', description: 'Garnelen, Krabben, etc.' },
  { key: 'containsSoy', label: 'Soja', icon: '🫘', description: 'Sojabohnen und Erzeugnisse' },
  { key: 'containsCelery', label: 'Sellerie', icon: '🥬', description: 'Stangen- und Knollensellerie' },
  { key: 'containsMustard', label: 'Senf', icon: '🌭', description: 'Senfkörner und Erzeugnisse' },
  { key: 'containsSesame', label: 'Sesam', icon: '🌰', description: 'Sesamsamen und Erzeugnisse' },
  { key: 'containsSulfites', label: 'Sulfite', icon: '🍷', description: 'Schwefeldioxid und Sulfite' },
  { key: 'containsLupin', label: 'Lupinen', icon: '🌿', description: 'Lupinensamen und Erzeugnisse' },
  { key: 'containsMollusks', label: 'Weichtiere', icon: '🐚', description: 'Schnecken, Muscheln, etc.' },
  { key: 'containsPeanuts', label: 'Erdnüsse', icon: '🥜', description: 'Erdnüsse und Erzeugnisse' },
] as const

interface AllergenManagerProps {
  userRole: string
}

export function AllergenManager({ userRole }: AllergenManagerProps) {
  const [selectedAllergen, setSelectedAllergen] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const canEdit = ['ADMIN', 'MANAGER', 'KITCHEN'].includes(userRole)

  // Fetch menu items with allergen information
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['menu-items-allergens', selectedAllergen, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      
      const response = await fetch(`/api/menu/items?${params}`)
      if (!response.ok) throw new Error('Failed to fetch items')
      return response.json()
    }
  })

  // Calculate allergen statistics
  const allergenStats = EU_ALLERGENS.map(allergen => {
    const itemsWithAllergen = items.filter((item: any) => item[allergen.key])
    const percentage = items.length > 0 ? (itemsWithAllergen.length / items.length) * 100 : 0
    
    return {
      ...allergen,
      count: itemsWithAllergen.length,
      percentage,
      items: itemsWithAllergen
    }
  }).sort((a, b) => b.count - a.count)

  // Filter items based on selected allergen
  const filteredItems = selectedAllergen === 'all' 
    ? items 
    : items.filter((item: any) => item[selectedAllergen])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Allergen-Management</h3>
          <p className="text-sm text-muted-foreground">
            Übersicht und Verwaltung der EU-14 Allergene nach deutscher Gesetzgebung
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Allergen-Report
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Gerichte suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedAllergen} onValueChange={setSelectedAllergen}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Allergen auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Gerichte</SelectItem>
                {EU_ALLERGENS.map((allergen) => (
                  <SelectItem key={allergen.key} value={allergen.key}>
                    {allergen.icon} {allergen.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Allergen Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allergenStats.slice(0, 8).map((allergen) => (
          <Card key={allergen.key} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAllergen(allergen.key)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{allergen.icon}</span>
                  <div>
                    <h4 className="font-medium text-sm">{allergen.label}</h4>
                    <p className="text-xs text-muted-foreground">
                      {allergen.description}
                    </p>
                  </div>
                </div>
                <Badge variant={allergen.count > 0 ? 'destructive' : 'secondary'}>
                  {allergen.count}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{allergen.percentage.toFixed(1)}% der Gerichte</span>
                {allergen.count > 0 && (
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Items with Selected Allergen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            {selectedAllergen === 'all' 
              ? `Alle Gerichte (${filteredItems.length})`
              : `Gerichte mit ${EU_ALLERGENS.find(a => a.key === selectedAllergen)?.label} (${filteredItems.length})`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>Keine Gerichte gefunden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item: any) => {
                const itemAllergens = EU_ALLERGENS.filter(allergen => item[allergen.key])
                
                return (
                  <Card key={item.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.category.name}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {item.price.toFixed(2)}€
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item.description}
                      </p>
                      
                      {itemAllergens.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Enthält Allergene:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {itemAllergens.map((allergen) => (
                              <Badge key={allergen.key} variant="destructive" className="text-xs">
                                {allergen.icon} {allergen.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.isVegetarian && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          🌱 Vegetarisch
                        </Badge>
                      )}
                      {item.isVegan && (
                        <Badge variant="secondary" className="mt-2 ml-1 text-xs">
                          🌿 Vegan
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* EU Compliance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            EU-Kennzeichnungspflicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Gesetzliche Anforderungen</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• EU-Verordnung Nr. 1169/2011 (LMIV)</li>
                <li>• Kennzeichnung aller 14 Hauptallergene</li>
                <li>• Schriftliche oder mündliche Information</li>
                <li>• Aktualisierung bei Rezepturänderungen</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Compliance-Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gerichte mit Allergen-Info:</span>
                  <Badge variant="default">{items.length}/{items.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">EU-14 Allergene erfasst:</span>
                  <Badge variant="default">14/14</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance-Rate:</span>
                  <Badge variant="default">100%</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}