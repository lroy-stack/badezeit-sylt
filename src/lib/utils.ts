import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Restaurant-specific utility functions
export function formatPrice(price: number, currency = '€'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export function formatDate(date: Date, locale = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'Europe/Berlin',
  }).format(date)
}

export function formatDateTime(date: Date, locale = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  }).format(date)
}

export function formatTime(date: Date, locale = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  }).format(date)
}

// German-specific text formatting
export function capitalizeGerman(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Table status utility
export function getTableStatusClass(status: 'available' | 'occupied' | 'reserved'): string {
  switch (status) {
    case 'available':
      return 'table-available'
    case 'occupied':
      return 'table-occupied'
    case 'reserved':
      return 'table-reserved'
    default:
      return ''
  }
}

// Reservation status utility
export function getReservationStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400'
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400'
    case 'seated':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
    case 'no_show':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400'
  }
}

// User role utility
export function getRoleDisplayName(role: string, locale = 'de'): string {
  const roleNames = {
    de: {
      ADMIN: 'Administrator',
      MANAGER: 'Manager',
      STAFF: 'Mitarbeiter',
      KITCHEN: 'Küche',
    },
    en: {
      ADMIN: 'Administrator',
      MANAGER: 'Manager', 
      STAFF: 'Staff',
      KITCHEN: 'Kitchen',
    }
  }
  
  return roleNames[locale as keyof typeof roleNames]?.[role as keyof typeof roleNames['de']] || role
}

// Phone number formatting for German numbers
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('49')) {
    // German international format
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`
  }
  if (cleaned.startsWith('0')) {
    // German national format
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`
  }
  return phone
}

// Generate QR code data URL
export function generateQRCodeUrl(tableNumber: number): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/qr/tisch/${tableNumber}`
}