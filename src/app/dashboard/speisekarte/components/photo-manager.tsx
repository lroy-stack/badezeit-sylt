'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import { 
  Camera, 
  Upload, 
  Search, 
  Image,
  Trash2,
  Edit,
  Download,
  Plus,
  Grid3X3,
  List,
  Filter,
  Settings,
  Eye,
  X
} from 'lucide-react'

interface PhotoManagerProps {
  userRole: string
}

// Mock data for demonstration - would normally come from API
const MOCK_PHOTOS = [
  {
    id: '1',
    url: '/images/menu/schnitzel.jpg',
    alt: 'Wiener Schnitzel mit Kartoffelsalat',
    itemId: 'item-1',
    itemName: 'Wiener Schnitzel',
    category: 'Hauptgerichte',
    uploadedAt: '2024-01-15T10:30:00Z',
    size: '2.3 MB',
    dimensions: '1920x1080'
  },
  {
    id: '2', 
    url: '/images/menu/fish.jpg',
    alt: 'Gebratener Fisch mit Gemüse',
    itemId: 'item-2',
    itemName: 'Gebratener Seelachs',
    category: 'Hauptgerichte',
    uploadedAt: '2024-01-14T14:20:00Z',
    size: '1.8 MB',
    dimensions: '1600x900'
  },
  {
    id: '3',
    url: '/images/menu/salad.jpg',
    alt: 'Frischer Salat mit Vinaigrette',
    itemId: 'item-3',
    itemName: 'Caesar Salad',
    category: 'Vorspeisen',
    uploadedAt: '2024-01-13T16:45:00Z',
    size: '1.5 MB',
    dimensions: '1400x800'
  },
  {
    id: '4',
    url: '/images/menu/dessert.jpg',
    alt: 'Schokoladenkuchen mit Beeren',
    itemId: 'item-4',
    itemName: 'Schokoladentorte',
    category: 'Desserts',
    uploadedAt: '2024-01-12T12:15:00Z',
    size: '2.1 MB',
    dimensions: '1800x1200'
  }
]

export function PhotoManager({ userRole }: PhotoManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const canEdit = ['ADMIN', 'MANAGER'].includes(userRole)

  // Fetch gallery images and categories
  const { data: galleryData, isLoading: imagesLoading, error: imagesError } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const response = await fetch('/api/gallery')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch gallery images`)
      }
      return response.json()
    }
  })

  const images = galleryData?.images || []

  const { data: categories = [] } = useQuery({
    queryKey: ['menu-categories-simple'],
    queryFn: async () => {
      const response = await fetch('/api/menu/categories?isActive=true')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    }
  })

  // Filter photos based on search and category
  const filteredPhotos = Array.isArray(images) ? images.filter((photo: any) => {
    const matchesSearch = searchQuery === '' || 
      photo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory
    
    return matchesSearch && matchesCategory
  }) : []

  // Calculate statistics
  const totalPhotos = Array.isArray(images) ? images.length : 0
  const totalSize = totalPhotos * 1.5 // Estimated average size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Foto-Management</h3>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie Bilder für Ihre Menü-Gerichte
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Fotos hochladen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Neue Fotos hochladen</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="text-lg font-medium mb-2">Fotos hier ablegen</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      oder klicken Sie hier zum Auswählen
                    </p>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Dateien auswählen
                    </Button>
                    <div className="mt-4 text-xs text-muted-foreground">
                      <p>Unterstützte Formate: JPG, PNG, WebP</p>
                      <p>Maximale Größe: 5MB pro Datei</p>
                      <p>Empfohlene Auflösung: 1920x1080 oder höher</p>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Kategorie zuordnen</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="auto-compress" className="rounded" />
                      <Label htmlFor="auto-compress">Automatische Komprimierung aktivieren</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="generate-alt" className="rounded" />
                      <Label htmlFor="generate-alt">Alt-Text automatisch generieren</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Hochladen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Image className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fotos gesamt</p>
                <p className="text-2xl font-bold">{totalPhotos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Speicherplatz</p>
                <p className="text-2xl font-bold">{totalSize.toFixed(1)} MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kategorien</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ohne Foto</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Fotos suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos Display */}
      {imagesError ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-destructive">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Fehler beim Laden der Fotos</h3>
              <p className="text-sm text-muted-foreground">
                {imagesError.message || 'Fotos konnten nicht geladen werden'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : imagesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPhotos.map((photo: any) => (
            <Card key={photo.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <div className="aspect-video relative bg-muted cursor-pointer"
                   onClick={() => setSelectedPhoto(photo)}>
                {photo.imageUrl ? (
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Image className="h-12 w-12 text-blue-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {photo.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{photo.title}</h4>
                  <p className="text-xs text-muted-foreground">{photo.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Galerie</span>
                    <span>{new Date(photo.createdAt).toLocaleDateString('de-DE')}</span>
                  </div>
                  
                  {canEdit && (
                    <div className="flex gap-1 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredPhotos.map((photo: any, index: number) => (
                <div key={photo.id} 
                     className={`flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer ${
                       index !== filteredPhotos.length - 1 ? 'border-b' : ''
                     }`}
                     onClick={() => setSelectedPhoto(photo)}>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center">
                    <Image className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{photo.itemName}</h4>
                    <p className="text-sm text-muted-foreground">{photo.alt}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>{photo.category}</span>
                      <span>{photo.dimensions}</span>
                      <span>{photo.size}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(photo.uploadedAt).toLocaleDateString('de-DE')}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Preview Dialog */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPhoto.itemName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <Image className="h-24 w-24 text-blue-600" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Alt-Text</Label>
                  <p className="text-muted-foreground">{selectedPhoto.alt}</p>
                </div>
                <div>
                  <Label>Kategorie</Label>
                  <p className="text-muted-foreground">{selectedPhoto.category}</p>
                </div>
                <div>
                  <Label>Abmessungen</Label>
                  <p className="text-muted-foreground">{selectedPhoto.dimensions}</p>
                </div>
                <div>
                  <Label>Dateigröße</Label>
                  <p className="text-muted-foreground">{selectedPhoto.size}</p>
                </div>
                <div>
                  <Label>Hochgeladen</Label>
                  <p className="text-muted-foreground">
                    {new Date(selectedPhoto.uploadedAt).toLocaleString('de-DE')}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Herunterladen
                </Button>
                {canEdit && (
                  <>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </Button>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Fotos gefunden</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Versuchen Sie andere Suchkriterien.'
                  : 'Laden Sie Ihre ersten Menü-Fotos hoch.'
                }
              </p>
              {canEdit && !searchQuery && selectedCategory === 'all' && (
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Erstes Foto hochladen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}