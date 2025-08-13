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
import { Calendar } from '@/components/ui/calendar'
import { 
  Search,
  Plus,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Table,
  MapPin,
  Star,
  AlertCircle,
  Check,
  X
} from 'lucide-react'
import { format } from 'date-fns'
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
}

interface User {
  id: string
  firstName: string | null
  lastName: string | null
  role: string
}

interface NewReservationFormProps {
  tables: Table[]
  timeSlots: Date[]
  preselectedCustomer: Customer | null
  selectedDate: Date
  selectedTime: string
  currentUser: User
}

interface ReservationData {
  customerId?: string
  newCustomer?: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    language: 'DE' | 'EN'
    emailConsent: boolean
    dataProcessingConsent: boolean
  }
  dateTime: Date
  partySize: number
  duration: number
  tableId?: string
  specialRequests?: string
  dietaryNotes?: string
  occasion?: string
  status: 'PENDING' | 'CONFIRMED'
}

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const DURATIONS = [60, 90, 120, 150, 180, 210, 240]
const TABLE_LOCATIONS = {
  TERRACE: 'Terrasse',
  INDOOR: 'Innenbereich',
  BAR: 'Bar',
  PRIVATE: 'Separé'
}

export function NewReservationForm({
  tables,
  timeSlots,
  preselectedCustomer,
  selectedDate,
  selectedTime,
  currentUser
}: NewReservationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Form state
  const [step, setStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(preselectedCustomer)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(!preselectedCustomer)
  
  // Reservation data
  const [reservationData, setReservationData] = useState<Partial<ReservationData>>({
    dateTime: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`),
    partySize: 2,
    duration: 120,
    status: 'CONFIRMED'
  })

  // Available tables based on party size and time
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  // Customer search
  const searchCustomers = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(term)}`)
      if (response.ok) {
        const customers = await response.json()
        setSearchResults(customers)
      }
    } catch (error) {
      console.error('Customer search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Check table availability
  const checkTableAvailability = async () => {
    if (!reservationData.dateTime || !reservationData.partySize) return

    setIsCheckingAvailability(true)
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: reservationData.dateTime.toISOString(),
          duration: reservationData.duration || 120,
          partySize: reservationData.partySize
        })
      })

      if (response.ok) {
        const { availableTables: available } = await response.json()
        const filteredTables = tables.filter(table => 
          available.some((avail: any) => avail.id === table.id) &&
          table.capacity >= reservationData.partySize!
        )
        setAvailableTables(filteredTables)
      }
    } catch (error) {
      console.error('Availability check failed:', error)
      toast.error('Fehler beim Prüfen der Verfügbarkeit')
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  // Submit reservation
  const handleSubmit = async () => {
    if (!reservationData.dateTime || !reservationData.partySize) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    startTransition(async () => {
      try {
        const submitData = {
          ...reservationData,
          customerId: selectedCustomer?.id,
          createdById: currentUser.id
        }

        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })

        if (response.ok) {
          const reservation = await response.json()
          toast.success('Reservierung erfolgreich erstellt!')
          router.push(`/dashboard/reservierungen/${reservation.id}`)
        } else {
          const error = await response.json()
          toast.error(error.message || 'Fehler beim Erstellen der Reservierung')
        }
      } catch (error) {
        console.error('Reservation creation failed:', error)
        toast.error('Fehler beim Erstellen der Reservierung')
      }
    })
  }

  // Effects
  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => searchCustomers(searchTerm), 300)
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm])

  useEffect(() => {
    checkTableAvailability()
  }, [reservationData.dateTime, reservationData.partySize, reservationData.duration])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Step 1: Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Schritt 1: Kunde auswählen
              {selectedCustomer && <Check className="h-4 w-4 text-green-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedCustomer && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="search">Kunde suchen</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Name, E-Mail oder Telefonnummer eingeben..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setShowNewCustomerForm(false)
                          setSearchTerm('')
                          setSearchResults([])
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {customer.firstName} {customer.lastName}
                              </p>
                              {customer.isVip && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  VIP
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <Button
                  variant="outline"
                  onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Neuen Kunden anlegen
                </Button>

                {/* New Customer Form */}
                {showNewCustomerForm && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Vorname *</Label>
                          <Input 
                            id="firstName"
                            value={reservationData.newCustomer?.firstName || ''}
                            onChange={(e) => setReservationData(prev => ({
                              ...prev,
                              newCustomer: { 
                                ...prev.newCustomer!,
                                firstName: e.target.value,
                                language: 'DE',
                                emailConsent: true,
                                dataProcessingConsent: true
                              }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nachname *</Label>
                          <Input 
                            id="lastName"
                            value={reservationData.newCustomer?.lastName || ''}
                            onChange={(e) => setReservationData(prev => ({
                              ...prev,
                              newCustomer: { 
                                ...prev.newCustomer!,
                                lastName: e.target.value,
                                language: 'DE',
                                emailConsent: true,
                                dataProcessingConsent: true
                              }
                            }))}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">E-Mail *</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={reservationData.newCustomer?.email || ''}
                          onChange={(e) => setReservationData(prev => ({
                            ...prev,
                            newCustomer: { 
                              ...prev.newCustomer!,
                              email: e.target.value,
                              language: 'DE',
                              emailConsent: true,
                              dataProcessingConsent: true
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input 
                          id="phone"
                          value={reservationData.newCustomer?.phone || ''}
                          onChange={(e) => setReservationData(prev => ({
                            ...prev,
                            newCustomer: { 
                              ...prev.newCustomer!,
                              phone: e.target.value,
                              language: 'DE',
                              emailConsent: true,
                              dataProcessingConsent: true
                            }
                          }))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {selectedCustomer && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </p>
                      {selectedCustomer.isVip && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                    {selectedCustomer.phone && (
                      <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomer(null)
                      setShowNewCustomerForm(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Reservation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Schritt 2: Reservierungsdetails
              {reservationData.dateTime && reservationData.partySize && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partySize">Personenanzahl *</Label>
                <Select 
                  value={reservationData.partySize?.toString()}
                  onValueChange={(value) => setReservationData(prev => ({
                    ...prev,
                    partySize: parseInt(value)
                  }))}
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
                  value={reservationData.duration?.toString()}
                  onValueChange={(value) => setReservationData(prev => ({
                    ...prev,
                    duration: parseInt(value)
                  }))}
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

            <div className="space-y-2">
              <Label htmlFor="time">Uhrzeit *</Label>
              <Select 
                value={format(reservationData.dateTime || new Date(), 'HH:mm')}
                onValueChange={(value) => {
                  const [hours, minutes] = value.split(':').map(Number)
                  const newDateTime = new Date(selectedDate)
                  newDateTime.setHours(hours, minutes, 0, 0)
                  setReservationData(prev => ({
                    ...prev,
                    dateTime: newDateTime
                  }))
                }}
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

            <div className="space-y-2">
              <Label htmlFor="occasion">Anlass (optional)</Label>
              <Input 
                id="occasion"
                placeholder="z.B. Geburtstag, Jubiläum, Geschäftsessen..."
                value={reservationData.occasion || ''}
                onChange={(e) => setReservationData(prev => ({
                  ...prev,
                  occasion: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Besondere Wünsche</Label>
              <Textarea 
                id="specialRequests"
                placeholder="Besondere Wünsche, Anmerkungen..."
                value={reservationData.specialRequests || ''}
                onChange={(e) => setReservationData(prev => ({
                  ...prev,
                  specialRequests: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietaryNotes">Diät-Hinweise / Allergien</Label>
              <Textarea 
                id="dietaryNotes"
                placeholder="Allergien, Diätanforderungen, Unverträglichkeiten..."
                value={reservationData.dietaryNotes || ''}
                onChange={(e) => setReservationData(prev => ({
                  ...prev,
                  dietaryNotes: e.target.value
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Table Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              Schritt 3: Tisch auswählen (optional)
              {reservationData.tableId && <Check className="h-4 w-4 text-green-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCheckingAvailability ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Verfügbarkeit wird geprüft...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {availableTables.length} verfügbare Tische für {reservationData.partySize} Personen
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableTables.map(table => (
                    <div
                      key={table.id}
                      className={cn(
                        "p-4 border-2 rounded-lg cursor-pointer transition-colors",
                        reservationData.tableId === table.id 
                          ? "border-primary bg-primary/5" 
                          : "border-muted hover:border-primary/50"
                      )}
                      onClick={() => setReservationData(prev => ({
                        ...prev,
                        tableId: prev.tableId === table.id ? undefined : table.id
                      }))}
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
                </div>
                
                {availableTables.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-8 w-8 text-orange-500 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Keine Tische für diese Zeit und Personenzahl verfügbar.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Die Reservierung kann trotzdem erstellt werden.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Summary */}
      <div className="space-y-6">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Kunde</p>
              <p className="text-sm text-muted-foreground">
                {selectedCustomer 
                  ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                  : reservationData.newCustomer?.firstName && reservationData.newCustomer?.lastName
                    ? `${reservationData.newCustomer.firstName} ${reservationData.newCustomer.lastName} (neu)`
                    : 'Nicht ausgewählt'
                }
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium">Datum & Zeit</p>
              <p className="text-sm text-muted-foreground">
                {reservationData.dateTime
                  ? format(reservationData.dateTime, 'dd.MM.yyyy HH:mm', { locale: de })
                  : 'Nicht festgelegt'
                } Uhr
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Personen & Dauer</p>
              <p className="text-sm text-muted-foreground">
                {reservationData.partySize || 0} Personen • {reservationData.duration || 120} Min.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Tisch</p>
              <p className="text-sm text-muted-foreground">
                {reservationData.tableId 
                  ? `Tisch ${tables.find(t => t.id === reservationData.tableId)?.number}`
                  : 'Automatisch zuweisen'
                }
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={reservationData.status}
                onValueChange={(value: 'PENDING' | 'CONFIRMED') => setReservationData(prev => ({
                  ...prev,
                  status: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Wartend auf Bestätigung</SelectItem>
                  <SelectItem value="CONFIRMED">Bestätigt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isPending || !reservationData.dateTime || !reservationData.partySize || (!selectedCustomer && !reservationData.newCustomer?.firstName)}
              className="w-full"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Wird erstellt...
                </>
              ) : (
                'Reservierung erstellen'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}