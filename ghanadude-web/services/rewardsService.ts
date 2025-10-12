import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Reward {
  id: number
  user: number
  points: number
  earned_date: string
  expiry_date: string
  status: 'active' | 'used' | 'expired'
  description: string
}

export interface RewardBalance {
  total_points: number
  available_points: number
  used_points: number
  expired_points: number
}

export const fetchRewards = async (userId: number, token: string): Promise<Reward[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/rewards/user/${userId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch rewards:', error)
    throw error
  }
}

export const fetchRewardBalance = async (userId: number, token: string): Promise<RewardBalance> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/rewards/user/${userId}/balance/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch reward balance:', error)
    throw error
  }
}

export const applyRewardPoints = async (orderId: number, points: number, token: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/api/rewards/apply/`, {
      order_id: orderId,
      points: points
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Failed to apply reward points:', error)
    throw error
  }
}

export const earnRewardPoints = async (orderId: number, token: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/api/rewards/earn/`, {
      order_id: orderId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Failed to earn reward points:', error)
    throw error
  }
}
