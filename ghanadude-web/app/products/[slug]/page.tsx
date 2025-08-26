'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useGetProductByIdQuery } from '@/redux/svc/api'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import { toast } from 'sonner'
import { firstImageUrl } from '@/lib/img'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useGetProductByIdQuery(id)
  const dispatch = useAppDispatch()

  if (isLoading) return <div className="container py-10">Loading...</div>
  if (!product) return <div className="container py-10">Product not found.</div>

  const main = firstImageUrl(product)
  const money = (n: number) => `ZAR ${Number(n).toFixed(2)}`
  const price = Number(product.price)

  return (
    <section className="container py-10 grid md:grid-cols-2 gap-10">
      <div className="relative aspect-square bg-white rounded-3xl overflow-hidden">
        <Image src={main} alt={product.name} fill className="object-cover" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-bold">{money(price)}</span>
        </div>

        {product.description && (
          <div
            className="prose max-w-none mt-4 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium">Available sizes</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <span key={s} className="inline-flex px-3 py-1 rounded-full border text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              dispatch(addToCart({ product, quantity: 1 }))
              try { toast.success('Added to cart') } catch {}
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
