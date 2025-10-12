import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface OrderItem {
  id: number
  product_name: string
  price: string
  quantity: number
  selected_size: string | null
}

export interface Order {
  id: number
  user: string
  total_price: string
  address: string
  city: string
  postal_code: string
  country: string
  discount_amount: string
  delivery_fee: string
  vat_amount: string
  payment_method: 'card' | 'delivery' | 'eft'
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled'
  order_type: 'delivery' | 'collection'
  reward_applied: string
  reward_granted: boolean
  created_at: string
  updated_at: string
  invoice_url?: string
  invoice?: string
  products: number[]
  items: OrderItem[]
  pin_code: string | null
  is_dispatched: boolean
}

export const fetchUserOrders = async (token: string): Promise<Order[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/orders/user-orders/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch user orders:', error)
    throw error
  }
}

export const fetchOrderById = async (orderId: number, token: string): Promise<Order> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch order:', error)
    throw error
  }
}

export const downloadInvoice = async (orderId: number, token: string): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}/invoice/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error('Failed to download invoice:', error)
    throw error
  }
}
