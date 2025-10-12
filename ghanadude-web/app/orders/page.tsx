'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { fetchUserOrders, downloadInvoice, Order } from '@/services/orderService'
import { Package, Download, Eye, Calendar, MapPin, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const user = useAppSelector((state) => state.auth.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (user?.token) {
      loadOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadOrders = async () => {
    if (!user?.token) return
    
    setLoading(true)
    try {
      const userOrders = await fetchUserOrders(user.token)
      setOrders(userOrders)
      setError(null)
    } catch (err) {
      console.error('Load orders error:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (orderId: number) => {
    if (!user?.token) return
    
    try {
      const blob = await downloadInvoice(orderId, user.token)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download invoice error:', err)
      alert('Failed to download invoice')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Processing':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Please log in to view your orders</h1>
        <a href="/Login" className="inline-block mt-4 bg-brand-600 text-white px-6 py-3 rounded-xl">
          Login
        </a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadOrders}
          className="mt-4 bg-brand-600 text-white px-6 py-3 rounded-xl"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container py-12 text-center">
        <Package className="w-16 h-16 mx-auto mb-6 text-gray-300" />
        <h1 className="text-2xl font-bold mb-4">No orders yet</h1>
        <p className="text-gray-600 mb-8">Your order history will appear here</p>
        <Link 
          href="/" 
          className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Order History</h1>
        <p className="text-gray-600">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                <p className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                {order.is_dispatched && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Dispatched
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </h4>
                <p className="text-gray-600">
                  {order.address}<br />
                  {order.city}, {order.postal_code}<br />
                  {order.country}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Details
                </h4>
                <p className="text-gray-600">
                  Method: {order.payment_method.toUpperCase()}<br />
                  Type: {order.order_type === 'delivery' ? 'Delivery' : 'Collection'}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-lg font-bold">
                    Total: ZAR {parseFloat(order.total_price).toFixed(2)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  
                  {order.invoice_url && (
                    <button
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700"
                    >
                      <Download className="w-4 h-4" />
                      Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order #{selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
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

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>ZAR {(parseFloat(selectedOrder.total_price) - parseFloat(selectedOrder.delivery_fee) - parseFloat(selectedOrder.vat_amount)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>ZAR {parseFloat(selectedOrder.delivery_fee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT:</span>
                      <span>ZAR {parseFloat(selectedOrder.vat_amount).toFixed(2)}</span>
                    </div>
                    {parseFloat(selectedOrder.discount_amount) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-ZAR {parseFloat(selectedOrder.discount_amount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>ZAR {parseFloat(selectedOrder.total_price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
