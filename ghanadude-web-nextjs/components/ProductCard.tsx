'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import RatingStars from './RatingStars'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import { toast } from 'sonner'

type Props = { product: Product }

export default function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch()
  const imgBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''

  const price = product.price
  const compare = product.compare_at_price

  return (
    <div className="group bg-white rounded-2xl border overflow-hidden hover:shadow-soft transition-shadow">
      <Link href={`/products/${product.slug}`} className="block relative aspect-square">
        <Image
          src={product.image ? `${imgBase}${product.image}` : '/placeholder.svg'}
          alt={product.name}
          fill
          className="object-cover"
        />
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`} className="font-medium line-clamp-1">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold">{
              (product.currency || 'ZAR') + ' ' + price.toFixed(2)
            }</span>
            {compare && compare > price && (
              <span className="text-xs text-gray-500 line-through">
                {(product.currency || 'ZAR') + ' ' + compare.toFixed(2)}
              </span>
            )}
          </div>
          <RatingStars rating={product.rating} />
        </div>
        <button
          onClick={() => {
            dispatch(addToCart({ product, quantity: 1 }))
            toast.success('Added to cart')
          }}
          className="mt-3 w-full bg-brand-600 text-white rounded-xl py-2 hover:bg-brand-700"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}
