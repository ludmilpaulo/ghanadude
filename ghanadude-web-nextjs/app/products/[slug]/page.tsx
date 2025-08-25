'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useGetProductBySlugQuery } from '@/redux/svc/api'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import { toast } from 'sonner'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading } = useGetProductBySlugQuery(slug)
  const dispatch = useAppDispatch()
  const imgBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''

  if (isLoading) return <div className="container py-10">Loading...</div>
  if (!product) return <div className="container py-10">Product not found.</div>

  return (
    <section className="container py-10 grid md:grid-cols-2 gap-10">
      <div className="relative aspect-square bg-white rounded-3xl overflow-hidden">
        <Image
          src={product.image ? `${imgBase}${product.image}` : '/placeholder.svg'}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        {product.rating !== undefined && (
          <p className="mt-1 text-sm text-gray-600">{product.reviews_count ?? 0} reviews</p>
        )}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-bold">
            {(product.currency || 'ZAR') + ' ' + product.price.toFixed(2)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {(product.currency || 'ZAR') + ' ' + product.compare_at_price.toFixed(2)}
            </span>
          )}
        </div>
        {product.description && (
          <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              dispatch(addToCart({ product, quantity: 1 }))
              toast.success('Added to cart')
            }}
            className="bg-brand-600 text-white rounded-xl px-6 py-3 hover:bg-brand-700"
          >
            Add to cart
          </button>
          <button className="bg-white border rounded-xl px-6 py-3 hover:bg-gray-50">Buy now</button>
        </div>
      </div>
    </section>
  )
}
