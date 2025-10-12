'use client'

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { clearCart } from '@/redux/slices/cartSlice'
import { clearDesign } from '@/redux/slices/designSlice'
import { useRouter } from 'next/navigation'
import { CreditCard, MapPin, Truck, Shield } from 'lucide-react'

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  address: string
  city: string
  postal_code: string
  country: string
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { items } = useAppSelector((s) => s.cart)
  const design = useAppSelector((s) => s.design)
  const user = useAppSelector((s) => s.auth.user)
  
  const [form, setForm] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'South Africa'
  })
  
  const [orderType, setOrderType] = useState<'delivery' | 'collection'>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'eft' | 'delivery'>('card')
  const [loading, setLoading] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [appliedRewards] = useState(0)

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
      return
    }

    // Load user profile if logged in
    if (user?.token) {
      loadUserProfile()
    }

    // Calculate delivery fee
    calculateDeliveryFee()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, user, orderType])

  const loadUserProfile = async () => {
    if (!user?.token || !user?.user_id) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.user_id}/profile/`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.profile?.phone_number || '',
          address: data.profile?.address || '',
          city: data.profile?.city || '',
          postal_code: data.profile?.postal_code || '',
          country: data.profile?.country || 'South Africa'
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const calculateDeliveryFee = () => {
    if (orderType === 'collection') {
      setDeliveryFee(0)
    } else {
      // Simple delivery fee calculation based on subtotal
      const subtotal = calculateSubtotal()
      if (subtotal >= 500) {
        setDeliveryFee(0) // Free delivery over R500
      } else {
        setDeliveryFee(50) // R50 delivery fee
      }
    }
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const calculateDesignCost = () => {
    return (design.brandLogoQty * 50) + (design.customDesignQty * 100)
  }

  const calculateVAT = () => {
    const subtotal = calculateSubtotal() + calculateDesignCost()
    return subtotal * 0.15 // 15% VAT
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal() + calculateDesignCost()
    const vat = calculateVAT()
    const total = subtotal + vat + deliveryFee - appliedRewards
    return Math.max(0, total)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.first_name || !form.last_name || !form.email || !form.address || !form.city) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      const orderData = {
        items: items.map(item => ({
          product: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        design: design.brandLogo || design.customDesign ? {
          brand_logo: design.brandLogo,
          custom_design: design.customDesign,
          brand_logo_qty: design.brandLogoQty,
          custom_design_qty: design.customDesignQty
        } : null,
        shipping: {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          address: form.address,
          city: form.city,
          postal_code: form.postal_code,
          country: form.country
        },
        order_type: orderType,
        payment_method: paymentMethod,
        delivery_fee: deliveryFee,
        reward_points_applied: appliedRewards
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const order = await response.json()
        
        // Clear cart and design
        dispatch(clearCart())
        dispatch(clearDesign())
        
        // Redirect to success page
        router.push(`/checkout/success?order=${order.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">Add some items to your cart first</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-brand-600 text-white px-6 py-3 rounded-xl"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={form.postal_code}
                    onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="South Africa">South Africa</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Options
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="orderType"
                    value="delivery"
                    checked={orderType === 'delivery'}
                    onChange={(e) => setOrderType(e.target.value as 'delivery' | 'collection')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Home Delivery</div>
                    <div className="text-sm text-gray-600">
                      {deliveryFee === 0 ? 'Free delivery' : `R${deliveryFee} delivery fee`}
                      {calculateSubtotal() >= 500 && orderType === 'delivery' && (
                        <span className="text-green-600 ml-2">(Free over R500)</span>
                      )}
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="orderType"
                    value="collection"
                    checked={orderType === 'collection'}
                    onChange={(e) => setOrderType(e.target.value as 'delivery' | 'collection')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Store Collection</div>
                    <div className="text-sm text-gray-600">Free collection from our store</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'eft' | 'delivery')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-gray-600">Pay securely with your card</div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="eft"
                    checked={paymentMethod === 'eft'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'eft' | 'delivery')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Bank Transfer (EFT)</div>
                    <div className="text-sm text-gray-600">Transfer funds directly to our account</div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="delivery"
                    checked={paymentMethod === 'delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'eft' | 'delivery')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when your order arrives</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">
                      ZAR {(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                {calculateDesignCost() > 0 && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <div className="font-medium">Custom Design</div>
                      <div className="text-sm text-gray-600">
                        Logo: {design.brandLogoQty}x, Design: {design.customDesignQty}x
                      </div>
                    </div>
                    <div className="font-semibold">
                      ZAR {calculateDesignCost().toFixed(2)}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>ZAR {(calculateSubtotal() + calculateDesignCost()).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>VAT (15%)</span>
                  <span>ZAR {calculateVAT().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? 'Free' : `ZAR ${deliveryFee.toFixed(2)}`}</span>
                </div>
                
                {appliedRewards > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Rewards Applied</span>
                    <span>-ZAR {appliedRewards.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg pt-4 border-t">
                  <span>Total</span>
                  <span>ZAR {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-brand-600 text-white py-3 px-4 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
