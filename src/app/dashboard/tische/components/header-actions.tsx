'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BarChart3, QrCode, Plus } from 'lucide-react'
import Link from 'next/link'

interface HeaderActionsProps {
  userRole: 'ADMIN' | 'MANAGER' | 'STAFF' | 'KITCHEN'
}

export function HeaderActions({ userRole }: HeaderActionsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`/dashboard/tische?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
        <>
          <Button variant="outline" onClick={() => navigateToTab('analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" onClick={() => navigateToTab('qrcodes')}>
            <QrCode className="h-4 w-4 mr-2" />
            QR-Codes
          </Button>
        </>
      )}
      <Button asChild>
        <Link href="/dashboard/reservierungen/neu">
          <Plus className="h-4 w-4 mr-2" />
          Neue Reservierung
        </Link>
      </Button>
    </div>
  )
}