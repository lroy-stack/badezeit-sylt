'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye,
  Package,
  Utensils,
  ShieldAlert,
  Camera,
  Settings
} from 'lucide-react'

interface TabsNavigationProps {
  currentTab: string
  onTabChange?: (tab: string) => void
}

export function TabsNavigation({ currentTab, onTabChange }: TabsNavigationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (value: string) => {
    // Update URL with new tab
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`/dashboard/speisekarte?${params.toString()}`)
    
    // Call optional callback
    onTabChange?.(value)
  }

  return (
    <TabsList className="grid w-full grid-cols-6">
      <TabsTrigger value="overview" onClick={() => handleTabChange('overview')}>
        <Eye className="h-4 w-4 mr-2" />
        Übersicht
      </TabsTrigger>
      <TabsTrigger value="categories" onClick={() => handleTabChange('categories')}>
        <Package className="h-4 w-4 mr-2" />
        Kategorien
      </TabsTrigger>
      <TabsTrigger value="items" onClick={() => handleTabChange('items')}>
        <Utensils className="h-4 w-4 mr-2" />
        Gerichte
      </TabsTrigger>
      <TabsTrigger value="allergens" onClick={() => handleTabChange('allergens')}>
        <ShieldAlert className="h-4 w-4 mr-2" />
        Allergene
      </TabsTrigger>
      <TabsTrigger value="photos" onClick={() => handleTabChange('photos')}>
        <Camera className="h-4 w-4 mr-2" />
        Fotos
      </TabsTrigger>
      <TabsTrigger value="settings" onClick={() => handleTabChange('settings')}>
        <Settings className="h-4 w-4 mr-2" />
        Einstellungen
      </TabsTrigger>
    </TabsList>
  )
}