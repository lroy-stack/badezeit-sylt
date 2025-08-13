'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Download, 
  Heart,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Copy,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GalleryImage } from '@/hooks/use-gallery'
import { GALLERY_CATEGORIES } from '@/lib/validations/gallery'

interface LightboxProps {
  isOpen: boolean
  onClose: () => void
  images: GalleryImage[]
  currentIndex: number
  onIndexChange: (index: number) => void
  language?: 'de' | 'en'
  onShare?: (image: GalleryImage, platform: string) => void
  onCopyUrl?: (image: GalleryImage) => Promise<boolean>
}

export function Lightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  language = 'de',
  onShare,
  onCopyUrl
}: LightboxProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentImage = images[currentIndex]

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    onIndexChange(newIndex)
    setIsZoomed(false)
    setRotation(0)
  }, [currentIndex, images.length, onIndexChange])

  const goToNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    onIndexChange(newIndex)
    setIsZoomed(false)
    setRotation(0)
  }, [currentIndex, images.length, onIndexChange])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case ' ':
          e.preventDefault()
          setIsZoomed(!isZoomed)
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, goToPrevious, goToNext, isZoomed, onClose])

  // Reset state when lightbox closes
  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false)
      setRotation(0)
      setShowShareMenu(false)
      setCopied(false)
    }
  }, [isOpen])

  const handleShare = async (platform: string) => {
    if (!currentImage) return

    if (platform === 'copy') {
      if (onCopyUrl) {
        const success = await onCopyUrl(currentImage)
        if (success) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      }
    } else if (onShare) {
      onShare(currentImage, platform)
    }
    
    setShowShareMenu(false)
  }

  const getImageTitle = (image: GalleryImage) => {
    return language === 'en' && image.titleEn ? image.titleEn : image.title
  }

  const getImageDescription = (image: GalleryImage) => {
    return language === 'en' && image.descriptionEn ? image.descriptionEn : image.description
  }

  const getCategoryLabel = (category: string) => {
    const categoryData = GALLERY_CATEGORIES[category as keyof typeof GALLERY_CATEGORIES]
    return language === 'en' ? categoryData?.labelEn : categoryData?.label
  }

  if (!currentImage) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
        {/* Header */}
        <DialogHeader className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-white border-white/30">
                {GALLERY_CATEGORIES[currentImage.category as keyof typeof GALLERY_CATEGORIES]?.icon}{' '}
                {getCategoryLabel(currentImage.category)}
              </Badge>
              <div>
                <DialogTitle className="text-lg font-semibold text-white">
                  {getImageTitle(currentImage)}
                </DialogTitle>
                <p className="text-sm text-white/70">
                  {currentIndex + 1} von {images.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsZoomed(!isZoomed)}
                className="text-white hover:bg-white/20"
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </Button>
              
              {/* Rotate control */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRotation(rotation + 90)}
                className="text-white hover:bg-white/20"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              
              {/* Share control */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                {showShareMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-2 min-w-[200px] z-50">
                    <div className="grid grid-cols-2 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('facebook')}
                        className="justify-start gap-2"
                      >
                        <Facebook className="h-4 w-4 text-blue-600" />
                        Facebook
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('twitter')}
                        className="justify-start gap-2"
                      >
                        <Twitter className="h-4 w-4 text-blue-400" />
                        Twitter
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('whatsapp')}
                        className="justify-start gap-2"
                      >
                        <Instagram className="h-4 w-4 text-green-600" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('email')}
                        className="justify-start gap-2"
                      >
                        <Mail className="h-4 w-4 text-gray-600" />
                        E-Mail
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('copy')}
                        className="justify-start gap-2 col-span-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? 'Kopiert!' : 'URL kopieren'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main image container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={goToPrevious}
                className="absolute left-4 z-40 text-white hover:bg-white/20 rounded-full h-12 w-12"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={goToNext}
                className="absolute right-4 z-40 text-white hover:bg-white/20 rounded-full h-12 w-12"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image */}
          <div className={cn(
            "relative transition-transform duration-300 ease-in-out",
            isZoomed ? "scale-150" : "scale-100"
          )}>
            <Image
              src={currentImage.imageUrl}
              alt={getImageTitle(currentImage)}
              width={1200}
              height={800}
              className={cn(
                "max-w-full max-h-[calc(100vh-8rem)] object-contain transition-transform duration-300",
                `rotate-${rotation % 360}`
              )}
              style={{
                transform: `rotate(${rotation}deg)`
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              priority
              quality={95}
            />
          </div>
        </div>

        {/* Bottom info panel */}
        {(getImageDescription(currentImage) || currentImage.category) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            <div className="max-w-2xl">
              {getImageDescription(currentImage) && (
                <p className="text-sm leading-relaxed mb-2">
                  {getImageDescription(currentImage)}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-white/70">
                <span>Kategorie: {getCategoryLabel(currentImage.category)}</span>
                <span>•</span>
                <span>Badezeit Sylt</span>
              </div>
            </div>
          </div>
        )}

        {/* Thumbnail strip for navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40">
            <div className="flex gap-2 bg-black/60 rounded-lg p-2 max-w-[80vw] overflow-x-auto">
              {images.slice(Math.max(0, currentIndex - 5), currentIndex + 6).map((image, index) => {
                const actualIndex = Math.max(0, currentIndex - 5) + index
                return (
                  <button
                    key={image.id}
                    onClick={() => onIndexChange(actualIndex)}
                    className={cn(
                      "relative flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors",
                      actualIndex === currentIndex 
                        ? "border-white" 
                        : "border-white/30 hover:border-white/60"
                    )}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={getImageTitle(image)}
                      fill
                      className="object-cover"
                      sizes="48px"
                      quality={70}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}