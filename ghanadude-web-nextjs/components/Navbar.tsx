'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'
import { useAppSelector } from '@/redux/hooks'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const items = useAppSelector((s) => s.cart.items)
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <nav className="bg-white shadow-soft sticky top-0 z-50">
      <div className="container h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>
            {open ? <X /> : <Menu />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="GhanaDude" width={36} height={36} />
            <span className="font-semibold text-lg tracking-wide">GhanaDude</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/category/all" className="hover:text-brand-700">Shop</Link>
          <Link href="/about" className="hover:text-brand-700">About</Link>
          <Link href="/contact" className="hover:text-brand-700">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/search" aria-label="Search" className="hover:text-brand-700 hidden sm:inline-flex">
            <Search />
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-brand-600 text-white text-xs px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="container py-2 flex flex-col">
            <Link href="/category/all" className="py-2" onClick={() => setOpen(false)}>Shop</Link>
            <Link href="/about" className="py-2" onClick={() => setOpen(false)}>About</Link>
            <Link href="/contact" className="py-2" onClick={() => setOpen(false)}>Contact</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
