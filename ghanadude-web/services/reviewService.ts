import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Review {
  id: number
  user: {
    id: number
    username: string
    first_name: string
    last_name: string
  }
  product: number
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_breakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export const fetchProductReviews = async (productId: number): Promise<Review[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/reviews/product/${productId}/`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch product reviews:', error)
    throw error
  }
}

export const fetchReviewStats = async (productId: number): Promise<ReviewStats> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/reviews/product/${productId}/stats/`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch review stats:', error)
    throw error
  }
}

export const createReview = async (productId: number, rating: number, comment: string, token: string): Promise<Review> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/reviews/`, {
      product: productId,
      rating,
      comment
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Failed to create review:', error)
    throw error
  }
}

export const updateReview = async (reviewId: number, rating: number, comment: string, token: string): Promise<Review> => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/reviews/${reviewId}/`, {
      rating,
      comment
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Failed to update review:', error)
    throw error
  }
}

export const deleteReview = async (reviewId: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Failed to delete review:', error)
    throw error
  }
}
