import { z } from 'zod'

export const galleryFilterSchema = z.object({
  category: z.enum(['RESTAURANT', 'FOOD', 'TEAM', 'EVENTS', 'AMBIENCE']).optional(),
  search: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

export const createGalleryImageSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(200),
  titleEn: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  descriptionEn: z.string().max(1000).optional(),
  imageUrl: z.string().url('Ungültige Bild-URL'),
  category: z.enum(['RESTAURANT', 'FOOD', 'TEAM', 'EVENTS', 'AMBIENCE']),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export const updateGalleryImageSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200).optional(),
  titleEn: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  descriptionEn: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  category: z.enum(['RESTAURANT', 'FOOD', 'TEAM', 'EVENTS', 'AMBIENCE']).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const galleryImageShareSchema = z.object({
  imageId: z.string().cuid(),
  platform: z.enum(['facebook', 'twitter', 'instagram', 'whatsapp', 'email']),
  url: z.string().url(),
})

export type GalleryFilterData = z.infer<typeof galleryFilterSchema>
export type CreateGalleryImageData = z.infer<typeof createGalleryImageSchema>
export type UpdateGalleryImageData = z.infer<typeof updateGalleryImageSchema>
export type GalleryImageShareData = z.infer<typeof galleryImageShareSchema>

// Constants for gallery categories with German/English labels
export const GALLERY_CATEGORIES = {
  RESTAURANT: {
    label: 'Restaurant',
    labelEn: 'Restaurant',
    description: 'Innenräume und Terrasse',
    descriptionEn: 'Interior and terrace',
    icon: '🏪'
  },
  FOOD: {
    label: 'Essen',
    labelEn: 'Food',
    description: 'Unsere Gerichte und Spezialitäten',
    descriptionEn: 'Our dishes and specialties',
    icon: '🍽️'
  },
  TEAM: {
    label: 'Team',
    labelEn: 'Team',
    description: 'Unser Küchenteam und Service',
    descriptionEn: 'Our kitchen team and service',
    icon: '👥'
  },
  EVENTS: {
    label: 'Veranstaltungen',
    labelEn: 'Events',
    description: 'Besondere Anlässe und Feiern',
    descriptionEn: 'Special occasions and celebrations',
    icon: '🎉'
  },
  AMBIENCE: {
    label: 'Atmosphäre',
    labelEn: 'Ambience',
    description: 'Stimmung und Ambiente',
    descriptionEn: 'Mood and atmosphere',
    icon: '✨'
  }
} as const