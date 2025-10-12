'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { setWishlistItems, removeFromWishlist, setLoading, setError } from '@/redux/slices/wishlistSlice'
import { fetchWishlist, removeFromWishlist as removeFromWishlistAPI } from '@/services/wishlistService'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { addToCart } from '@/redux/slices/cartSlice'

export default function WishlistPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector((state) => state.wishlist)
  const user = useAppSelector((state) => state.auth.user)

  useEffect(() => {
    if (user?.token) {
      loadWishlist()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadWishlist = async () => {
    if (!user?.token) return
    
    dispatch(setLoading(true))
    try {
      const wishlistItems = await fetchWishlist(user.token)
      dispatch(setWishlistItems(wishlistItems))
    } catch (err) {
      console.error('Load wishlist error:', err)
      dispatch(setError('Failed to load wishlist'))
    }
  }

  const handleRemoveFromWishlist = async (productId: number) => {
    if (!user?.token) return
    
    try {
      await removeFromWishlistAPI(productId, user.token)
      dispatch(removeFromWishlist(productId))
    } catch (err) {
      console.error('Remove from wishlist error:', err)
      alert('Failed to remove item from wishlist')
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

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Please log in to view your wishlist</h1>
        <Link href="/Login" className="inline-block mt-4 bg-brand-600 text-white px-6 py-3 rounded-xl">
          Login
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading wishlist...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadWishlist}
          className="mt-4 bg-brand-600 text-white px-6 py-3 rounded-xl"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <Heart className="w-16 h-16 mx-auto mb-6 text-gray-300" />
        <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-gray-600 mb-8">Save items you love for later</p>
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
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden group">
            <div className="relative">
              <Link href={`/products/${item.product.id}`}>
                <div className="relative w-full h-64">
                  <Image
                    src={firstImageUrl(item.product)}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              
              <button
                onClick={() => handleRemoveFromWishlist(item.product.id)}
                className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>

            <div className="p-4">
              <Link href={`/products/${item.product.id}`}>
                <h3 className="font-semibold text-lg mb-2 hover:text-brand-600 transition-colors">
                  {item.product.name}
                </h3>
              </Link>
              
              <p className="text-xl font-bold text-brand-600 mb-4">
                ZAR {item.product.price.toFixed(2)}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(item.product)}
                  className="flex-1 bg-brand-600 text-white py-2 px-4 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
