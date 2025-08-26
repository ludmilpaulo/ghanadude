'use client'

import { z } from 'zod'
import { useState } from 'react'
import { useAppSelector } from '@/redux/hooks'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  address: z.string().min(4),
  city: z.string().min(2),
  country: z.string().min(2),
})

export default function CheckoutPage() {
  const { items } = useAppSelector((s) => s.cart)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', address: '', city: '', country: 'South Africa' })
  const total = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0)

  const onSubmit = async () => {
    const parse = schema.safeParse(form)
    if (!parse.success) {
      alert('Please fill all fields correctly.')
      return
    }
    setLoading(true)
    try {
      // TODO: POST order to Django (/api/orders/ or similar) with items & shipping
      // This is left as a placeholder; connect to your backend endpoint.
      await new Promise((r) => setTimeout(r, 800))
      alert('Order placed successfully (demo). Connect your backend to finalize payment & order creation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container py-10 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-2xl border p-6 space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          <input className="border rounded-xl px-4 py-3" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input className="border rounded-xl px-4 py-3" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="sm:col-span-2 border rounded-xl px-4 py-3" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="border rounded-xl px-4 py-3" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="border rounded-xl px-4 py-3" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <button onClick={onSubmit} disabled={loading} className="bg-brand-600 text-white rounded-xl px-6 py-3 hover:bg-brand-700 disabled:opacity-60">
          {loading ? 'Placing order...' : 'Place order'}
        </button>
      </div>

      <aside className="bg-white rounded-2xl border p-6 h-fit">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-1 text-sm">
          {items.map((it) => (
            <li key={it.product.id} className="flex justify-between">
              <span>{it.quantity}× {it.product.name}</span>
              <span>ZAR {(it.product.price * it.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between font-semibold"><span>Total</span><span>ZAR {total.toFixed(2)}</span></div>
      </aside>
    </section>
  )
}
