'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { removeFromCart, updateQuantity } from '@/redux/slices/cartSlice'
import { firstImageUrl } from '@/lib/img'

export default function CartPage() {
  const { items } = useAppSelector((s) => s.cart)
  const dispatch = useAppDispatch()

  const money = (n: number) => `ZAR ${Number(n).toFixed(2)}`
  const subtotal = items.reduce((sum, it) => sum + Number(it.product.price) * it.quantity, 0)

  if (items.length === 0) {
    return (
      <section className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">Find something you love.</p>
        <Link
          href="/category/all"
          className="inline-block mt-6 bg-brand-600 text-white px-6 py-3 rounded-xl"
        >
          Shop products
        </Link>
      </section>
    )
  }

  return (
    <section className="container py-10 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((it) => {
          const img = firstImageUrl(it.product)
          return (
            <div
              key={`${it.product.id}${it.variantId ?? ''}`}
              className="bg-white rounded-2xl border p-4 flex gap-4 items-center"
            >
              <div className="relative w-24 h-24 rounded-xl overflow-hidden">
                <Image src={img} alt={it.product.name} fill className="object-cover" />
              </div>

              <div className="flex-1">
                <div className="font-medium">{it.product.name}</div>
                <div className="text-sm text-gray-600">{money(Number(it.product.price))}</div>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="px-2 py-1 rounded border"
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          productId: it.product.id,
                          variantId: it.variantId,
                          quantity: Math.max(1, it.quantity - 1),
                        })
                      )
                    }
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{it.quantity}</span>
                  <button
                    className="px-2 py-1 rounded border"
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          productId: it.product.id,
                          variantId: it.variantId,
                          quantity: it.quantity + 1,
                        })
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="text-red-600"
                onClick={() =>
                  dispatch(removeFromCart({ productId: it.product.id, variantId: it.variantId }))
                }
              >
                Remove
              </button>
            </div>
          )
        })}
      </div>

      <aside className="bg-white rounded-2xl border p-6 h-fit">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <div className="mt-4 flex justify-between">
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="mt-1 text-sm text-gray-500">Taxes and shipping calculated at checkout.</div>
        <Link
          href="/checkout"
          className="mt-6 block text-center bg-brand-600 text-white rounded-xl px-6 py-3 hover:bg-brand-700"
        >
          Checkout
        </Link>
      </aside>
    </section>
  )
}
