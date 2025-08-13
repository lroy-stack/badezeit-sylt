'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  MoreVertical,
  Edit,
  Star,
  StarOff,
  Mail,
  Download,
  Shield,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  isVip: boolean
  emailConsent: boolean
}

interface CustomerActionsProps {
  customer: Customer
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const toggleVipStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isVip: !customer.isVip
        })
      })

      if (response.ok) {
        toast.success(
          customer.isVip 
            ? 'VIP-Status entfernt' 
            : 'VIP-Status gewährt'
        )
        router.refresh()
      } else {
        toast.error('Fehler beim Aktualisieren des VIP-Status')
      }
    } catch (error) {
      console.error('Failed to toggle VIP status:', error)
      toast.error('Fehler beim Aktualisieren des VIP-Status')
    } finally {
      setIsLoading(false)
    }
  }

  const sendWelcomeEmail = async () => {
    if (!customer.emailConsent) {
      toast.error('Kunde hat E-Mail-Kommunikation nicht zugestimmt')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/customers/${customer.id}/welcome-email`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Willkommens-E-Mail wurde gesendet!')
      } else {
        toast.error('Fehler beim Senden der E-Mail')
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      toast.error('Fehler beim Senden der E-Mail')
    } finally {
      setIsLoading(false)
    }
  }

  const exportCustomerData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customers/${customer.id}/export`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `kunde-${customer.firstName}-${customer.lastName}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Kundendaten wurden exportiert')
      } else {
        toast.error('Fehler beim Exportieren der Daten')
      }
    } catch (error) {
      console.error('Failed to export customer data:', error)
      toast.error('Fehler beim Exportieren der Daten')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCustomer = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Kunde wurde erfolgreich gelöscht')
        router.push('/dashboard/kunden')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Fehler beim Löschen des Kunden')
      }
    } catch (error) {
      console.error('Failed to delete customer:', error)
      toast.error('Fehler beim Löschen des Kunden')
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => router.push(`/dashboard/kunden/${customer.id}/bearbeiten`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={toggleVipStatus}>
            {customer.isVip ? (
              <StarOff className="h-4 w-4 mr-2" />
            ) : (
              <Star className="h-4 w-4 mr-2" />
            )}
            {customer.isVip ? 'VIP-Status entfernen' : 'Als VIP markieren'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {customer.emailConsent && (
            <DropdownMenuItem onClick={sendWelcomeEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Willkommens-E-Mail senden
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={exportCustomerData}>
            <Download className="h-4 w-4 mr-2" />
            Daten exportieren
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => router.push(`/dashboard/kunden/${customer.id}/gdpr`)}
          >
            <Shield className="h-4 w-4 mr-2" />
            GDPR verwalten
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Kunde löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kunde wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten von{' '}
              <strong>{customer.firstName} {customer.lastName}</strong> werden 
              permanent gelöscht, einschließlich aller Reservierungen und Notizen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCustomer}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Wird gelöscht...' : 'Endgültig löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}