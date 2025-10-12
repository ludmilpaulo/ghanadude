'use client'

import { useState } from 'react'
import { MapPin, Navigation, Loader } from 'lucide-react'
import { getCurrentLocation, LocationData } from '@/services/locationService'

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void
  currentLocation?: LocationData
}

export default function LocationPicker({ onLocationSelect, currentLocation }: LocationPickerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetCurrentLocation = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const location = await getCurrentLocation()
      onLocationSelect(location)
    } catch (error) {
      console.error('Location error:', error)
      setError('Failed to get your location. Please enter your address manually.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Delivery Location
        </h3>
        
        <button
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          Use Current Location
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {currentLocation && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Location Detected</p>
              <p className="text-sm text-green-700">
                {currentLocation.address}, {currentLocation.city}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {currentLocation.postal_code}, {currentLocation.country}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Location Services</p>
            <p className="text-sm text-blue-700">
              We use your location to calculate accurate delivery fees and provide better service.
              Your location data is only used for delivery purposes and is not stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
