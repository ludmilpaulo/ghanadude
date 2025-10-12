'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useGetProductByIdQuery } from '@/redux/svc/api'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import { addToWishlist as addToWishlistAction } from '@/redux/slices/wishlistSlice'
import { addToWishlist as addToWishlistAPI } from '@/services/wishlistService'
import { toast } from 'sonner'
import { firstImageUrl } from '@/lib/img'
import ProductReviews from '@/components/ProductReviews'
import { Heart, ShoppingCart, Share2, Truck, Shield, RotateCcw } from 'lucide-react'

export default function ProductDetailPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const productId = parseInt(slug)
  const { data: product, isLoading } = useGetProductByIdQuery(slug)
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const wishlistItems = useAppSelector((state) => state.wishlist.items)
  
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-200 rounded-3xl"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <button onClick={() => router.push('/')} className="mt-4 text-brand-600 hover:underline">
          Go back to home
        </button>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 
    ? product.images.map((img: { image: string }) => img.image.startsWith('http') ? img.image : `${process.env.NEXT_PUBLIC_API_URL}${img.image}`)
    : [firstImageUrl(product)]
  
  const main = images[selectedImage]
  const money = (n: number) => `ZAR ${Number(n).toFixed(2)}`
  const price = Number(product.price)
  const isInWishlist = wishlistItems.some(item => item.product.id === product.id)

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    
    dispatch(addToCart({ product, quantity, variantId: selectedSize || null }))
    toast.success(`Added ${quantity} item(s) to cart`)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  const handleAddToWishlist = async () => {
    if (!user?.token) {
      toast.error('Please login to add to wishlist')
      router.push('/Login')
      return
    }

    try {
      const wishlistItem = await addToWishlistAPI(product.id, user.token)
      dispatch(addToWishlistAction(wishlistItem))
      toast.success('Added to wishlist')
    } catch (err) {
      console.error('Wishlist error:', err)
      toast.error('Failed to add to wishlist')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on GhanaDude`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <div className="container py-10">
      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border shadow-sm">
            <Image src={main} alt={product.name} fill className="object-cover" priority />
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-brand-600 ring-2 ring-brand-200' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.category && (
              <p className="mt-2 text-sm text-gray-600">Category: {product.category}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-brand-600">{money(price)}</span>
            {product.stock && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.stock > 10 ? 'bg-green-100 text-green-800' : 
                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            )}
          </div>

          {product.description && (
            <div
              className="prose max-w-none prose-p:leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Size</label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                      selectedSize === s
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-300 hover:border-brand-400 text-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl border-2 border-gray-300 hover:border-brand-400 flex items-center justify-center font-semibold"
              >
                −
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl border-2 border-gray-300 hover:border-brand-400 flex items-center justify-center font-semibold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!product.stock || product.stock === 0}
              className="flex-1 bg-brand-600 text-white rounded-xl px-6 py-4 font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.stock || product.stock === 0}
              className="flex-1 bg-gray-900 text-white rounded-xl px-6 py-4 font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Buy now
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToWishlist}
              disabled={isInWishlist}
              className={`flex-1 border-2 rounded-xl px-6 py-3 font-medium flex items-center justify-center gap-2 transition-colors ${
                isInWishlist
                  ? 'border-red-300 bg-red-50 text-red-600 cursor-not-allowed'
                  : 'border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
            <button
              onClick={handleShare}
              className="border-2 border-gray-300 rounded-xl px-6 py-3 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <Truck className="w-6 h-6 mx-auto mb-2 text-brand-600" />
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-gray-600">On orders over R500</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-brand-600" />
              <p className="text-sm font-medium">Secure Payment</p>
              <p className="text-xs text-gray-600">100% protected</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 mx-auto mb-2 text-brand-600" />
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-gray-600">30-day policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-12">
        <ProductReviews productId={productId} />
      </div>
    </div>
  )
}
