import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface WishlistItem {
  id: number
  product: {
    id: number
    name: string
    price: number
    images: { id: number; image: string }[]
  }
  created_at: string
}

export const fetchWishlist = async (token: string): Promise<WishlistItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/wishlist/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch wishlist:', error)
    throw error
  }
}

export const addToWishlist = async (productId: number, token: string): Promise<WishlistItem> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/wishlist/`, {
      product: productId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Failed to add to wishlist:', error)
    throw error
  }
}

export const removeFromWishlist = async (productId: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/wishlist/${productId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Failed to remove from wishlist:', error)
    throw error
  }
}

export const fetchWishlistCount = async (token: string): Promise<number> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/wishlist/count/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data.count
  } catch (error) {
    console.error('Failed to fetch wishlist count:', error)
    return 0
  }
}
