"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Loader2, ZoomIn, ZoomOut } from "lucide-react"

interface ImagePopupProps {
  imageUrl: string
  onClose: () => void
  alt?: string
}

export const ImagePopup: React.FC<ImagePopupProps> = ({ imageUrl, onClose, alt = "Enlarged image" }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEscKey)
      document.body.style.overflow = "unset"
    }
  }, [onClose])

  const handleImageLoad = () => setIsLoading(false)
  const handleImageError = () => {
    setIsLoading(false)
    setImageError(true)
  }

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsZoomed(!isZoomed)
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {!isLoading && !imageError && (
          <button
            onClick={toggleZoom}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ?
              <ZoomOut className="w-5 h-5 text-white" /> :
              <ZoomIn className="w-5 h-5 text-white" />
            }
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close image"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="h-full w-full flex items-center justify-center p-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-white/70">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {imageError && (
          <div className="text-center text-white/70">
            <X className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load image</p>
          </div>
        )}

        {!imageError && (
          <div
            className={`relative max-w-5xl mx-auto transition-opacity duration-200 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={alt}
              className={`
                max-h-[85vh] w-auto mx-auto rounded-lg
                transition-all duration-300 ease-out
                ${isZoomed ? 'scale-150' : 'scale-100 hover:scale-105'}
                cursor-zoom-in shadow-2xl
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={toggleZoom}
            />

            <div className="absolute bottom-4 left-4 right-4 text-white/70 text-sm text-center">
              {alt}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
