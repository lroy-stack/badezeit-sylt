import { useState, useEffect } from 'react'

export interface SystemSetting {
  value: string
  description?: string
  updatedAt: string
}

export interface SettingsData {
  settings: Record<string, SystemSetting>
  raw: Array<{
    id: string
    key: string
    value: string
    description?: string
    updatedAt: string
  }>
}

export function useSettings(publicOnly: boolean = false) {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = publicOnly ? '?public=true' : ''
      const response = await fetch(`/api/settings${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string, description?: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update setting')
      }

      // Refresh settings after update
      await fetchSettings()
    } catch (err) {
      throw err
    }
  }

  const updateMultipleSettings = async (settingUpdates: Array<{ key: string; value: string; description?: string }>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingUpdates)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update settings')
      }

      // Refresh settings after update
      await fetchSettings()
    } catch (err) {
      throw err
    }
  }

  const deleteSetting = async (key: string) => {
    try {
      const response = await fetch(`/api/settings?key=${encodeURIComponent(key)}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete setting')
      }

      // Refresh settings after deletion
      await fetchSettings()
    } catch (err) {
      throw err
    }
  }

  const getSetting = (key: string, defaultValue?: string): string => {
    return settings?.settings[key]?.value || defaultValue || ''
  }

  const getRestaurantInfo = () => {
    if (!settings) return null

    return {
      name: getSetting('restaurant_name'),
      phone: getSetting('restaurant_phone'),
      email: getSetting('restaurant_email'),
      address: getSetting('restaurant_address'),
      openingHoursSummer: getSetting('opening_hours_summer'),
      openingHoursWinter: getSetting('opening_hours_winter'),
      maxPartySize: parseInt(getSetting('max_party_size', '20')),
      advanceBookingDays: parseInt(getSetting('advance_booking_days', '90')),
      cancellationHours: parseInt(getSetting('cancellation_hours', '24')),
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [publicOnly])

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSetting,
    updateMultipleSettings,
    deleteSetting,
    getSetting,
    getRestaurantInfo,
  }
}