'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye,
  BarChart3,
  LayoutGrid,
  AlertCircle,
  Settings,
  QrCode
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
    router.push(`/dashboard/tische?${params.toString()}`)
    
    // Call optional callback
    onTabChange?.(value)
  }

  return (
    <TabsList className="grid w-full grid-cols-6">
      <TabsTrigger value="overview" onClick={() => handleTabChange('overview')}>
        <Eye className="h-4 w-4 mr-2" />
        Übersicht
      </TabsTrigger>
      <TabsTrigger value="analytics" onClick={() => handleTabChange('analytics')}>
        <BarChart3 className="h-4 w-4 mr-2" />
        Analytics
      </TabsTrigger>
      <TabsTrigger value="floorplan" onClick={() => handleTabChange('floorplan')}>
        <LayoutGrid className="h-4 w-4 mr-2" />
        Grundriss
      </TabsTrigger>
      <TabsTrigger value="status" onClick={() => handleTabChange('status')}>
        <AlertCircle className="h-4 w-4 mr-2" />
        Status
      </TabsTrigger>
      <TabsTrigger value="configuration" onClick={() => handleTabChange('configuration')}>
        <Settings className="h-4 w-4 mr-2" />
        Konfiguration
      </TabsTrigger>
      <TabsTrigger value="qrcodes" onClick={() => handleTabChange('qrcodes')}>
        <QrCode className="h-4 w-4 mr-2" />
        QR-Codes
      </TabsTrigger>
    </TabsList>
  )
}