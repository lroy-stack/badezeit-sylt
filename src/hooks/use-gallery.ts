import { useState, useEffect } from 'react'
import { GalleryFilterData } from '@/lib/validations/gallery'

export interface GalleryImage {
  id: string
  title: string
  titleEn?: string
  description?: string
  descriptionEn?: string
  imageUrl: string
  category: string
  displayOrder: number
  createdAt: string
}

export interface GalleryData {
  images: GalleryImage[]
  pagination: {
    total: number
    offset: number
    limit: number
    hasMore: boolean
  }
  categories: Record<string, number>
  filters: GalleryFilterData
}

export function useGallery(filters?: GalleryFilterData) {
  const [gallery, setGallery] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGallery = async (newFilters?: GalleryFilterData) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      
      const activeFilters = newFilters || filters
      if (activeFilters) {
        Object.entries(activeFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.set(key, value.toString())
          }
        })
      }

      const response = await fetch(`/api/gallery?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery')
      }

      const data = await response.json()
      setGallery(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!gallery || !gallery.pagination.hasMore || loading) return

    try {
      setLoading(true)
      const newOffset = gallery.pagination.offset + gallery.pagination.limit
      
      const queryParams = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.set(key, value.toString())
          }
        })
      }
      queryParams.set('offset', newOffset.toString())

      const response = await fetch(`/api/gallery?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to load more images')
      }

      const data = await response.json()
      
      setGallery(prev => prev ? {
        ...data,
        images: [...prev.images, ...data.images]
      } : data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getImagesByCategory = (category: string): GalleryImage[] => {
    if (!gallery) return []
    return gallery.images.filter(image => image.category === category)
  }

  const searchImages = (query: string): GalleryImage[] => {
    if (!gallery || !query.trim()) return []
    
    const searchTerm = query.toLowerCase()
    return gallery.images.filter(image => 
      image.title.toLowerCase().includes(searchTerm) ||
      image.titleEn?.toLowerCase().includes(searchTerm) ||
      image.description?.toLowerCase().includes(searchTerm) ||
      image.descriptionEn?.toLowerCase().includes(searchTerm)
    )
  }

  const filterByCategory = (category: string) => {
    const newFilters: GalleryFilterData = { 
      ...filters, 
      category: category as 'RESTAURANT' | 'FOOD' | 'TEAM' | 'EVENTS' | 'AMBIENCE', 
      offset: 0,
      limit: filters?.limit || 50
    }
    fetchGallery(newFilters)
  }

  const clearFilters = () => {
    const newFilters: GalleryFilterData = { limit: 50, offset: 0 }
    fetchGallery(newFilters)
  }

  // Social sharing utilities
  const getShareUrl = (image: GalleryImage, platform: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const imageUrl = encodeURIComponent(image.imageUrl)
    const title = encodeURIComponent(`${image.title} - Badezeit Sylt`)
    const description = encodeURIComponent(image.description || 'Entdecken Sie Badezeit Sylt')
    const galleryUrl = encodeURIComponent(`${baseUrl}/galerie`)

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${galleryUrl}&picture=${imageUrl}`
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${title}&url=${galleryUrl}&via=BadezeitSylt`
      case 'whatsapp':
        return `https://wa.me/?text=${title}%20${galleryUrl}`
      case 'email':
        return `mailto:?subject=${title}&body=${description}%20${galleryUrl}`
      case 'pinterest':
        return `https://pinterest.com/pin/create/button/?url=${galleryUrl}&media=${imageUrl}&description=${title}`
      default:
        return galleryUrl
    }
  }

  const shareImage = (image: GalleryImage, platform: string) => {
    const shareUrl = getShareUrl(image, platform)
    
    if (typeof window !== 'undefined') {
      if (platform === 'email') {
        window.location.href = shareUrl
      } else {
        window.open(shareUrl, '_blank', 'noopener,noreferrer')
      }
    }
  }

  // Copy image URL to clipboard
  const copyImageUrl = async (image: GalleryImage) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(image.imageUrl)
        return true
      } catch (err) {
        console.error('Failed to copy URL:', err)
        return false
      }
    }
    return false
  }

  useEffect(() => {
    fetchGallery()
  }, [filters])

  return {
    gallery,
    loading,
    error,
    refetch: fetchGallery,
    loadMore,
    getImagesByCategory,
    searchImages,
    filterByCategory,
    clearFilters,
    shareImage,
    getShareUrl,
    copyImageUrl,
  }
}