'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import RatingStars from './RatingStars'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import { toast } from 'sonner'
import { firstImageUrl } from '@/lib/img'

type Props = { product: Product }

export default function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch()
  const url = firstImageUrl(product)
  const money = (n: number) => `ZAR ${Number(n).toFixed(2)}`

  return (
    <div className="group bg-white rounded-2xl border overflow-hidden hover:shadow-soft transition-shadow">
      <Link href={`/products/${product.id}`} className="block relative aspect-square">
        <Image src={url} alt={product.name} fill className="object-cover" />
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.id}`} className="font-medium line-clamp-1">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold">{money(product.price)}</span>
          </div>
          <RatingStars rating={product.rating} />
        </div>
        <button
          onClick={() => {
            dispatch(addToCart({ product, quantity: 1 }))
            try { toast.success('Added to cart') } catch {}
          }}
          className="mt-3 w-full bg-brand-600 text-white rounded-xl py-2 hover:bg-brand-700"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}
