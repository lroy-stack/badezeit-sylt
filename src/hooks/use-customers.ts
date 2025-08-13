import { useState, useEffect } from 'react'
import { CustomerFilterData, CreateCustomerData, UpdateCustomerData } from '@/lib/validations/customer'

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  language: 'DE' | 'EN'
  dateOfBirth?: string
  preferredTime?: string
  preferredLocation?: string
  dietaryRestrictions: string[]
  allergies?: string
  favoriteDisheIds: string[]
  emailConsent: boolean
  smsConsent: boolean
  marketingConsent: boolean
  dataProcessingConsent: boolean
  consentDate?: string
  totalVisits: number
  totalSpent: number
  averagePartySize: number
  lastVisit?: string
  isVip: boolean
  createdAt: string
  updatedAt: string
  reservations?: Array<{
    id: string
    dateTime: string
    partySize: number
    status: string
  }>
  notes?: Array<{
    id: string
    note: string
    isImportant: boolean
    createdAt: string
    user: {
      firstName: string
      lastName: string
    }
  }>
  _count?: {
    reservations: number
  }
}

export function useCustomers(filters?: CustomerFilterData) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.set(key, value.toString())
          }
        })
      }

      const response = await fetch(`/api/customers?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }

      const data = await response.json()
      setCustomers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (customerData: CreateCustomerData) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create customer')
      }

      const newCustomer = await response.json()
      setCustomers(prev => [newCustomer, ...prev])
      
      return newCustomer
    } catch (err) {
      throw err
    }
  }

  const updateCustomer = async (id: string, updates: UpdateCustomerData) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update customer')
      }

      const updatedCustomer = await response.json()
      
      setCustomers(prev => 
        prev.map(customer => customer.id === id ? updatedCustomer : customer)
      )

      return updatedCustomer
    } catch (err) {
      throw err
    }
  }

  const searchCustomers = (query: string): Customer[] => {
    if (!query.trim()) return customers
    
    const searchTerm = query.toLowerCase()
    
    return customers.filter(customer => 
      customer.firstName.toLowerCase().includes(searchTerm) ||
      customer.lastName.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm) ||
      customer.phone?.toLowerCase().includes(searchTerm)
    )
  }

  const getVipCustomers = (): Customer[] => {
    return customers.filter(customer => customer.isVip)
  }

  const getRecentCustomers = (days: number = 30): Customer[] => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return customers.filter(customer => {
      if (!customer.lastVisit) return false
      return new Date(customer.lastVisit) >= cutoffDate
    })
  }

  const getTopSpenders = (limit: number = 10): Customer[] => {
    return [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit)
  }

  const getMostFrequent = (limit: number = 10): Customer[] => {
    return [...customers]
      .sort((a, b) => b.totalVisits - a.totalVisits)
      .slice(0, limit)
  }

  const getCustomersByLocation = (location: string): Customer[] => {
    return customers.filter(customer => customer.preferredLocation === location)
  }

  const getCustomersWithDietaryRestrictions = (): Customer[] => {
    return customers.filter(customer => 
      customer.dietaryRestrictions.length > 0 || customer.allergies
    )
  }

  const getCustomerStats = () => {
    const total = customers.length
    const vip = customers.filter(c => c.isVip).length
    const withEmail = customers.filter(c => c.emailConsent).length
    const withMarketing = customers.filter(c => c.marketingConsent).length
    
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    const totalVisits = customers.reduce((sum, c) => sum + c.totalVisits, 0)
    
    const avgSpentPerCustomer = total > 0 ? totalSpent / total : 0
    const avgVisitsPerCustomer = total > 0 ? totalVisits / total : 0
    
    const languageBreakdown = customers.reduce((acc, customer) => {
      acc[customer.language] = (acc[customer.language] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      total,
      vip,
      vipPercentage: total > 0 ? Math.round((vip / total) * 100) : 0,
      emailConsentRate: total > 0 ? Math.round((withEmail / total) * 100) : 0,
      marketingConsentRate: total > 0 ? Math.round((withMarketing / total) * 100) : 0,
      avgSpentPerCustomer: Math.round(avgSpentPerCustomer * 100) / 100,
      avgVisitsPerCustomer: Math.round(avgVisitsPerCustomer * 100) / 100,
      totalRevenue: totalSpent,
      totalVisits,
      languageBreakdown,
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [filters])

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    searchCustomers,
    getVipCustomers,
    getRecentCustomers,
    getTopSpenders,
    getMostFrequent,
    getCustomersByLocation,
    getCustomersWithDietaryRestrictions,
    getCustomerStats,
  }
}