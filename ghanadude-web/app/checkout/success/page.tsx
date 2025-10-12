'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Mail, Home, Download } from 'lucide-react'

interface OrderData {
  id: number
  created_at: string
  status: string
  total_price: string
  payment_method: string
  order_type: string
  invoice_url?: string
  items: Array<{
    id: number
    product_name: string
    price: string
    quantity: number
    selected_size: string | null
  }>
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      loadOrderDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const loadOrderDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      }
    } catch (err) {
      console.error('Failed to load order details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!orderId) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/invoice/`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `invoice-${orderId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download invoice')
    }
  }

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-6 text-center">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold">#{order.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-lg">ZAR {parseFloat(order.total_price).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">{order.payment_method.toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Type:</span>
                <span className="font-semibold">
                  {order.order_type === 'delivery' ? 'Home Delivery' : 'Store Collection'}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        Size: {item.selected_size || 'N/A'} | Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ZAR {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Invoice */}
            {order.invoice_url && (
              <div className="mt-6 pt-6 border-t text-center">
                <button
                  onClick={handleDownloadInvoice}
                  className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Invoice
                </button>
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">What&apos;s Next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">You&apos;ll receive an email confirmation shortly</span>
            </div>
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">We&apos;ll prepare your order for shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">You&apos;ll get tracking information once shipped</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            View Order History
          </Link>
          
          <Link
            href="/"
            className="bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-gray-600 mb-2">Need help with your order?</p>
          <Link href="/contact" className="text-brand-600 hover:underline">
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
  )
}
