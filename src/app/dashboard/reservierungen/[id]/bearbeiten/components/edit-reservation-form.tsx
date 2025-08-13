'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Save,
  Calendar,
  Clock,
  Users,
  Table,
  MapPin,
  AlertTriangle,
  Mail,
  CheckCircle,
  XCircle,
  UserCheck,
  Ban
} from 'lucide-react'
import { format, addDays, startOfDay, setHours, setMinutes, isBefore } from 'date-fns'
import { de } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Table {
  id: string
  number: number
  capacity: number
  location: string
  description: string | null
  shape: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  language: string
  preferredTime: string | null
  preferredLocation: string | null
  dietaryRestrictions: string[] | null
  allergies: string | null
  isVip: boolean
  emailConsent: boolean
  marketingConsent: boolean
  dataProcessingConsent: boolean
}

interface User {
  id: string
  firstName: string | null
  lastName: string | null
  role: string
}

interface Reservation {
  id: string
  customerId: string
  customer: Customer
  tableId: string | null
  table: Table | null
  dateTime: Date
  partySize: number
  duration: number
  status: string
  specialRequests: string | null
  occasion: string | null
  dietaryNotes: string | null
  isConfirmed: boolean
  confirmationSentAt: Date | null
  reminderSentAt: Date | null
  checkedInAt: Date | null
  completedAt: Date | null
  cancelledAt: Date | null
  cancellationReason: string | null
  source: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
  createdById: string
  updatedById: string | null
}

interface EditReservationFormProps {
  reservation: Reservation
  tables: Table[]
  currentUser: User
  canEdit: boolean
}

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const DURATIONS = [60, 90, 120, 150, 180, 210, 240]
const TABLE_LOCATIONS = {
  TERRACE: 'Terrasse',
  INDOOR: 'Innenbereich', 
  BAR: 'Bar',
  PRIVATE: 'Separé'
}

const RESERVATION_STATUSES = {
  PENDING: { label: 'Wartend auf Bestätigung', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Bestätigt', color: 'bg-green-100 text-green-800' },
  SEATED: { label: 'Gäste eingetroffen', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Abgeschlossen', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'Storniert', color: 'bg-red-100 text-red-800' },
  NO_SHOW: { label: 'Nicht erschienen', color: 'bg-red-100 text-red-800' }
}

export function EditReservationForm({
  reservation,
  tables,
  currentUser,
  canEdit
}: EditReservationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Form state
  const [formData, setFormData] = useState({
    dateTime: reservation.dateTime,
    partySize: reservation.partySize,
    duration: reservation.duration,
    tableId: reservation.tableId || '',
    status: reservation.status,
    specialRequests: reservation.specialRequests || '',
    occasion: reservation.occasion || '',
    dietaryNotes: reservation.dietaryNotes || '',
    notes: reservation.notes || '',
    cancellationReason: reservation.cancellationReason || ''
  })

  // Available tables based on party size and time
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [showCancellationReason, setShowCancellationReason] = useState(
    reservation.status === 'CANCELLED' || reservation.status === 'NO_SHOW'
  )

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    const openHour = 17 // 5 PM
    const closeHour = 23 // 11 PM
    const slotInterval = 30 // 30 minutes

    const timeSlots = []
    let currentHour = openHour
    let currentMinute = 0

    while (currentHour < closeHour || (currentHour === closeHour && currentMinute === 0)) {
      const timeSlot = setMinutes(setHours(startOfDay(formData.dateTime), currentHour), currentMinute)
      timeSlots.push(timeSlot)
      
      currentMinute += slotInterval
      if (currentMinute >= 60) {
        currentMinute = 0
        currentHour++
      }
    }

    return timeSlots
  }

  const timeSlots = generateTimeSlots()

  // Check table availability
  const checkTableAvailability = async () => {
    setIsCheckingAvailability(true)
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: formData.dateTime.toISOString(),
          duration: formData.duration,
          partySize: formData.partySize,
          excludeReservationId: reservation.id // Exclude current reservation from conflict check
        })
      })

      if (response.ok) {
        const { availableTables: available } = await response.json()
        const filteredTables = tables.filter(table => 
          available.some((avail: any) => avail.id === table.id) &&
          table.capacity >= formData.partySize
        )
        setAvailableTables(filteredTables)
      }
    } catch (error) {
      console.error('Availability check failed:', error)
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setFormData(prev => ({ ...prev, status: newStatus }))
    
    if (newStatus === 'CANCELLED' || newStatus === 'NO_SHOW') {
      setShowCancellationReason(true)
    } else {
      setShowCancellationReason(false)
      setFormData(prev => ({ ...prev, cancellationReason: '' }))
    }
  }

  // Send confirmation email
  const sendConfirmationEmail = async () => {
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/confirm`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Bestätigungs-E-Mail wurde gesendet!')
      } else {
        toast.error('Fehler beim Senden der Bestätigungs-E-Mail')
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
      toast.error('Fehler beim Senden der Bestätigungs-E-Mail')
    }
  }

  // Send reminder email
  const sendReminderEmail = async () => {
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/reminder`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Erinnerungs-E-Mail wurde gesendet!')
      } else {
        toast.error('Fehler beim Senden der Erinnerungs-E-Mail')
      }
    } catch (error) {
      console.error('Failed to send reminder email:', error)
      toast.error('Fehler beim Senden der Erinnerungs-E-Mail')
    }
  }

  // Submit form
  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        const updateData = {
          ...formData,
          updatedById: currentUser.id
        }

        const response = await fetch(`/api/reservations/${reservation.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })

        if (response.ok) {
          toast.success('Reservierung wurde erfolgreich aktualisiert!')
          router.push(`/dashboard/reservierungen/${reservation.id}`)
          router.refresh()
        } else {
          const error = await response.json()
          toast.error(error.message || 'Fehler beim Aktualisieren der Reservierung')
        }
      } catch (error) {
        console.error('Reservation update failed:', error)
        toast.error('Fehler beim Aktualisieren der Reservierung')
      }
    })
  }

  // Effects
  useEffect(() => {
    checkTableAvailability()
  }, [formData.dateTime, formData.partySize, formData.duration])

  const hasChanges = JSON.stringify(formData) !== JSON.stringify({
    dateTime: reservation.dateTime,
    partySize: reservation.partySize,
    duration: reservation.duration,
    tableId: reservation.tableId || '',
    status: reservation.status,
    specialRequests: reservation.specialRequests || '',
    occasion: reservation.occasion || '',
    dietaryNotes: reservation.dietaryNotes || '',
    notes: reservation.notes || '',
    cancellationReason: reservation.cancellationReason || ''
  })

  const isPastReservation = isBefore(reservation.dateTime, new Date())

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {reservation.customer.emailConsent && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendConfirmationEmail}
                  disabled={isPending}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Bestätigung senden
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendReminderEmail}
                  disabled={isPending || isPastReservation}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Erinnerung senden
                </Button>
              </>
            )}
            
            {canEdit && formData.status === 'CONFIRMED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('SEATED')}
                disabled={isPending}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Als eingecheckt markieren
              </Button>
            )}
            
            {canEdit && formData.status === 'SEATED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Als abgeschlossen markieren
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Reservierungsdetails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={format(formData.dateTime, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = new Date(e.target.value + 'T' + format(formData.dateTime, 'HH:mm'))
                  setFormData(prev => ({ ...prev, dateTime: newDate }))
                }}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Uhrzeit</Label>
              <Select 
                value={format(formData.dateTime, 'HH:mm')}
                onValueChange={(value) => {
                  const [hours, minutes] = value.split(':').map(Number)
                  const newDateTime = new Date(formData.dateTime)
                  newDateTime.setHours(hours, minutes, 0, 0)
                  setFormData(prev => ({ ...prev, dateTime: newDateTime }))
                }}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot.toISOString()} value={format(slot, 'HH:mm')}>
                      {format(slot, 'HH:mm')} Uhr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Party Size & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partySize">Personenanzahl</Label>
              <Select 
                value={formData.partySize.toString()}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  partySize: parseInt(value)
                }))}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARTY_SIZES.map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} {size === 1 ? 'Person' : 'Personen'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Dauer (Minuten)</Label>
              <Select 
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  duration: parseInt(value)
                }))}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map(duration => (
                    <SelectItem key={duration} value={duration.toString()}>
                      {duration} Min ({Math.floor(duration / 60)}:{duration % 60 === 0 ? '00' : duration % 60} Std.)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status}
              onValueChange={handleStatusChange}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RESERVATION_STATUSES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.color.includes('yellow') ? 'bg-yellow-500' : 
                        config.color.includes('green') ? 'bg-green-500' :
                        config.color.includes('blue') ? 'bg-blue-500' :
                        config.color.includes('gray') ? 'bg-gray-500' : 'bg-red-500'}`} 
                      />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cancellation Reason */}
          {showCancellationReason && (
            <div className="space-y-2">
              <Label htmlFor="cancellationReason">Stornierungsgrund</Label>
              <Textarea 
                id="cancellationReason"
                placeholder="Grund für die Stornierung oder das Nichterscheinen..."
                value={formData.cancellationReason}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cancellationReason: e.target.value
                }))}
                disabled={!canEdit}
              />
            </div>
          )}

          <Separator />

          {/* Table Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tischzuteilung</Label>
              {isCheckingAvailability && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Verfügbarkeit wird geprüft...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* No Table Option */}
              <div
                className={cn(
                  "p-4 border-2 rounded-lg cursor-pointer transition-colors",
                  formData.tableId === '' 
                    ? "border-primary bg-primary/5" 
                    : "border-muted hover:border-primary/50",
                  !canEdit && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => canEdit && setFormData(prev => ({ ...prev, tableId: '' }))}
              >
                <div className="text-center">
                  <p className="font-medium">Kein Tisch zugewiesen</p>
                  <p className="text-sm text-muted-foreground">Automatische Zuteilung</p>
                </div>
              </div>

              {/* Available Tables */}
              {availableTables.map(table => (
                <div
                  key={table.id}
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    formData.tableId === table.id 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/50",
                    !canEdit && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => canEdit && setFormData(prev => ({ ...prev, tableId: table.id }))}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Tisch {table.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {table.capacity} Personen • {TABLE_LOCATIONS[table.location as keyof typeof TABLE_LOCATIONS]}
                      </p>
                      {table.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {table.description}
                        </p>
                      )}
                    </div>
                    <div className="p-1 rounded-full border">
                      <MapPin className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Current Table (if not available) */}
              {reservation.table && !availableTables.find(t => t.id === reservation.table?.id) && (
                <div
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    formData.tableId === reservation.table.id 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-orange-300 hover:border-orange-500",
                    !canEdit && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => canEdit && setFormData(prev => ({ ...prev, tableId: reservation.table!.id }))}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Tisch {reservation.table.number}</p>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      </div>
                      <p className="text-sm text-orange-600">
                        Aktuell zugewiesen, aber Konflikt möglich
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.table.capacity} Personen • {TABLE_LOCATIONS[reservation.table.location as keyof typeof TABLE_LOCATIONS]}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {availableTables.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                <p>Keine Tische für diese Zeit und Personenzahl verfügbar.</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="occasion">Anlass</Label>
              <Input 
                id="occasion"
                placeholder="z.B. Geburtstag, Jubiläum..."
                value={formData.occasion}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  occasion: e.target.value
                }))}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">Besondere Wünsche</Label>
            <Textarea 
              id="specialRequests"
              placeholder="Besondere Wünsche des Gastes..."
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                specialRequests: e.target.value
              }))}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietaryNotes">Diät-Hinweise / Allergien</Label>
            <Textarea 
              id="dietaryNotes"
              placeholder="Allergien, Diätanforderungen..."
              value={formData.dietaryNotes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                dietaryNotes: e.target.value
              }))}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Interne Notizen</Label>
            <Textarea 
              id="notes"
              placeholder="Interne Notizen für das Personal..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              disabled={!canEdit}
            />
          </div>

          {/* Save Button */}
          {canEdit && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/reservierungen/${reservation.id}`)}
                disabled={isPending}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !hasChanges}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Wird gespeichert...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Änderungen speichern
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}