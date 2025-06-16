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

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)
    document.body.style.overflow = "hidden" // Prevent background scrolling

    return () => {
      document.removeEventListener("keydown", handleEscKey)
      document.body.style.overflow = "unset"
    }
  }, [onClose])

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setImageError(true)
  }

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsZoomed(!isZoomed)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.95)" }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Modal container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 sm:p-8">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          onClick={onClose}
          aria-label="Close image"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Zoom toggle button */}
        {!isLoading && !imageError && (
          <button
            className="absolute top-4 right-16 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
            onClick={toggleZoom}
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="ml-2 text-white text-sm">Loading image...</span>
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className="flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-lg font-medium mb-2">Failed to load image</p>
            <p className="text-sm text-gray-300">The image could not be displayed</p>
          </div>
        )}

        {/* Image container */}
        {!imageError && (
          <div
            className={`relative transition-all duration-300 ease-out ${isLoading ? "opacity-0" : "opacity-100"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={alt}
              className={`max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-all duration-300 cursor-pointer ${
                isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in hover:scale-105"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={toggleZoom}
              style={{
                filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))",
              }}
            />

            {/* Image info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
              <p className="text-white text-sm font-medium">{alt}</p>
              <p className="text-gray-300 text-xs mt-1">
                Click to {isZoomed ? "zoom out" : "zoom in"} • Press ESC to close
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
