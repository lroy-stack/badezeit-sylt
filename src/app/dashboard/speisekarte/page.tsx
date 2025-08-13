// Force dynamic rendering for authenticated route
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  ChefHat,
  Package,
  Plus,
  Settings,
  Upload,
  Filter,
  Eye,
  DollarSign,
  Star,
  Users,
  Utensils,
  Camera
} from 'lucide-react'
import Link from 'next/link'
import { CategoryManager } from './components/category-manager'
import { ItemManager } from './components/item-manager'
import { TabsNavigation } from './components/tabs-navigation'
import { AllergenManager } from './components/allergen-manager'
import { PhotoManager } from './components/photo-manager'
import { MenuSettingsManager } from './components/menu-settings-manager'

interface MenuPageProps {
  searchParams: Promise<{
    tab?: string
    category?: string
    status?: string
    dietary?: string
  }>
}

async function getMenuStats() {
  const [
    totalItems,
    totalCategories,
    availableItems,
    signatureItems,
    menuItemsCount,
    categoriesWithItems
  ] = await Promise.all([
    db.menuItem.count(),
    db.menuCategory.count(),
    db.menuItem.count({ where: { isAvailable: true } }),
    db.menuItem.count({ where: { isSignature: true } }),
    db.menuItem.groupBy({
      by: ['categoryId'],
      _count: true
    }),
    db.menuCategory.findMany({
      include: {
        _count: {
          select: {
            menuItems: true
          }
        }
      }
    })
  ])

  const averagePrice = await db.menuItem.aggregate({
    _avg: { price: true },
    where: { isAvailable: true }
  })

  return {
    totalItems,
    totalCategories,
    availableItems,
    unavailableItems: totalItems - availableItems,
    signatureItems,
    averagePrice: averagePrice._avg.price || 0,
    categoriesWithItems: categoriesWithItems.length,
    emptyCategories: totalCategories - categoriesWithItems.length
  }
}

async function getMenuCategories() {
  return await db.menuCategory.findMany({
    include: {
      menuItems: {
        select: {
          id: true,
          name: true,
          price: true,
          isAvailable: true,
          isSignature: true
        },
        orderBy: { displayOrder: 'asc' }
      },
      _count: {
        select: {
          menuItems: true
        }
      }
    },
    orderBy: { displayOrder: 'asc' }
  })
}

function MenuStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Utensils className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gerichte gesamt</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kategorien</p>
              <p className="text-2xl font-bold">{stats.totalCategories}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Signature Gerichte</p>
              <p className="text-2xl font-bold">{stats.signatureItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durchschnittspreis</p>
              <p className="text-2xl font-bold">{Number(stats.averagePrice).toFixed(2)}€</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function HeaderActions({ userRole }: { userRole: string }) {
  const canEdit = ['ADMIN', 'MANAGER'].includes(userRole)
  const canManagePhotos = ['ADMIN', 'MANAGER'].includes(userRole)

  return (
    <div className="flex items-center gap-2">
      {canManagePhotos && (
        <Button variant="outline" size="sm">
          <Camera className="h-4 w-4 mr-2" />
          Fotos verwalten
        </Button>
      )}
      {canEdit && (
        <>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Neues Gericht
          </Button>
        </>
      )}
    </div>
  )
}


function MenuOverview({ categories }: { categories: any[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kategorien-Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{category.name}</h4>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category._count.menuItems} Gerichte
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.description || 'Keine Beschreibung'}
                  </p>
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>
                      Verfügbar: {category.menuItems.filter((item: any) => item.isAvailable).length}
                    </span>
                    <span>
                      Signature: {category.menuItems.filter((item: any) => item.isSignature).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MenuLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded animate-pulse w-48" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default async function SpeisekartenPage({ searchParams }: MenuPageProps) {
  const user = await requireRole(['ADMIN', 'MANAGER', 'KITCHEN'])
  const params = await searchParams
  
  const [categories, stats] = await Promise.all([
    getMenuCategories(),
    getMenuStats()
  ])

  const currentTab = params?.tab || 'overview'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Speisekartenverwaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Menükategorien, Gerichte und Allergene für optimale Gästebetreuung
          </p>
        </div>
        
        <HeaderActions userRole={user.role} />
      </div>

      {/* Stats */}
      <Suspense fallback={<div className="h-24 bg-muted rounded animate-pulse" />}>
        <MenuStats stats={stats} />
      </Suspense>

      {/* Main Content */}
      <Tabs value={currentTab} className="space-y-6">
        <TabsNavigation currentTab={currentTab} />

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<MenuLoading />}>
            <MenuOverview categories={categories} />
          </Suspense>
        </TabsContent>

        <TabsContent value="categories">
          <Suspense fallback={<MenuLoading />}>
            <CategoryManager userRole={user.role} />
          </Suspense>
        </TabsContent>

        <TabsContent value="items">
          <Suspense fallback={<MenuLoading />}>
            <ItemManager userRole={user.role} />
          </Suspense>
        </TabsContent>

        <TabsContent value="allergens">
          <Suspense fallback={<MenuLoading />}>
            <AllergenManager userRole={user.role} />
          </Suspense>
        </TabsContent>

        <TabsContent value="photos">
          <Suspense fallback={<MenuLoading />}>
            <PhotoManager userRole={user.role} />
          </Suspense>
        </TabsContent>

        <TabsContent value="settings">
          <Suspense fallback={<MenuLoading />}>
            <MenuSettingsManager userRole={user.role} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}