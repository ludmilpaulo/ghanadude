export interface LocationData {
  latitude: number
  longitude: number
  address: string
  city: string
  postal_code: string
  country: string
}

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Reverse geocoding to get address
          const address = await reverseGeocode(latitude, longitude)
          
          resolve({
            latitude,
            longitude,
            ...address
          })
        } catch (error) {
          reject(error)
        }
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

export const reverseGeocode = async (latitude: number, longitude: number): Promise<Omit<LocationData, 'latitude' | 'longitude'>> => {
  try {
    // Using a free geocoding service (you might want to use Google Maps API or similar)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding failed')
    }
    
    const data = await response.json()
    
    return {
      address: data.localityInfo?.administrative?.[0]?.name || 'Unknown Address',
      city: data.city || data.locality || 'Unknown City',
      postal_code: data.postcode || '',
      country: data.countryName || 'Unknown Country'
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return {
      address: 'Unknown Address',
      city: 'Unknown City',
      postal_code: '',
      country: 'Unknown Country'
    }
  }
}

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export const calculateDeliveryFee = (distance: number, orderValue: number): number => {
  // Free delivery over R500
  if (orderValue >= 500) {
    return 0
  }
  
  // Base delivery fee
  let fee = 50
  
  // Additional fee for distances over 10km
  if (distance > 10) {
    fee += Math.ceil((distance - 10) / 5) * 10
  }
  
  return fee
}
