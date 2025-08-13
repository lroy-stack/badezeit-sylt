'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Reservation {
  id: string
  status: string
  dateTime: string | Date
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }
}

interface ReservationActionsProps {
  reservation: Reservation
  userRole: string
}

export function ReservationActions({ reservation, userRole }: ReservationActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const canModify = ['ADMIN', 'MANAGER'].includes(userRole)
  const canConfirm = ['ADMIN', 'MANAGER', 'STAFF'].includes(userRole)
  const reservationDateTime = new Date(reservation.dateTime)
  const isPastReservation = reservationDateTime < new Date()
  
  const updateReservationStatus = async (status: string, additionalData?: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData })
      })
      
      if (response.ok) {
        toast.success('Reservierungsstatus erfolgreich aktualisiert')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Fehler beim Aktualisieren')
      }
    } catch (error) {
      toast.error('Netzwerkfehler beim Aktualisieren')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleConfirm = () => {
    updateReservationStatus('CONFIRMED', { 
      isConfirmed: true, 
      confirmationSentAt: new Date().toISOString() 
    })
  }
  
  const handleSeatGuests = () => {
    updateReservationStatus('SEATED', { 
      checkedInAt: new Date().toISOString() 
    })
  }
  
  const handleComplete = () => {
    updateReservationStatus('COMPLETED', { 
      completedAt: new Date().toISOString() 
    })
  }
  
  const handleCancel = () => {
    const reason = prompt('Grund für die Stornierung (optional):')
    updateReservationStatus('CANCELLED', { 
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason || undefined
    })
  }
  
  const handleNoShow = () => {
    updateReservationStatus('NO_SHOW', { 
      cancelledAt: new Date().toISOString(),
      cancellationReason: 'Kunde nicht erschienen'
    })
  }
  
  const handleSendReminder = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/reminder`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Erinnerung erfolgreich gesendet')
        router.refresh()
      } else {
        toast.error('Fehler beim Senden der Erinnerung')
      }
    } catch (error) {
      toast.error('Netzwerkfehler')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Aktionen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status-specific actions */}
        {reservation.status === 'PENDING' && canConfirm && (
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Bestätigen
          </Button>
        )}
        
        {reservation.status === 'CONFIRMED' && canConfirm && !isPastReservation && (
          <Button 
            onClick={handleSeatGuests} 
            disabled={isLoading}
            className="w-full"
          >
            <Users className="h-4 w-4 mr-2" />
            Gäste eingecheckt
          </Button>
        )}
        
        {reservation.status === 'SEATED' && canConfirm && (
          <Button 
            onClick={handleComplete} 
            disabled={isLoading}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Abschließen
          </Button>
        )}
        
        {/* Communication actions */}
        {['PENDING', 'CONFIRMED'].includes(reservation.status) && (
          <>
            <Button 
              variant="outline" 
              onClick={handleSendReminder}
              disabled={isLoading || isPastReservation}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Erinnerung senden
            </Button>
            
            {reservation.customer.phone && (
              <Button 
                variant="outline" 
                onClick={() => window.open(`tel:${reservation.customer.phone}`)}
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                Anrufen
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => window.open(`mailto:${reservation.customer.email}`)}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              E-Mail senden
            </Button>
          </>
        )}
        
        {/* Modification actions */}
        {canModify && !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(reservation.status) && (
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/reservierungen/${reservation.id}/bearbeiten`)}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        )}
        
        {/* Cancellation actions */}
        {['PENDING', 'CONFIRMED'].includes(reservation.status) && (
          <div className="pt-2 border-t space-y-2">
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Stornieren
            </Button>
            
            {isPastReservation && reservation.status !== 'NO_SHOW' && (
              <Button 
                variant="destructive" 
                onClick={handleNoShow}
                disabled={isLoading}
                className="w-full"
                size="sm"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                No-Show markieren
              </Button>
            )}
          </div>
        )}
        
        {/* Delete action for admins only */}
        {userRole === 'ADMIN' && ['CANCELLED', 'NO_SHOW'].includes(reservation.status) && (
          <div className="pt-2 border-t">
            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirm('Sind Sie sicher, dass Sie diese Reservierung permanent löschen möchten?')) {
                  // Implement delete functionality
                  console.log('Delete reservation', reservation.id)
                }
              }}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Dauerhaft löschen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
