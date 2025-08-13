'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Eye, 
  EyeOff,
  Package,
  Save,
  X
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Validation schemas based on existing patterns
const categorySchema = z.object({
  name: z.string().min(1, 'Kategoriename ist erforderlich').max(100),
  nameEn: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  icon: z.string().max(50).optional(),
})

const updateCategorySchema = categorySchema.extend({
  id: z.string(),
})

type CategoryFormData = z.infer<typeof categorySchema>
type UpdateCategoryData = z.infer<typeof updateCategorySchema>

interface Category {
  id: string
  name: string
  nameEn?: string
  description?: string
  descriptionEn?: string
  displayOrder: number
  isActive: boolean
  icon?: string
  _count: {
    menuItems: number
  }
  menuItems?: Array<{
    id: string
    name: string
    price: number
    isAvailable: boolean
    isSignature: boolean
  }>
}

interface CategoryManagerProps {
  userRole: string
}

export function CategoryManager({ userRole }: CategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  const canEdit = ['ADMIN', 'MANAGER'].includes(userRole)

  // Fetch categories
  const { data: categories = [], isLoading, error } = useQuery<Category[]>({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const response = await fetch('/api/menu/categories?includeItems=true')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    }
  })

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create category')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
      toast.success('Kategorie erfolgreich erstellt')
      setIsCreateDialogOpen(false)
      resetCreateForm()
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`)
    }
  })

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (data: UpdateCategoryData) => {
      const response = await fetch('/api/menu/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update category')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
      toast.success('Kategorie erfolgreich aktualisiert')
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      resetEditForm()
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`)
    }
  })

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch(`/api/menu/categories?id=${categoryId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
      toast.success('Kategorie erfolgreich gelöscht')
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`)
    }
  })

  // Form handling for create
  const createForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      displayOrder: 0,
      isActive: true,
      icon: '',
    }
  })

  // Form handling for edit
  const editForm = useForm({
    resolver: zodResolver(updateCategorySchema),
  })

  const resetCreateForm = () => {
    createForm.reset()
  }

  const resetEditForm = () => {
    editForm.reset()
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    editForm.reset({
      id: category.id,
      name: category.name,
      nameEn: category.nameEn || '',
      description: category.description || '',
      descriptionEn: category.descriptionEn || '',
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      icon: category.icon || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId)
  }

  const onCreateSubmit = (data: any) => {
    createCategoryMutation.mutate(data)
  }

  const onEditSubmit = (data: any) => {
    updateCategoryMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-destructive">
            Fehler beim Laden der Kategorien
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Menü-Kategorien</h3>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie die Kategorien Ihrer Speisekarte
          </p>
        </div>
        {canEdit && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neue Kategorie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neue Kategorie erstellen</DialogTitle>
              </DialogHeader>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name (Deutsch) *</Label>
                    <Input
                      id="name"
                      {...createForm.register('name')}
                      placeholder="z.B. Vorspeisen"
                    />
                    {createForm.formState.errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {createForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="nameEn">Name (Englisch)</Label>
                    <Input
                      id="nameEn"
                      {...createForm.register('nameEn')}
                      placeholder="e.g. Appetizers"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description">Beschreibung (Deutsch)</Label>
                    <Textarea
                      id="description"
                      {...createForm.register('description')}
                      placeholder="Beschreibung der Kategorie..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionEn">Beschreibung (Englisch)</Label>
                    <Textarea
                      id="descriptionEn"
                      {...createForm.register('descriptionEn')}
                      placeholder="Category description..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="displayOrder">Reihenfolge</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      min="0"
                      {...createForm.register('displayOrder', { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Input
                      id="icon"
                      {...createForm.register('icon')}
                      placeholder="z.B. utensils"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        {...createForm.register('isActive')}
                        className="rounded"
                      />
                      <Label htmlFor="isActive">Aktiv</Label>
                    </div>
                  </div>
                </div>

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
                    disabled={createCategoryMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createCategoryMutation.isPending ? 'Erstelle...' : 'Erstellen'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    {category.nameEn && (
                      <p className="text-sm text-muted-foreground">{category.nameEn}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {category.isActive ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <Badge variant={category.isActive ? 'default' : 'secondary'}>
                    {category._count.menuItems} Gerichte
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Reihenfolge: {category.displayOrder}</span>
                  {category.icon && <span>Icon: {category.icon}</span>}
                </div>

                {canEdit && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(category)}
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
                          disabled={category._count.menuItems > 0}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Kategorie löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sind Sie sicher, dass Sie die Kategorie &quot;{category.name}&quot; löschen möchten? 
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kategorie bearbeiten</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name (Deutsch) *</Label>
                  <Input
                    id="edit-name"
                    {...editForm.register('name')}
                    placeholder="z.B. Vorspeisen"
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {editForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-nameEn">Name (Englisch)</Label>
                  <Input
                    id="edit-nameEn"
                    {...editForm.register('nameEn')}
                    placeholder="e.g. Appetizers"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-description">Beschreibung (Deutsch)</Label>
                  <Textarea
                    id="edit-description"
                    {...editForm.register('description')}
                    placeholder="Beschreibung der Kategorie..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-descriptionEn">Beschreibung (Englisch)</Label>
                  <Textarea
                    id="edit-descriptionEn"
                    {...editForm.register('descriptionEn')}
                    placeholder="Category description..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-displayOrder">Reihenfolge</Label>
                  <Input
                    id="edit-displayOrder"
                    type="number"
                    min="0"
                    {...editForm.register('displayOrder', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-icon">Icon</Label>
                  <Input
                    id="edit-icon"
                    {...editForm.register('icon')}
                    placeholder="z.B. utensils"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      {...editForm.register('isActive')}
                      className="rounded"
                    />
                    <Label htmlFor="edit-isActive">Aktiv</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingCategory(null)
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Abbrechen
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateCategoryMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateCategoryMutation.isPending ? 'Speichere...' : 'Speichern'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {categories.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Kategorien gefunden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Ihre erste Menü-Kategorie, um zu beginnen.
              </p>
              {canEdit && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Kategorie erstellen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}