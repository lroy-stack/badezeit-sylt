import { format, addDays, isBefore, isAfter, isToday, isTomorrow, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

// Restaurant operating hours and business logic
export const RESTAURANT_HOURS = {
  SUMMER: {
    open: '12:00',
    close: '22:00',
    lastReservation: '20:30',
  },
  WINTER: {
    open: '17:00',
    close: '21:00',
    lastReservation: '19:30',
  }
}

export const TABLE_LOCATIONS = {
  TERRACE_SEA_VIEW: {
    name: 'Terrasse Meerblick',
    nameEn: 'Sea View Terrace',
    premium: true,
    priceMultiplier: 1.2,
  },
  TERRACE_STANDARD: {
    name: 'Terrasse Standard',
    nameEn: 'Standard Terrace', 
    premium: false,
    priceMultiplier: 1.1,
  },
  INDOOR_WINDOW: {
    name: 'Fensterplatz',
    nameEn: 'Window Seat',
    premium: false,
    priceMultiplier: 1.0,
  },
  INDOOR_STANDARD: {
    name: 'Innenbereich',
    nameEn: 'Indoor Standard',
    premium: false,
    priceMultiplier: 0.9,
  },
  BAR_AREA: {
    name: 'Bar-Bereich',
    nameEn: 'Bar Area',
    premium: false,
    priceMultiplier: 0.8,
  },
} as const

export type TableLocation = keyof typeof TABLE_LOCATIONS

// Date and time utilities for restaurant operations
export function isRestaurantOpen(date: Date = new Date()): boolean {
  const hours = getCurrentSeasonHours()
  const currentTime = format(date, 'HH:mm')
  return currentTime >= hours.open && currentTime <= hours.close
}

export function getCurrentSeasonHours() {
  const now = new Date()
  const month = now.getMonth() + 1 // 0-based to 1-based
  
  // Summer season: April to October (months 4-10)
  return (month >= 4 && month <= 10) ? RESTAURANT_HOURS.SUMMER : RESTAURANT_HOURS.WINTER
}

export function getNextAvailableDate(): Date {
  let date = new Date()
  
  // If it's past closing time today, start from tomorrow
  const hours = getCurrentSeasonHours()
  const currentTime = format(date, 'HH:mm')
  
  if (currentTime > hours.close) {
    date = addDays(date, 1)
  }
  
  return date
}

export function formatReservationTime(dateTime: Date | string, language: 'de' | 'en' = 'de'): string {
  const date = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime
  
  if (isToday(date)) {
    return language === 'de' ? 
      `Heute um ${format(date, 'HH:mm')}` : 
      `Today at ${format(date, 'HH:mm')}`
  }
  
  if (isTomorrow(date)) {
    return language === 'de' ? 
      `Morgen um ${format(date, 'HH:mm')}` : 
      `Tomorrow at ${format(date, 'HH:mm')}`
  }
  
  return language === 'de' ?
    format(date, 'dd.MM.yyyy \'um\' HH:mm', { locale: de }) :
    format(date, 'MMM dd, yyyy \'at\' HH:mm')
}

export function formatReservationDate(dateTime: Date | string, language: 'de' | 'en' = 'de'): string {
  const date = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime
  
  return language === 'de' ?
    format(date, 'EEEE, dd. MMMM yyyy', { locale: de }) :
    format(date, 'EEEE, MMMM dd, yyyy')
}

// Reservation validation utilities
export function isValidReservationTime(dateTime: Date): { valid: boolean; reason?: string } {
  const now = new Date()
  
  // Must be in the future
  if (isBefore(dateTime, now)) {
    return { valid: false, reason: 'Reservation must be in the future' }
  }
  
  // Check if within advance booking window (90 days default)
  const maxAdvanceDays = 90
  const maxDate = addDays(now, maxAdvanceDays)
  if (isAfter(dateTime, maxDate)) {
    return { valid: false, reason: `Reservations can only be made ${maxAdvanceDays} days in advance` }
  }
  
  // Check restaurant operating hours
  const hours = getCurrentSeasonHours()
  const time = format(dateTime, 'HH:mm')
  
  if (time < hours.open || time > hours.lastReservation) {
    return { 
      valid: false, 
      reason: `Reservations are only available between ${hours.open} and ${hours.lastReservation}` 
    }
  }
  
  return { valid: true }
}

export function getReservationTimeSlots(date: Date): string[] {
  const hours = getCurrentSeasonHours()
  const slots: string[] = []
  
  // Generate 30-minute slots from open to last reservation time
  const startHour = parseInt(hours.open.split(':')[0])
  const startMinute = parseInt(hours.open.split(':')[1])
  const endHour = parseInt(hours.lastReservation.split(':')[0])
  const endMinute = parseInt(hours.lastReservation.split(':')[1])
  
  let currentHour = startHour
  let currentMinute = startMinute
  
  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute <= endMinute)
  ) {
    slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`)
    
    currentMinute += 30
    if (currentMinute >= 60) {
      currentMinute = 0
      currentHour += 1
    }
  }
  
  return slots
}

// Table location utilities
export function getTableLocationName(location: TableLocation, language: 'de' | 'en' = 'de'): string {
  return language === 'de' ? 
    TABLE_LOCATIONS[location].name : 
    TABLE_LOCATIONS[location].nameEn
}

export function isPremiumLocation(location: TableLocation): boolean {
  return TABLE_LOCATIONS[location].premium
}

export function getLocationPriceMultiplier(location: TableLocation): number {
  return TABLE_LOCATIONS[location].priceMultiplier
}

// Reservation status utilities
export function getReservationStatusText(status: string, language: 'de' | 'en' = 'de'): string {
  const statusTexts = {
    de: {
      PENDING: 'Ausstehend',
      CONFIRMED: 'Bestätigt',
      SEATED: 'Eingecheckt',
      COMPLETED: 'Abgeschlossen',
      CANCELLED: 'Storniert',
      NO_SHOW: 'Nicht erschienen',
    },
    en: {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      SEATED: 'Seated',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      NO_SHOW: 'No Show',
    }
  }
  
  return statusTexts[language][status as keyof typeof statusTexts['de']] || status
}

export function canCancelReservation(dateTime: Date | string, cancellationHours: number = 24): boolean {
  const reservationDate = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime
  const now = new Date()
  const cancellationDeadline = new Date(reservationDate.getTime() - cancellationHours * 60 * 60 * 1000)
  
  return now < cancellationDeadline
}

// Allergen utilities
export const EU_ALLERGENS = [
  { key: 'gluten', name: 'Gluten', nameEn: 'Gluten', number: 1 },
  { key: 'milk', name: 'Milch', nameEn: 'Milk', number: 2 },
  { key: 'eggs', name: 'Eier', nameEn: 'Eggs', number: 3 },
  { key: 'nuts', name: 'Nüsse', nameEn: 'Nuts', number: 4 },
  { key: 'fish', name: 'Fisch', nameEn: 'Fish', number: 5 },
  { key: 'shellfish', name: 'Krebstiere', nameEn: 'Crustaceans', number: 6 },
  { key: 'soy', name: 'Soja', nameEn: 'Soy', number: 7 },
  { key: 'celery', name: 'Sellerie', nameEn: 'Celery', number: 8 },
  { key: 'mustard', name: 'Senf', nameEn: 'Mustard', number: 9 },
  { key: 'sesame', name: 'Sesam', nameEn: 'Sesame', number: 10 },
  { key: 'sulfites', name: 'Sulfite', nameEn: 'Sulfites', number: 11 },
  { key: 'lupin', name: 'Lupine', nameEn: 'Lupin', number: 12 },
  { key: 'mollusks', name: 'Weichtiere', nameEn: 'Molluscs', number: 13 },
  { key: 'peanuts', name: 'Erdnüsse', nameEn: 'Peanuts', number: 14 },
] as const

export function getAllergenName(key: string, language: 'de' | 'en' = 'de'): string {
  const allergen = EU_ALLERGENS.find(a => a.key === key)
  if (!allergen) return key
  
  return language === 'de' ? allergen.name : allergen.nameEn
}

export function getAllergenNumber(key: string): number | null {
  const allergen = EU_ALLERGENS.find(a => a.key === key)
  return allergen?.number || null
}

export function getMenuItemAllergens(item: any): { key: string; name: string; nameEn: string; number: number }[] {
  return EU_ALLERGENS.filter(allergen => {
    const containsKey = `contains${allergen.key.charAt(0).toUpperCase() + allergen.key.slice(1)}`
    return item[containsKey] === true
  })
}

// Business logic utilities
export function calculateReservationEndTime(dateTime: Date, duration: number): Date {
  return new Date(dateTime.getTime() + duration * 60 * 1000)
}

export function isReservationConflict(
  reservation1: { dateTime: Date; duration: number },
  reservation2: { dateTime: Date; duration: number }
): boolean {
  const end1 = calculateReservationEndTime(reservation1.dateTime, reservation1.duration)
  const end2 = calculateReservationEndTime(reservation2.dateTime, reservation2.duration)
  
  // No conflict if one ends before the other starts
  return !(end1 <= reservation2.dateTime || end2 <= reservation1.dateTime)
}

export function getOptimalTableCapacity(partySize: number): number {
  // Recommend table 20-50% larger than party size for comfort
  return Math.ceil(partySize * 1.3)
}