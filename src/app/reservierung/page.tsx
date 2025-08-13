'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  Check,
  AlertTriangle,
  Star,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Shield,
  Eye,
  CheckCircle,
  Timer
} from "lucide-react"
import { createReservationSchema, type CreateReservationData } from '@/lib/validations/reservation'
import { useReservations } from '@/hooks/use-reservations'
import { cn } from "@/lib/utils"

interface AvailabilityData {
  available: boolean
  totalTables: number
  requestedDateTime: string
  partySize: number
  duration: number
  preferredLocation?: string
  tablesByLocation: Record<string, any[]>
  recommendations: Array<{
    id: string
    number: number
    capacity: number
    location: string
    description: string
    priceMultiplier: number
  }>
}

const steps = [
  { id: 1, name: 'Datum & Zeit', description: 'Wann möchten Sie kommen?' },
  { id: 2, name: 'Tisch wählen', description: 'Welcher Platz gefällt Ihnen?' },
  { id: 3, name: 'Ihre Daten', description: 'Kontaktinformationen' },
  { id: 4, name: 'Bestätigung', description: 'Reservierung abschließen' },
]

const locations = {
  TERRACE_SEA_VIEW: { name: 'Terrasse Meerblick', emoji: '🌊', premium: true },
  TERRACE_STANDARD: { name: 'Terrasse Standard', emoji: '🏖️', premium: false },
  INDOOR_WINDOW: { name: 'Innen am Fenster', emoji: '🪟', premium: false },
  INDOOR_STANDARD: { name: 'Innen Standard', emoji: '🏠', premium: false },
  BAR_AREA: { name: 'Bar-Bereich', emoji: '🍸', premium: false },
}

const timeSlots = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00'
]

export default function ReservierungPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [preferredLocation, setPreferredLocation] = useState('')

  const router = useRouter()
  const { createReservation } = useReservations()

  const form = useForm({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      partySize: 2,
      duration: 120,
      dataProcessingConsent: false,
      emailConsent: true,
      marketingConsent: false,
    }
  })

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3) // Allow reservations up to 3 months ahead
  const maxDateString = maxDate.toISOString().split('T')[0]

  const checkAvailability = async () => {
    if (!selectedDate || !selectedTime) return

    setCheckingAvailability(true)
    try {
      const dateTime = new Date(`${selectedDate}T${selectedTime}:00`)
      
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: dateTime.toISOString(),
          partySize,
          duration: 120,
          preferredLocation: preferredLocation || undefined,
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAvailability(data)
        if (data.available) {
          setCurrentStep(2)
        }
      } else {
        throw new Error('Failed to check availability')
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleSubmit = async (data: CreateReservationData) => {
    if (!selectedDate || !selectedTime || !selectedTable) return

    setSubmitting(true)
    try {
      const dateTime = new Date(`${selectedDate}T${selectedTime}:00`)
      
      const reservationData = {
        ...data,
        dateTime: dateTime.toISOString(),
        tableId: selectedTable,
        partySize,
      }

      await createReservation(reservationData)
      setReservationSuccess(true)
      setShowConfirmDialog(true)
    } catch (error) {
      console.error('Error creating reservation:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (reservationSuccess) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center py-12">
          <Card className="max-w-lg w-full mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Reservierung bestätigt!</h2>
              
              <p className="text-muted-foreground mb-6">
                Vielen Dank für Ihre Reservierung. Sie erhalten in Kürze eine 
                Bestätigungs-E-Mail mit allen Details.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Datum:
                  </span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Zeit:
                  </span>
                  <span className="font-medium">{selectedTime} Uhr</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personen:
                  </span>
                  <span className="font-medium">{partySize}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => router.push('/')} className="flex-1">
                  Zur Startseite
                </Button>
                <Button variant="outline" onClick={() => router.push('/speisekarte')} className="flex-1">
                  Speisekarte ansehen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://ik.imagekit.io/insomnialz/badezeit-tr.webp)'
            }}
          />
        </div>
        <div className="relative z-20 container mx-auto px-4">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              🍽️ Online Reservierung
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tisch reservieren
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Sichern Sie sich Ihren Platz mit Meerblick für ein unvergessliches 
              kulinarisches Erlebnis auf Sylt
            </p>
            
            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Sofortige Bestätigung</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">GDPR-konform</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                <span className="text-sm">Kostenlose Stornierung</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium",
                    currentStep >= step.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gray-200 text-gray-500"
                  )}>
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  
                  <div className="ml-3 hidden sm:block">
                    <p className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id ? "text-primary" : "text-gray-500"
                    )}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "hidden sm:block w-16 h-px mx-4",
                      currentStep > step.id ? "bg-primary" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            
            {/* Step 1: Date & Time Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Datum, Zeit und Anzahl Personen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <Label htmlFor="date">Datum auswählen</Label>
                    <Input
                      id="date"
                      type="date"
                      min={today}
                      max={maxDateString}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <Label>Uhrzeit auswählen</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className="text-sm"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Party Size */}
                  <div>
                    <Label htmlFor="partySize">Anzahl Personen</Label>
                    <Select value={partySize.toString()} onValueChange={(value) => setPartySize(parseInt(value))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Person' : 'Personen'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Preference */}
                  <div>
                    <Label>Bevorzugter Bereich (optional)</Label>
                    <RadioGroup value={preferredLocation} onValueChange={setPreferredLocation} className="mt-3">
                      <div className="space-y-2">
                        {Object.entries(locations).map(([key, location]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <RadioGroupItem value={key} id={key} />
                            <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                              <span>{location.emoji}</span>
                              <span>{location.name}</span>
                              {location.premium && (
                                <Badge variant="outline" className="text-xs">Premium</Badge>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <Button 
                    onClick={checkAvailability}
                    disabled={!selectedDate || !selectedTime || checkingAvailability}
                    className="w-full"
                    size="lg"
                  >
                    {checkingAvailability ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verfügbarkeit prüfen...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Verfügbarkeit prüfen
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Table Selection */}
            {currentStep === 2 && availability && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Tisch auswählen
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(selectedDate)} um {selectedTime} Uhr • {partySize} {partySize === 1 ? 'Person' : 'Personen'}
                  </div>
                </CardHeader>
                <CardContent>
                  {availability.available ? (
                    <div className="space-y-6">
                      {/* Availability Summary */}
                      <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-800">
                          {availability.totalTables} Tische verfügbar für Ihre Anfrage
                        </span>
                      </div>

                      {/* Recommended Tables */}
                      {availability.recommendations.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3">Empfohlene Tische</h3>
                          <div className="grid gap-3">
                            {availability.recommendations.map((table) => (
                              <div
                                key={table.id}
                                className={cn(
                                  "p-4 border rounded-lg cursor-pointer transition-colors",
                                  selectedTable === table.id
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-primary/50"
                                )}
                                onClick={() => setSelectedTable(table.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">
                                        {locations[table.location as keyof typeof locations]?.emoji}
                                      </span>
                                      <div>
                                        <div className="font-medium">
                                          Tisch {table.number}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {locations[table.location as keyof typeof locations]?.name} • bis {table.capacity} Personen
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {table.priceMultiplier > 1 && (
                                      <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                        Premium
                                      </Badge>
                                    )}
                                    {selectedTable === table.id && (
                                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                        <Check className="h-4 w-4 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {table.description && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {table.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tables by Location */}
                      {Object.entries(availability.tablesByLocation).map(([location, tables]) => (
                        <div key={location}>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <span>{locations[location as keyof typeof locations]?.emoji}</span>
                            {locations[location as keyof typeof locations]?.name}
                            {locations[location as keyof typeof locations]?.premium && (
                              <Badge variant="outline" className="text-xs">Premium</Badge>
                            )}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {tables.map((table: any) => (
                              <Button
                                key={table.id}
                                variant={selectedTable === table.id ? "default" : "outline"}
                                onClick={() => setSelectedTable(table.id)}
                                className="h-auto p-3 flex flex-col items-center gap-1"
                              >
                                <span className="font-medium">Tisch {table.number}</span>
                                <span className="text-xs opacity-75">bis {table.capacity}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Zurück
                        </Button>
                        <Button 
                          onClick={() => setCurrentStep(3)} 
                          disabled={!selectedTable}
                          className="flex-1"
                        >
                          Weiter
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Keine Tische verfügbar</h3>
                      <p className="text-muted-foreground mb-6">
                        Leider sind für die gewählte Zeit keine Tische verfügbar. 
                        Bitte wählen Sie eine andere Zeit oder reduzieren Sie die Gruppengröße.
                      </p>
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Zeit ändern
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Customer Information */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Ihre Kontaktdaten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Vorname *</Label>
                        <Input
                          id="firstName"
                          {...form.register('firstName')}
                          className="mt-2"
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Nachname *</Label>
                        <Input
                          id="lastName"
                          {...form.register('lastName')}
                          className="mt-2"
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">E-Mail-Adresse *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        className="mt-2"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefonnummer</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+49 XXX XXXXXXX"
                        {...form.register('phone')}
                        className="mt-2"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Special Requests */}
                    <div>
                      <Label htmlFor="occasion">Anlass (optional)</Label>
                      <Input
                        id="occasion"
                        placeholder="z.B. Geburtstag, Jubiläum, Geschäftsessen"
                        {...form.register('occasion')}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dietaryNotes">Allergien / Ernährungshinweise</Label>
                      <Textarea
                        id="dietaryNotes"
                        placeholder="Bitte teilen Sie uns Allergien oder besondere Ernährungswünsche mit"
                        {...form.register('dietaryNotes')}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialRequests">Besondere Wünsche</Label>
                      <Textarea
                        id="specialRequests"
                        placeholder="Haben Sie besondere Wünsche? Wir versuchen gerne, diese zu erfüllen."
                        {...form.register('specialRequests')}
                        className="mt-2"
                      />
                    </div>

                    {/* GDPR Consents */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium">Datenschutz und Einverständniserklärungen</h3>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="dataProcessingConsent"
                          {...form.register('dataProcessingConsent')}
                        />
                        <Label htmlFor="dataProcessingConsent" className="text-sm leading-relaxed">
                          Ich stimme der Verarbeitung meiner personenbezogenen Daten zur Durchführung 
                          der Reservierung gemäß der <a href="/datenschutz" className="text-primary underline">Datenschutzerklärung</a> zu. *
                        </Label>
                      </div>
                      {form.formState.errors.dataProcessingConsent && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.dataProcessingConsent.message}
                        </p>
                      )}

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="emailConsent"
                          defaultChecked
                          {...form.register('emailConsent')}
                        />
                        <Label htmlFor="emailConsent" className="text-sm leading-relaxed">
                          Ich möchte eine Bestätigungs-E-Mail für meine Reservierung erhalten.
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="marketingConsent"
                          {...form.register('marketingConsent')}
                        />
                        <Label htmlFor="marketingConsent" className="text-sm leading-relaxed">
                          Ich möchte gelegentlich über besondere Angebote und Veranstaltungen 
                          per E-Mail informiert werden.
                        </Label>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Zurück
                      </Button>
                      <Button type="button" onClick={() => setCurrentStep(4)} className="flex-1">
                        Weiter
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Reservierung bestätigen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Reservation Summary */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Zusammenfassung Ihrer Reservierung</h3>
                    
                    <div className="grid gap-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Datum & Zeit:
                        </span>
                        <span className="font-medium">
                          {formatDate(selectedDate)} um {selectedTime} Uhr
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Anzahl Personen:
                        </span>
                        <span className="font-medium">{partySize}</span>
                      </div>
                      
                      {selectedTable && availability?.recommendations.find(t => t.id === selectedTable) && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Tisch:
                          </span>
                          <span className="font-medium">
                            Tisch {availability.recommendations.find(t => t.id === selectedTable)?.number}
                            {' '} ({locations[availability.recommendations.find(t => t.id === selectedTable)?.location as keyof typeof locations]?.name})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Kontaktdaten</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {form.watch('firstName')} {form.watch('lastName')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {form.watch('email')}
                      </div>
                      {form.watch('phone') && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {form.watch('phone')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {(form.watch('occasion') || form.watch('dietaryNotes') || form.watch('specialRequests')) && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Zusätzliche Informationen</h3>
                      
                      {form.watch('occasion') && (
                        <div>
                          <span className="text-sm font-medium">Anlass:</span>
                          <p className="text-sm text-muted-foreground">{form.watch('occasion')}</p>
                        </div>
                      )}
                      
                      {form.watch('dietaryNotes') && (
                        <div>
                          <span className="text-sm font-medium">Allergien/Ernährung:</span>
                          <p className="text-sm text-muted-foreground">{form.watch('dietaryNotes')}</p>
                        </div>
                      )}
                      
                      {form.watch('specialRequests') && (
                        <div>
                          <span className="text-sm font-medium">Besondere Wünsche:</span>
                          <p className="text-sm text-muted-foreground">{form.watch('specialRequests')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Important Notice */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">Wichtige Hinweise:</p>
                        <ul className="text-blue-800 space-y-1">
                          <li>• Reservierungen können bis 24h vorher kostenfrei storniert werden</li>
                          <li>• Bei Verspätung von mehr als 15 Minuten kann der Tisch anderweitig vergeben werden</li>
                          <li>• Sie erhalten eine Bestätigungs-E-Mail mit allen Details</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Zurück
                    </Button>
                    <Button 
                      onClick={form.handleSubmit(handleSubmit)}
                      disabled={submitting || !form.watch('dataProcessingConsent')}
                      className="flex-1"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Reservierung wird erstellt...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verbindlich reservieren
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}