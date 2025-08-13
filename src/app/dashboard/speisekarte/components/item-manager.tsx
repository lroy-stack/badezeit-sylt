'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye, 
  EyeOff,
  Star,
  Utensils,
  Save,
  X,
  Euro,
  Calendar,
  AlertTriangle,
  Leaf,
  ShieldAlert
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// EU-14 Allergens as per German law
const EU_ALLERGENS = [
  { key: 'containsGluten', label: 'Gluten', icon: '🌾' },
  { key: 'containsMilk', label: 'Milch/Laktose', icon: '🥛' },
  { key: 'containsEggs', label: 'Eier', icon: '🥚' },
  { key: 'containsNuts', label: 'Nüsse', icon: '🥜' },
  { key: 'containsFish', label: 'Fisch', icon: '🐟' },
  { key: 'containsShellfish', label: 'Krebstiere', icon: '🦐' },
  { key: 'containsSoy', label: 'Soja', icon: '🫘' },
  { key: 'containsCelery', label: 'Sellerie', icon: '🥬' },
  { key: 'containsMustard', label: 'Senf', icon: '🌭' },
  { key: 'containsSesame', label: 'Sesam', icon: '🌰' },
  { key: 'containsSulfites', label: 'Sulfite', icon: '🍷' },
  { key: 'containsLupin', label: 'Lupinen', icon: '🌿' },
  { key: 'containsMollusks', label: 'Weichtiere', icon: '🐚' },
  { key: 'containsPeanuts', label: 'Erdnüsse', icon: '🥜' },
] as const

// Validation schema based on existing menu validation
const menuItemSchema = z.object({
  categoryId: z.string().min(1, 'Kategorie ist erforderlich'),
  name: z.string().min(1, 'Gerichtname ist erforderlich').max(150),
  nameEn: z.string().max(150).optional(),
  description: z.string().min(1, 'Beschreibung ist erforderlich').max(1000),
  descriptionEn: z.string().max(1000).optional(),
  price: z.number().min(0.01, 'Preis muss größer als 0 sein').max(999.99, 'Preis zu hoch'),
  
  // Availability
  isAvailable: z.boolean().default(true),
  isSignature: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isSeasonalSpecial: z.boolean().default(false),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  
  // EU 14 Allergens
  containsGluten: z.boolean().default(false),
  containsMilk: z.boolean().default(false),
  containsEggs: z.boolean().default(false),
  containsNuts: z.boolean().default(false),
  containsFish: z.boolean().default(false),
  containsShellfish: z.boolean().default(false),
  containsSoy: z.boolean().default(false),
  containsCelery: z.boolean().default(false),
  containsMustard: z.boolean().default(false),
  containsSesame: z.boolean().default(false),
  containsSulfites: z.boolean().default(false),
  containsLupin: z.boolean().default(false),
  containsMollusks: z.boolean().default(false),
  containsPeanuts: z.boolean().default(false),
  
  // Dietary labels
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isLactoseFree: z.boolean().default(false),
  
  // Display
  displayOrder: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).max(5, 'Maximal 5 Bilder').default([]),
})

const updateMenuItemSchema = menuItemSchema.extend({
  id: z.string(),
})

type MenuItemFormData = z.infer<typeof menuItemSchema>
type UpdateMenuItemData = z.infer<typeof updateMenuItemSchema>

interface MenuItem {
  id: string
  categoryId: string
  name: string
  nameEn?: string
  description: string
  descriptionEn?: string
  price: number
  isAvailable: boolean
  isSignature: boolean
  isNew: boolean
  isSeasonalSpecial: boolean
  availableFrom?: string
  availableTo?: string
  
  // EU-14 Allergens
  containsGluten: boolean
  containsMilk: boolean
  containsEggs: boolean
  containsNuts: boolean
  containsFish: boolean
  containsShellfish: boolean
  containsSoy: boolean
  containsCelery: boolean
  containsMustard: boolean
  containsSesame: boolean
  containsSulfites: boolean
  containsLupin: boolean
  containsMollusks: boolean
  containsPeanuts: boolean
  
  // Dietary labels
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isLactoseFree: boolean
  
  displayOrder: number
  images: string[]
  
  category: {
    id: string
    name: string
    nameEn?: string
  }
}

interface Category {
  id: string
  name: string
  nameEn?: string
  isActive: boolean
}

interface ItemManagerProps {
  userRole: string
}

export function ItemManager({ userRole }: ItemManagerProps) {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dietaryFilter, setDietaryFilter] = useState<string>('all')
  const queryClient = useQueryClient()

  const canEdit = ['ADMIN', 'MANAGER', 'KITCHEN'].includes(userRole)

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['menu-categories-simple'],
    queryFn: async () => {
      const response = await fetch('/api/menu/categories?isActive=true')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    }
  })

  // Fetch menu items
  const { data: items = [], isLoading, error } = useQuery<MenuItem[]>({
    queryKey: ['menu-items', selectedCategory, searchQuery, dietaryFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.set('categoryId', selectedCategory)
      if (searchQuery) params.set('search', searchQuery)
      if (dietaryFilter === 'vegetarian') params.set('isVegetarian', 'true')
      if (dietaryFilter === 'vegan') params.set('isVegan', 'true')
      if (dietaryFilter === 'gluten-free') params.set('isGlutenFree', 'true')
      
      const response = await fetch(`/api/menu/items?${params}`)
      if (!response.ok) throw new Error('Failed to fetch items')
      return response.json()
    }
  })

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const response = await fetch('/api/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create item')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Gericht erfolgreich erstellt')
      setIsCreateDialogOpen(false)
      resetCreateForm()
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`)
    }
  })

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async (data: UpdateMenuItemData) => {
      const response = await fetch('/api/menu/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update item')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Gericht erfolgreich aktualisiert')
      setIsEditDialogOpen(false)
      setEditingItem(null)
      resetEditForm()
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`)
    }
  })

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/menu/items?id=${itemId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete item')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Gericht erfolgreich gelöscht')
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`)
    }
  })

  // Form handling
  const createForm = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      price: 0,
      isAvailable: true,
      isSignature: false,
      isNew: false,
      isSeasonalSpecial: false,
      availableFrom: '',
      availableTo: '',
      containsGluten: false,
      containsMilk: false,
      containsEggs: false,
      containsNuts: false,
      containsFish: false,
      containsShellfish: false,
      containsSoy: false,
      containsCelery: false,
      containsMustard: false,
      containsSesame: false,
      containsSulfites: false,
      containsLupin: false,
      containsMollusks: false,
      containsPeanuts: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isLactoseFree: false,
      displayOrder: 0,
      images: [],
    }
  })

  const editForm = useForm({
    resolver: zodResolver(updateMenuItemSchema),
  })

  const resetCreateForm = () => {
    createForm.reset()
  }

  const resetEditForm = () => {
    editForm.reset()
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    editForm.reset({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      nameEn: item.nameEn || '',
      description: item.description,
      descriptionEn: item.descriptionEn || '',
      price: item.price,
      isAvailable: item.isAvailable,
      isSignature: item.isSignature,
      isNew: item.isNew,
      isSeasonalSpecial: item.isSeasonalSpecial,
      availableFrom: item.availableFrom || '',
      availableTo: item.availableTo || '',
      containsGluten: item.containsGluten,
      containsMilk: item.containsMilk,
      containsEggs: item.containsEggs,
      containsNuts: item.containsNuts,
      containsFish: item.containsFish,
      containsShellfish: item.containsShellfish,
      containsSoy: item.containsSoy,
      containsCelery: item.containsCelery,
      containsMustard: item.containsMustard,
      containsSesame: item.containsSesame,
      containsSulfites: item.containsSulfites,
      containsLupin: item.containsLupin,
      containsMollusks: item.containsMollusks,
      containsPeanuts: item.containsPeanuts,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      isLactoseFree: item.isLactoseFree,
      displayOrder: item.displayOrder,
      images: item.images,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (itemId: string) => {
    deleteItemMutation.mutate(itemId)
  }

  const onCreateSubmit = (data: any) => {
    createItemMutation.mutate(data)
  }

  const onEditSubmit = (data: any) => {
    updateItemMutation.mutate(data)
  }

  const getItemAllergens = (item: MenuItem) => {
    return EU_ALLERGENS.filter(allergen => item[allergen.key as keyof MenuItem])
  }

  const getDietaryBadges = (item: MenuItem) => {
    const badges = []
    if (item.isVegetarian) badges.push({ label: 'Vegetarisch', variant: 'secondary' as const, icon: '🌱' })
    if (item.isVegan) badges.push({ label: 'Vegan', variant: 'secondary' as const, icon: '🌿' })
    if (item.isGlutenFree) badges.push({ label: 'Glutenfrei', variant: 'outline' as const, icon: '🌾' })
    if (item.isLactoseFree) badges.push({ label: 'Laktosefrei', variant: 'outline' as const, icon: '🥛' })
    return badges
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-destructive">
            Fehler beim Laden der Gerichte
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Menü-Gerichte</h3>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie alle Gerichte Ihrer Speisekarte
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Gerichte suchen..."
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
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Diät" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="vegetarian">Vegetarisch</SelectItem>
              <SelectItem value="vegan">Vegan</SelectItem>
              <SelectItem value="gluten-free">Glutenfrei</SelectItem>
            </SelectContent>
          </Select>
          
          {canEdit && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neues Gericht
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Neues Gericht erstellen</DialogTitle>
                </DialogHeader>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                      <TabsTrigger value="allergens">Allergene</TabsTrigger>
                      <TabsTrigger value="dietary">Diät-Labels</TabsTrigger>
                      <TabsTrigger value="availability">Verfügbarkeit</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="create-categoryId">Kategorie *</Label>
                          <Select onValueChange={(value) => createForm.setValue('categoryId', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategorie wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {createForm.formState.errors.categoryId && (
                            <p className="text-sm text-destructive mt-1">
                              {createForm.formState.errors.categoryId.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="create-price">Preis (€) *</Label>
                          <Input
                            id="create-price"
                            type="number"
                            step="0.01"
                            min="0"
                            max="999.99"
                            {...createForm.register('price', { valueAsNumber: true })}
                          />
                          {createForm.formState.errors.price && (
                            <p className="text-sm text-destructive mt-1">
                              {createForm.formState.errors.price.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="create-name">Name (Deutsch) *</Label>
                          <Input
                            id="create-name"
                            {...createForm.register('name')}
                            placeholder="z.B. Wiener Schnitzel"
                          />
                          {createForm.formState.errors.name && (
                            <p className="text-sm text-destructive mt-1">
                              {createForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="create-nameEn">Name (Englisch)</Label>
                          <Input
                            id="create-nameEn"
                            {...createForm.register('nameEn')}
                            placeholder="e.g. Viennese Schnitzel"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="create-description">Beschreibung (Deutsch) *</Label>
                          <Textarea
                            id="create-description"
                            {...createForm.register('description')}
                            placeholder="Detaillierte Beschreibung des Gerichts..."
                            rows={4}
                          />
                          {createForm.formState.errors.description && (
                            <p className="text-sm text-destructive mt-1">
                              {createForm.formState.errors.description.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="create-descriptionEn">Beschreibung (Englisch)</Label>
                          <Textarea
                            id="create-descriptionEn"
                            {...createForm.register('descriptionEn')}
                            placeholder="Detailed description of the dish..."
                            rows={4}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="allergens" className="space-y-4">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {EU_ALLERGENS.map((allergen) => (
                          <div key={allergen.key} className="flex items-center space-x-2 p-3 border rounded-lg">
                            <input
                              type="checkbox"
                              id={`create-${allergen.key}`}
                              {...createForm.register(allergen.key as keyof MenuItemFormData)}
                              className="rounded"
                            />
                            <Label htmlFor={`create-${allergen.key}`} className="flex items-center gap-2 cursor-pointer">
                              <span className="text-lg">{allergen.icon}</span>
                              <span className="text-sm">{allergen.label}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="dietary" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="create-isVegetarian"
                              {...createForm.register('isVegetarian')}
                              className="rounded"
                            />
                            <Label htmlFor="create-isVegetarian" className="flex items-center gap-2">
                              🌱 Vegetarisch
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="create-isVegan"
                              {...createForm.register('isVegan')}
                              className="rounded"
                            />
                            <Label htmlFor="create-isVegan" className="flex items-center gap-2">
                              🌿 Vegan
                            </Label>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="create-isGlutenFree"
                              {...createForm.register('isGlutenFree')}
                              className="rounded"
                            />
                            <Label htmlFor="create-isGlutenFree" className="flex items-center gap-2">
                              🌾 Glutenfrei
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="create-isLactoseFree"
                              {...createForm.register('isLactoseFree')}
                              className="rounded"
                            />
                            <Label htmlFor="create-isLactoseFree" className="flex items-center gap-2">
                              🥛 Laktosefrei
                            </Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="availability" className="space-y-4">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="create-isAvailable"
                            {...createForm.register('isAvailable')}
                            className="rounded"
                          />
                          <Label htmlFor="create-isAvailable">Verfügbar</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="create-isSignature"
                            {...createForm.register('isSignature')}
                            className="rounded"
                          />
                          <Label htmlFor="create-isSignature">Signature Gericht</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="create-isNew"
                            {...createForm.register('isNew')}
                            className="rounded"
                          />
                          <Label htmlFor="create-isNew">Neu</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="create-isSeasonalSpecial"
                            {...createForm.register('isSeasonalSpecial')}
                            className="rounded"
                          />
                          <Label htmlFor="create-isSeasonalSpecial">Saisonspecial</Label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="create-availableFrom">Verfügbar von</Label>
                          <Input
                            id="create-availableFrom"
                            type="date"
                            {...createForm.register('availableFrom')}
                          />
                        </div>
                        <div>
                          <Label htmlFor="create-availableTo">Verfügbar bis</Label>
                          <Input
                            id="create-availableTo"
                            type="date"
                            {...createForm.register('availableTo')}
                          />
                        </div>
                        <div>
                          <Label htmlFor="create-displayOrder">Reihenfolge</Label>
                          <Input
                            id="create-displayOrder"
                            type="number"
                            min="0"
                            {...createForm.register('displayOrder', { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Abbrechen
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createItemMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {createItemMutation.isPending ? 'Erstelle...' : 'Erstellen'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => {
          const allergens = getItemAllergens(item)
          const dietaryBadges = getDietaryBadges(item)
          
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {item.isSignature && <Star className="h-4 w-4 text-yellow-500" />}
                      {item.isNew && <Badge variant="destructive" className="text-xs">NEU</Badge>}
                    </div>
                    {item.nameEn && (
                      <p className="text-sm text-muted-foreground">{item.nameEn}</p>
                    )}
                    <Badge variant="outline" className="mt-1">
                      {item.category.name}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{item.price.toFixed(2)}</span>
                    </div>
                    {item.isAvailable ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                
                {/* Dietary Badges */}
                {dietaryBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dietaryBadges.map((badge, index) => (
                      <Badge key={index} variant={badge.variant} className="text-xs">
                        {badge.icon} {badge.label}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Allergens */}
                {allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-xs text-orange-600">
                      Enthält: {allergens.map(a => a.icon).join(' ')}
                    </span>
                  </div>
                )}
                
                {canEdit && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Bearbeiten
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Gericht löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sind Sie sicher, dass Sie das Gericht &quot;{item.name}&quot; löschen möchten? 
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Gerichte gefunden</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'all' || dietaryFilter !== 'all'
                  ? 'Versuchen Sie andere Suchkriterien.'
                  : 'Erstellen Sie Ihr erstes Gericht, um zu beginnen.'
                }
              </p>
              {canEdit && !searchQuery && selectedCategory === 'all' && dietaryFilter === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erstes Gericht erstellen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}