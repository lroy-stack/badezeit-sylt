'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Lightbox } from "@/components/ui/lightbox"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Camera,
  Search,
  Grid3x3,
  Grid,
  Filter,
  Heart,
  Share2,
  Loader2,
  Eye,
  ChevronDown,
  Instagram,
  Facebook,
  MapPin,
  Star,
  Download
} from "lucide-react"
import { useGallery } from '@/hooks/use-gallery'
import { GALLERY_CATEGORIES } from '@/lib/validations/gallery'
import { cn } from "@/lib/utils"

const gridSizes = {
  small: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
  medium: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  large: 'grid-cols-1 lg:grid-cols-2'
}

export default function GaleriePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [language, setLanguage] = useState<'de' | 'en'>('de')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const { 
    gallery, 
    loading, 
    error, 
    filterByCategory, 
    clearFilters, 
    loadMore,
    shareImage,
    copyImageUrl
  } = useGallery({
    category: selectedCategory as any,
    limit: 50,
    offset: 0
  })

  // Filter images based on search and category
  const filteredImages = useMemo(() => {
    if (!gallery?.images) return []
    
    let filtered = gallery.images

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(image => 
        image.title.toLowerCase().includes(search) ||
        (image.titleEn && image.titleEn.toLowerCase().includes(search)) ||
        (image.description && image.description.toLowerCase().includes(search)) ||
        (image.descriptionEn && image.descriptionEn.toLowerCase().includes(search))
      )
    }

    return filtered
  }, [gallery?.images, searchTerm])

  const getCategoryLabel = (categoryKey: string) => {
    const category = GALLERY_CATEGORIES[categoryKey as keyof typeof GALLERY_CATEGORIES]
    return language === 'en' ? category?.labelEn : category?.label
  }

  const getImageTitle = (image: any) => {
    return language === 'en' && image.titleEn ? image.titleEn : image.title
  }

  const getImageDescription = (image: any) => {
    return language === 'en' && image.descriptionEn ? image.descriptionEn : image.description
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    if (category === 'all') {
      clearFilters()
    } else {
      filterByCategory(category)
    }
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Camera className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Fehler beim Laden der Galerie</h2>
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
              backgroundImage: 'url(https://ik.imagekit.io/insomnialz/badezeit-galery.webp)'
            }}
          />
        </div>
        <div className="relative z-20 container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              📸 Fotogalerie
            </Badge>
            
            <h1 className="hero-title mb-6">
              Unsere Galerie
            </h1>
            
            <p className="body-text text-white/90 max-w-2xl mx-auto mb-8">
              Entdecken Sie Badezeit Sylt durch Bilder - von unserem Restaurant mit Meerblick 
              bis hin zu unseren köstlichen Spezialitäten
            </p>

            {/* Gallery Stats */}
            {gallery && (
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">{gallery.pagination.total}</div>
                  <div className="text-sm text-white/80">Bilder</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{Object.keys(gallery.categories).length}</div>
                  <div className="text-sm text-white/80">Kategorien</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.8★</div>
                  <div className="text-sm text-white/80">Bewertung</div>
                </div>
              </div>
            )}

            {/* Language Toggle */}
            <div className="flex justify-center gap-2">
              <Button 
                variant={language === 'de' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('de')}
                className={language === 'de' ? 'bg-background text-primary' : 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200'}
              >
                Deutsch
              </Button>
              <Button 
                variant={language === 'en' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-background text-primary' : 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200'}
              >
                English
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Bilder durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {Object.entries(GALLERY_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        {getCategoryLabel(key)}
                        {gallery?.categories[key] && (
                          <Badge variant="secondary" className="ml-auto">
                            {gallery.categories[key]}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Grid Size Controls */}
              <div className="flex border rounded-lg">
                <Button
                  variant={gridSize === 'small' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setGridSize('small')}
                  className="rounded-r-none min-h-[44px]"
                >
                  <Grid3x3 className="h-5 w-5" />
                  <span className="sr-only">Kleine Ansicht</span>
                </Button>
                <Button
                  variant={gridSize === 'medium' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setGridSize('medium')}
                  className="rounded-none border-x min-h-[44px]"
                >
                  <Grid className="h-5 w-5" />
                  <span className="sr-only">Mittlere Ansicht</span>
                </Button>
                <Button
                  variant={gridSize === 'large' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setGridSize('large')}
                  className="rounded-l-none min-h-[44px]"
                >
                  <Grid className="h-5 w-5 scale-125" />
                  <span className="sr-only">Große Ansicht</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory || searchTerm) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Aktive Filter:</span>
              {selectedCategory && (
                <Badge variant="outline" className="gap-1">
                  {GALLERY_CATEGORIES[selectedCategory as keyof typeof GALLERY_CATEGORIES]?.icon}
                  {getCategoryLabel(selectedCategory)}
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="outline" className="gap-1">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  handleCategoryChange('all')
                }}
                className="text-xs"
              >
                Alle Filter löschen
              </Button>
            </div>
          )}

          {/* Results count */}
          {filteredImages.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredImages.length} {filteredImages.length === 1 ? 'Bild' : 'Bilder'} gefunden
            </div>
          )}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {loading && filteredImages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Galerie wird geladen...</p>
              </div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Keine Bilder gefunden</h3>
              <p className="text-muted-foreground mb-4">
                Versuchen Sie andere Suchbegriffe oder entfernen Sie Filter
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                handleCategoryChange('all')
              }}>
                Filter zurücksetzen
              </Button>
            </div>
          ) : (
            <>
              <div className={cn("grid gap-4 sm:gap-6", gridSizes[gridSize])}>
                {filteredImages.map((image, index) => (
                  <Card 
                    key={image.id} 
                    className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={image.imageUrl}
                        alt={getImageTitle(image)}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes={
                          gridSize === 'small' ? '(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw' :
                          gridSize === 'medium' ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw' :
                          '(max-width: 768px) 100vw, 50vw'
                        }
                        priority={index < 6} // Prioritize first 6 images for LCP optimization
                        quality={85} // Optimized quality for gallery display
                      />
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Eye className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">Ansehen</p>
                        </div>
                      </div>

                      {/* Category badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-black/70 text-white border-none">
                          {GALLERY_CATEGORIES[image.category as keyof typeof GALLERY_CATEGORIES]?.icon}{' '}
                          {getCategoryLabel(image.category)}
                        </Badge>
                      </div>

                      {/* Quick share button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 min-h-[44px] min-w-[44px]"
                        onClick={(e) => {
                          e.stopPropagation()
                          shareImage(image, 'facebook')
                        }}
                      >
                        <Share2 className="h-5 w-5" />
                        <span className="sr-only">Bild teilen</span>
                      </Button>
                    </div>

                    {gridSize !== 'small' && (
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1 line-clamp-2">
                          {getImageTitle(image)}
                        </h3>
                        {getImageDescription(image) && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {getImageDescription(image)}
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {/* Load More Button */}
              {gallery?.pagination.hasMore && (
                <div className="text-center mt-12">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    size="lg"
                    className="gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Wird geladen...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Mehr Bilder laden
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 xl:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title mb-4">
            Erleben Sie Badezeit Sylt selbst
          </h2>
          <p className="body-text text-white/90 mb-8 max-w-2xl mx-auto">
            Lassen Sie sich von unserer Küche und dem atemberaubenden Meerblick verzaubern. 
            Reservieren Sie jetzt Ihren Tisch!
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
              <Camera className="h-4 w-4" />
              <span>Über {gallery?.pagination.total || 0} Fotos</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="bg-background text-primary hover:bg-background/90 font-semibold" asChild>
              <a href="/reservierung">
                <MapPin className="mr-2 h-5 w-5" />
                Jetzt Tisch reservieren
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <a href="/speisekarte">
                <Eye className="mr-2 h-5 w-5" />
                Speisekarte ansehen
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={filteredImages}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
        language={language}
        onShare={shareImage}
        onCopyUrl={copyImageUrl}
      />
    </PublicLayout>
  )
}