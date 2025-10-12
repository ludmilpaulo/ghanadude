'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Clock, Tag, Percent } from 'lucide-react'

interface Deal {
  id: number
  title: string
  description: string
  discount_percentage: number
  discount_amount: number
  start_date: string
  end_date: string
  is_active: boolean
  products: {
    id: number
    name: string
    price: number
    images: { id: number; image: string }[]
  }[]
}

export default function DealsPage() {
  const dispatch = useAppDispatch()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals/`)
      if (response.ok) {
        const data = await response.json()
        setDeals(data.filter((deal: Deal) => deal.is_active))
      } else {
        setError('Failed to load deals')
      }
    } catch (err) {
      console.error('Load deals error:', err)
      setError('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({
      product,
      quantity: 1,
      variantId: null
    }))
    alert('Added to cart!')
  }

  const firstImageUrl = (product: { images?: Array<{ image: string }> }) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].image.startsWith('http') 
        ? product.images[0].image 
        : `${process.env.NEXT_PUBLIC_API_URL}${product.images[0].image}`
    }
    return '/placeholder-product.jpg'
  }

  const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number) => {
    return originalPrice * (1 - discountPercentage / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isDealExpiringSoon = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 3 && daysLeft > 0
  }

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading deals...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadDeals}
          className="mt-4 bg-brand-600 text-white px-6 py-3 rounded-xl"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="container py-12 text-center">
        <Tag className="w-16 h-16 mx-auto mb-6 text-gray-300" />
        <h1 className="text-2xl font-bold mb-4">No deals available</h1>
        <p className="text-gray-600 mb-8">Check back later for amazing offers</p>
        <Link 
          href="/" 
          className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Tag className="w-8 h-8 text-brand-600" />
          <h1 className="text-3xl font-bold">Special Deals & Promotions</h1>
        </div>
        <p className="text-gray-600">Don&apos;t miss out on these amazing offers</p>
      </div>

      <div className="space-y-8">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* Deal Header */}
            <div className="bg-gradient-to-r from-brand-600 to-purple-600 text-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{deal.title}</h2>
                  <p className="text-brand-100 mb-4">{deal.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Percent className="w-5 h-5" />
                      <span className="text-xl font-bold">{deal.discount_percentage}% OFF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm">
                        Ends {formatDate(deal.end_date)}
                      </span>
                    </div>
                  </div>
                </div>
                {isDealExpiringSoon(deal.end_date) && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Expires Soon!
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {deal.products.map((product) => {
                  const discountedPrice = calculateDiscountedPrice(product.price, deal.discount_percentage)
                  return (
                    <div key={product.id} className="group">
                      <div className="relative">
                        <Link href={`/products/${product.id}`}>
                          <div className="relative w-full h-64 rounded-xl overflow-hidden">
                            <Image
                              src={firstImageUrl(product)}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        
                        {/* Discount Badge */}
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                          -{deal.discount_percentage}%
                        </div>
                      </div>

                      <div className="p-4">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-lg mb-2 hover:text-brand-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-brand-600">
                            ZAR {discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ZAR {product.price.toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-brand-600 text-white py-2 px-4 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter Signup */}
      <div className="mt-12 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Never Miss a Deal!</h3>
        <p className="text-brand-100 mb-6">
          Subscribe to our newsletter and be the first to know about exclusive offers
        </p>
        <div className="max-w-md mx-auto flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button className="bg-white text-brand-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  )
}
