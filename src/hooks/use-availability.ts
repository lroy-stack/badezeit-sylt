import { useState } from 'react'

export interface AvailabilityRequest {
  dateTime: Date
  partySize: number
  duration?: number
  preferredLocation?: string
}

export interface TableRecommendation {
  id: string
  number: number
  capacity: number
  location: string
  description?: string
  priceMultiplier: number
}

export interface AvailabilityResponse {
  available: boolean
  totalTables: number
  requestedDateTime: string
  partySize: number
  duration: number
  preferredLocation?: string
  tablesByLocation: Record<string, TableRecommendation[]>
  recommendations: TableRecommendation[]
  alternativeTimes: string[]
}

export function useAvailability() {
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAvailability = async (request: AvailabilityRequest) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: request.dateTime.toISOString(),
          partySize: request.partySize,
          duration: request.duration || 120,
          preferredLocation: request.preferredLocation,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check availability')
      }

      const data = await response.json()
      setAvailability(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getDailyAvailability = async (date: Date) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/availability?date=${date.toISOString().split('T')[0]}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get daily availability')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    availability,
    loading,
    error,
    checkAvailability,
    getDailyAvailability,
  }
}