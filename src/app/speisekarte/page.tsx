'use client'

import { useState, useMemo } from 'react'
import Link from "next/link"
import { useMenu } from "@/hooks/use-menu"
import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ChefHat, 
  Search, 
  Filter, 
  Star, 
  Leaf, 
  Calendar,
  Shield,
  Timer,
  Euro,
  AlertTriangle,
  Heart,
  TrendingUp,
  Eye,
  Users,
  Camera
} from "lucide-react"
import { MenuFilterData } from '@/lib/validations/menu'
import { cn } from "@/lib/utils"

const allergenInfo = {
  gluten: { name: "Gluten", nameEn: "Gluten", symbol: "⚠️" },
  milk: { name: "Milch", nameEn: "Milk", symbol: "🥛" },
  eggs: { name: "Eier", nameEn: "Eggs", symbol: "🥚" },
  nuts: { name: "Nüsse", nameEn: "Nuts", symbol: "🥜" },
  fish: { name: "Fisch", nameEn: "Fish", symbol: "🐟" },
  shellfish: { name: "Krustentiere", nameEn: "Shellfish", symbol: "🦐" },
  soy: { name: "Soja", nameEn: "Soy", symbol: "🌱" },
  celery: { name: "Sellerie", nameEn: "Celery", symbol: "🥬" },
  mustard: { name: "Senf", nameEn: "Mustard", symbol: "🌶️" },
  sesame: { name: "Sesam", nameEn: "Sesame", symbol: "🌰" },
  sulfites: { name: "Sulfite", nameEn: "Sulfites", symbol: "⚗️" },
  lupin: { name: "Lupinen", nameEn: "Lupin", symbol: "🌸" },
  mollusks: { name: "Weichtiere", nameEn: "Mollusks", symbol: "🐚" },
  peanuts: { name: "Erdnüsse", nameEn: "Peanuts", symbol: "🥜" },
}

export default function SpeisekartePage() {
  const [filters, setFilters] = useState<MenuFilterData>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAllergenInfo, setShowAllergenInfo] = useState(false)
  const [language, setLanguage] = useState<'de' | 'en'>('de')

  const { menu, loading, error } = useMenu(filters)

  // Filter menu based on search and category
  const filteredMenu = useMemo(() => {
    if (!menu) return null

    let filteredCategories = menu.categories

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filteredCategories = filteredCategories.filter(cat => cat.id === selectedCategory)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filteredCategories = filteredCategories.map(category => ({
        ...category,
        menuItems: category.menuItems.filter(item => 
          item.name.toLowerCase().includes(searchLower) ||
          (item.nameEn && item.nameEn.toLowerCase().includes(searchLower)) ||
          item.description.toLowerCase().includes(searchLower) ||
          (item.descriptionEn && item.descriptionEn.toLowerCase().includes(searchLower))
        )
      })).filter(category => category.menuItems.length > 0)
    }

    return {
      ...menu,
      categories: filteredCategories
    }
  }, [menu, searchTerm, selectedCategory])

  const updateFilters = (newFilters: Partial<MenuFilterData>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setSelectedCategory('')
  }

  const getItemDisplayName = (item: any) => {
    return language === 'en' && item.nameEn ? item.nameEn : item.name
  }

  const getItemDisplayDescription = (item: any) => {
    return language === 'en' && item.descriptionEn ? item.descriptionEn : item.description
  }

  const getCategoryDisplayName = (category: any) => {
    return language === 'en' && category.nameEn ? category.nameEn : category.name
  }

  const getItemAllergens = (item: any) => {
    const allergens: any[] = []
    Object.entries(allergenInfo).forEach(([key, info]) => {
      const containsKey = `contains${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof item
      if (item[containsKey]) {
        allergens.push({ key, ...info })
      }
    })
    return allergens
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ChefHat className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-lg">Speisekarte wird geladen...</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-sm text-gray-500">
                <p>Loading: {loading.toString()}</p>
                <p>Error: {error || 'none'}</p>
                <p>Menu: {menu ? 'loaded' : 'null'}</p>
              </div>
            )}
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Fehler beim Laden</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 xl:py-24 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://ik.imagekit.io/insomnialz/badezeit-kc.webp)'
            }}
          />
        </div>
        <div className="relative z-20 container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              🍽️ Täglich frisch zubereitet
            </Badge>
            
            <h1 className="hero-title mb-6">
              Unsere Speisekarte
            </h1>
            
            <p className="body-text text-white/90 max-w-2xl mx-auto mb-8">
              Entdecken Sie unsere exquisite Auswahl an frischen Meeresfrüchten, 
              regionalen Spezialitäten und saisonalen Köstlichkeiten
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {menu?.summary && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{menu.summary.totalItems}</div>
                    <div className="text-sm text-white/80">Gerichte</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{menu.summary.signatureItems}</div>
                    <div className="text-sm text-white/80">Signature</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{menu.summary.vegetarianItems}</div>
                    <div className="text-sm text-white/80">Vegetarisch</div>
                  </div>
                  {menu.summary.priceRange && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">€{menu.summary.priceRange.min}-{menu.summary.priceRange.max}</div>
                      <div className="text-sm text-white/80">Preisspanne</div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Language Toggle */}
            <div className="flex justify-center gap-2 mb-8">
              <Button 
                variant={language === 'de' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('de')}
                className={language === 'de' ? 'bg-white text-primary' : 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200'}
              >
                Deutsch
              </Button>
              <Button 
                variant={language === 'en' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-white text-primary' : 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200'}
              >
                English
              </Button>
            </div>

            {/* Conversion CTA */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-lg mx-auto">
              <p className="text-sm text-white/90 mb-3">
                🎯 Vorbestellen und 15% sparen | ⏰ Reservierung garantiert verfügbar
              </p>
              <Button className="bg-white text-primary hover:bg-white/90 font-semibold" asChild>
                <Link href="/reservierung">
                  <Calendar className="mr-2 h-4 w-4" />
                  Jetzt reservieren & vorbestellen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Gerichte durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {menu?.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getCategoryDisplayName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced Filters */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {Object.keys(filters).length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Filter & Allergene</SheetTitle>
                  <SheetDescription>
                    Passen Sie die Speisekarte nach Ihren Bedürfnissen an
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  {/* Dietary Preferences */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Ernährungsform</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="vegetarian" 
                          checked={filters.isVegetarian || false}
                          onCheckedChange={(checked: boolean) => updateFilters({ isVegetarian: checked })}
                        />
                        <Label htmlFor="vegetarian" className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-green-600" />
                          Vegetarisch
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="vegan" 
                          checked={filters.isVegan || false}
                          onCheckedChange={(checked: boolean) => updateFilters({ isVegan: checked })}
                        />
                        <Label htmlFor="vegan" className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-green-700" />
                          Vegan
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="gluten-free" 
                          checked={filters.isGlutenFree || false}
                          onCheckedChange={(checked: boolean) => updateFilters({ isGlutenFree: checked })}
                        />
                        <Label htmlFor="gluten-free" className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Glutenfrei
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="signature" 
                          checked={filters.isSignature || false}
                          onCheckedChange={(checked: boolean) => updateFilters({ isSignature: checked })}
                        />
                        <Label htmlFor="signature" className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-600" />
                          Signature Gerichte
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Allergen Exclusions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-medium">Allergene ausschließen</Label>
                      <Dialog open={showAllergenInfo} onOpenChange={setShowAllergenInfo}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Info
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>EU-14 Allergen Information</DialogTitle>
                            <DialogDescription>
                              Informationen zu den 14 häufigsten Allergenen nach EU-Verordnung
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {Object.entries(allergenInfo).map(([key, info]) => (
                              <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                                <span className="text-2xl">{info.symbol}</span>
                                <div>
                                  <div className="font-medium">{info.name}</div>
                                  <div className="text-sm text-muted-foreground">{info.nameEn}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(allergenInfo).map(([key, info]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`exclude-${key}`}
                            checked={filters[`exclude${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof MenuFilterData] as boolean || false}
                            onCheckedChange={(checked: boolean) => {
                              const filterKey = `exclude${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof MenuFilterData
                              updateFilters({ [filterKey]: checked })
                            }}
                          />
                          <Label htmlFor={`exclude-${key}`} className="text-sm flex items-center gap-1">
                            <span>{info.symbol}</span>
                            {info.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Preisspanne</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="Min €"
                        value={filters.priceMin || ''}
                        onChange={(e) => updateFilters({ priceMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-24"
                      />
                      <span>bis</span>
                      <Input
                        type="number"
                        placeholder="Max €"
                        value={filters.priceMax || ''}
                        onChange={(e) => updateFilters({ priceMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-24"
                      />
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Alle Filter löschen
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Results Count */}
            {filteredMenu && (
              <div className="text-sm text-muted-foreground">
                {filteredMenu.categories.reduce((sum, cat) => sum + cat.menuItems.length, 0)} Gerichte gefunden
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {filteredMenu?.categories.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Keine Gerichte gefunden</h3>
              <p className="text-muted-foreground mb-4">
                Versuchen Sie andere Suchbegriffe oder entfernen Sie einige Filter
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Filter zurücksetzen
              </Button>
            </div>
          ) : (
            <div className="space-y-16">
              {filteredMenu?.categories.map((category) => (
                <div key={category.id}>
                  {/* Category Header */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      {category.icon && <span className="text-3xl">{category.icon}</span>}
                      <h2 className="section-title">{getCategoryDisplayName(category)}</h2>
                    </div>
                    {category.description && (
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        {language === 'en' && category.descriptionEn ? category.descriptionEn : category.description}
                      </p>
                    )}
                  </div>

                  {/* Menu Items Grid */}
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {category.menuItems.map((item) => {
                      const allergens = getItemAllergens(item)
                      
                      return (
                        <Card key={item.id} className="hover:shadow-lg transition-shadow group">
                          <CardContent className="p-6">
                            {/* Item Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-2 flex-wrap">
                                {item.isSignature && (
                                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                    ⭐ Signature
                                  </Badge>
                                )}
                                {item.isNew && (
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                    🆕 Neu
                                  </Badge>
                                )}
                                {item.isSeasonalSpecial && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                                    🌸 Saison
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-primary">€{item.price}</div>
                              </div>
                            </div>

                            {/* Item Name */}
                            <h3 className="card-title mb-2 group-hover:text-primary transition-colors">
                              {getItemDisplayName(item)}
                            </h3>

                            {/* Description */}
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                              {getItemDisplayDescription(item)}
                            </p>

                            {/* Dietary & Allergen Info */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {item.isVegetarian && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <Leaf className="h-3 w-3 mr-1" />
                                  Vegetarisch
                                </Badge>
                              )}
                              {item.isVegan && (
                                <Badge variant="outline" className="text-green-700 border-green-700">
                                  <Heart className="h-3 w-3 mr-1" />
                                  Vegan
                                </Badge>
                              )}
                              {item.isGlutenFree && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Glutenfrei
                                </Badge>
                              )}
                            </div>

                            {/* Allergen Information */}
                            {allergens.length > 0 && (
                              <div className="mb-4">
                                <div className="text-sm text-muted-foreground mb-2">
                                  Enthält Allergene:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {allergens.map((allergen) => (
                                    <Badge 
                                      key={allergen.key} 
                                      variant="outline" 
                                      className="text-xs bg-orange-50 border-orange-200"
                                    >
                                      {allergen.symbol} {allergen.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action Button */}
                            <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                              <Link href="/reservierung">
                                <Calendar className="mr-2 h-4 w-4" />
                                Reservieren & bestellen
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 xl:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title mb-4">
            Gefällt Ihnen unsere Auswahl?
          </h2>
          <p className="body-text text-white/90 mb-8 max-w-2xl mx-auto">
            Reservieren Sie jetzt Ihren Tisch und genießen Sie ein unvergessliches kulinarisches Erlebnis 
            mit Meerblick auf Sylt.
          </p>
          
          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <span className="text-white/90">4.8/5 (127 Bewertungen)</span>
            </div>
            <div className="text-white/60 hidden sm:block">|</div>
            <div className="flex items-center gap-2 text-white/90">
              <Users className="h-4 w-4" />
              <span>500+ zufriedene Gäste monatlich</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold" asChild>
              <Link href="/reservierung">
                <Calendar className="mr-2 h-5 w-5" />
                Jetzt Tisch reservieren
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200" asChild>
              <Link href="/galerie">
                <Camera className="mr-2 h-5 w-5" />
                Galerie ansehen
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}