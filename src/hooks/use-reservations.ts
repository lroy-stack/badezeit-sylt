import { useState, useEffect } from 'react'
import { ReservationFilterData } from '@/lib/validations/reservation'

export interface Reservation {
  id: string
  dateTime: string
  partySize: number
  duration: number
  status: string
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  table?: {
    id: string
    number: number
    capacity: number
    location: string
  }
  specialRequests?: string
  occasion?: string
  dietaryNotes?: string
  notes?: string
}

export function useReservations(filters?: ReservationFilterData) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (filters?.startDate) queryParams.set('startDate', filters.startDate.toISOString())
      if (filters?.endDate) queryParams.set('endDate', filters.endDate.toISOString())
      if (filters?.status) queryParams.set('status', filters.status)
      if (filters?.customerId) queryParams.set('customerId', filters.customerId)
      if (filters?.tableId) queryParams.set('tableId', filters.tableId)

      const response = await fetch(`/api/reservations?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch reservations')
      }

      const data = await response.json()
      setReservations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateReservation = async (id: string, updates: Partial<Reservation>) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update reservation')
      }

      const updatedReservation = await response.json()
      
      setReservations(prev => 
        prev.map(res => res.id === id ? updatedReservation : res)
      )

      return updatedReservation
    } catch (err) {
      throw err
    }
  }

  const cancelReservation = async (id: string, reason?: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'CANCELLED',
          cancellationReason: reason 
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel reservation')
      }

      const updatedReservation = await response.json()
      
      setReservations(prev => 
        prev.map(res => res.id === id ? updatedReservation : res)
      )

      return updatedReservation
    } catch (err) {
      throw err
    }
  }

  const createReservation = async (reservationData: any) => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create reservation')
      }

      const newReservation = await response.json()
      setReservations(prev => [newReservation, ...prev])
      
      return newReservation
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [filters])

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations,
    updateReservation,
    cancelReservation,
    createReservation,
  }
}