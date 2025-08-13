import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export interface DashboardMetrics {
  heute: {
    reservierungen: { gesamt: number; bestaetigt: number; wartend: number; storniert: number }
    auslastung: { aktuell: number; durchschnitt: number; prognose: number }
    kunden: { neue: number; wiederkehrend: number; vip: number; gesamt: number }
    umsatz: { geschaetzt: number; durchschnitt: number }
  }
  trends: { 
    reservierungenVsVorperiode: number
    kundenVsVorperiode: number
    auslastungVsVorperiode: number
    umsatzVsVorperiode: number
  }
  zeitraum: string
  lastUpdated: string
}

export interface DashboardMetricsOptions {
  period?: 'today' | 'week' | 'month'
  compareWithPrevious?: boolean
  refreshInterval?: number // milliseconds
  enabled?: boolean
}

const DEFAULT_OPTIONS: Required<DashboardMetricsOptions> = {
  period: 'today',
  compareWithPrevious: true,
  refreshInterval: 30000, // 30 seconds
  enabled: true
}

export function useDashboardMetrics(options: DashboardMetricsOptions = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const queryClient = useQueryClient()

  const fetchMetrics = async (): Promise<DashboardMetrics> => {
    const queryParams = new URLSearchParams({
      period: mergedOptions.period,
      compareWithPrevious: mergedOptions.compareWithPrevious.toString()
    })

    const response = await fetch(`/api/dashboard/metrics?${queryParams}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  const query = useQuery({
    queryKey: ['dashboard-metrics', mergedOptions.period, mergedOptions.compareWithPrevious],
    queryFn: fetchMetrics,
    enabled: mergedOptions.enabled,
    refetchInterval: mergedOptions.refreshInterval,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  })

  // Manual refresh function
  const refresh = () => {
    return query.refetch()
  }

  // Invalidate and refetch metrics
  const invalidateMetrics = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['dashboard-metrics']
    })
  }

  // Real-time update trigger (can be called when reservations change)
  const updateMetricsRealtime = () => {
    // Invalidate current query to force refresh
    invalidateMetrics()
  }

  return {
    metrics: query.data,
    loading: query.isLoading,
    error: query.error as Error | null,
    isRefetching: query.isFetching,
    lastUpdated: query.data?.lastUpdated,
    refresh,
    invalidateMetrics,
    updateMetricsRealtime
  }
}

// Hook for real-time metrics with WebSocket-like updates
export function useRealTimeDashboardMetrics(options: DashboardMetricsOptions = {}) {
  const metrics = useDashboardMetrics({
    ...options,
    refreshInterval: 15000 // More frequent updates for real-time
  })
  
  // Could be extended to use WebSockets or Server-Sent Events
  useEffect(() => {
    // Listen for custom events that indicate data changes
    const handleReservationChange = () => {
      metrics.updateMetricsRealtime()
    }

    window.addEventListener('reservation-updated', handleReservationChange)
    window.addEventListener('customer-created', handleReservationChange)
    
    return () => {
      window.removeEventListener('reservation-updated', handleReservationChange)
      window.removeEventListener('customer-created', handleReservationChange)
    }
  }, [metrics])

  return metrics
}

// Utility hook for specific metric calculations
export function useMetricCalculations(metrics?: DashboardMetrics) {
  if (!metrics) return null

  const reservationRate = metrics.heute.reservierungen.gesamt > 0 
    ? Math.round((metrics.heute.reservierungen.bestaetigt / metrics.heute.reservierungen.gesamt) * 100)
    : 0

  const customerGrowthRate = metrics.trends.kundenVsVorperiode
  const occupancyTrend = metrics.trends.auslastungVsVorperiode
  const revenueTrend = metrics.trends.umsatzVsVorperiode

  const performanceScore = Math.round((
    (reservationRate + 
     Math.min(metrics.heute.auslastung.aktuell, 100) + 
     Math.min(metrics.heute.kunden.neue * 10, 100)) / 3
  ))

  return {
    reservationRate,
    customerGrowthRate,
    occupancyTrend,
    revenueTrend,
    performanceScore,
    isGrowthPositive: customerGrowthRate > 0,
    isOccupancyUp: occupancyTrend > 0,
    isRevenueUp: revenueTrend > 0
  }
}

// Export the query key factory for external cache invalidation
export const dashboardMetricsKeys = {
  all: ['dashboard-metrics'] as const,
  metrics: (period: string, compare: boolean) => 
    [...dashboardMetricsKeys.all, period, compare] as const,
}
