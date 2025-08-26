'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingCart, Menu, X, Search, ChevronDown } from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import { useGetCategoriesQuery } from '@/redux/svc/api'
import type { Category } from '@/lib/types'

export default function Navbar() {
  const [openMobile, setOpenMobile] = useState(false)
  const [openShop, setOpenShop] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const items = useAppSelector((s) => s.cart.items)
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const { data: categories } = useGetCategoriesQuery()
  const topCats: Category[] = useMemo(() => (categories ?? []).slice(0, 8), [categories])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus when route changes
  useEffect(() => {
    setOpenMobile(false)
    setOpenShop(false)
  }, [pathname])

  const navBase =
    'sticky top-0 z-50 transition-colors border-b backdrop-blur supports-[backdrop-filter]:bg-white/70'
  const navStyle = scrolled ? 'bg-white/80 border-gray-200 shadow-sm' : 'bg-white/60 border-transparent'

  return (
    <nav className={`${navBase} ${navStyle}`}>
      <div className="container h-16 flex items-center justify-between">
        {/* Left: Brand + mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden inline-flex p-2 rounded-lg border hover:bg-gray-50"
            aria-label="Toggle menu"
            onClick={() => setOpenMobile((v) => !v)}
          >
            {openMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="GhanaDude" width={36} height={36} className="rounded-lg" />
            <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-brand-800 to-brand-500 text-transparent bg-clip-text group-hover:from-brand-900 group-hover:to-brand-600 transition-colors">
              GhanaDude
            </span>
          </Link>
        </div>

        {/* Center: Desktop nav + search */}
        <div className="hidden md:flex items-center gap-6">
          {/* Shop with animated mega menu */}
          <div
            className="relative"
            onMouseEnter={() => setOpenShop(true)}
            onMouseLeave={() => setOpenShop(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium hover:text-brand-700"
              aria-haspopup="true"
              aria-expanded={openShop}
              onClick={() => setOpenShop((v) => !v)}
            >
              Shop <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {openShop && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 mt-3 w-[560px] rounded-2xl border bg-white shadow-2xl p-4"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {topCats.length > 0 ? (
                      topCats.map((c) => (
                        <Link
                          key={c.id}
                          href={`/category/${slugify(c.name)}`}
                          className="rounded-xl border hover:border-brand-300 hover:bg-brand-50/60 px-3 py-2 text-sm"
                        >
                          {c.name}
                        </Link>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 px-1 py-0.5">No categories yet</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      href="/category/all"
                      className="inline-flex items-center text-sm font-medium text-brand-700 hover:underline"
                    >
                      Browse all products →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/about"
            className="font-medium hover:text-brand-700 data-[active=true]:text-brand-700"
            data-active={pathname === '/about'}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="font-medium hover:text-brand-700 data-[active=true]:text-brand-700"
            data-active={pathname === '/contact'}
          >
            Contact
          </Link>

          {/* Desktop search */}
          <form action="/search" className="hidden lg:block">
            <label className="relative block">
              <input
                name="q"
                placeholder="Search products…"
                className="peer w-[280px] xl:w-[340px] rounded-xl border px-9 py-2 text-sm outline-none hover:border-gray-300 focus:border-brand-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 peer-focus:text-brand-600" />
            </label>
          </form>
        </div>

        {/* Right: icons */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label="Search"
            className="md:hidden inline-flex p-2 rounded-lg border hover:bg-gray-50"
          >
            <Search className="w-5 h-5" />
          </Link>

          <Link href="/cart" className="relative inline-flex p-2 rounded-lg border hover:bg-gray-50">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span
                className="absolute -right-1.5 -top-1.5 min-w-5 h-5 px-1 rounded-full bg-brand-600 text-white text-[10px] font-semibold grid place-items-center"
                aria-label={`${cartCount} items in cart`}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {openMobile && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="md:hidden fixed top-0 left-0 h-dvh w-[86%] max-w-[360px] bg-white shadow-2xl z-50"
          >
            <div className="h-16 px-4 border-b flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="GhanaDude" width={32} height={32} className="rounded-md" />
                <span className="font-semibold">GhanaDude</span>
              </Link>
              <button
                aria-label="Close menu"
                className="p-2 rounded-lg border hover:bg-gray-50"
                onClick={() => setOpenMobile(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-3 border-b">
              <form action="/search">
                <label className="relative block">
                  <input
                    name="q"
                    placeholder="Search products…"
                    className="w-full rounded-xl border px-9 py-2 text-sm outline-none hover:border-gray-300 focus:border-brand-400"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </label>
              </form>
            </div>

            <nav className="px-2 py-2">
              <MobileLink href="/category/all" onClick={() => setOpenMobile(false)}>
                Shop
              </MobileLink>

              {/* Mobile Shop section with categories */}
              <div className="mt-1">
                <div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-500">Categories</div>
                <div className="px-2">
                  {(categories ?? []).slice(0, 10).map((c) => (
                    <MobileLink
                      key={c.id}
                      href={`/category/${slugify(c.name)}`}
                      onClick={() => setOpenMobile(false)}
                    >
                      {c.name}
                    </MobileLink>
                  ))}
                </div>
              </div>

              <div className="mt-3 border-t pt-2">
                <MobileLink href="/about" onClick={() => setOpenMobile(false)}>
                  About
                </MobileLink>
                <MobileLink href="/contact" onClick={() => setOpenMobile(false)}>
                  Contact
                </MobileLink>
                <MobileLink href="/cart" onClick={() => setOpenMobile(false)}>
                  Cart ({cartCount})
                </MobileLink>
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {openMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black z-40"
            onClick={() => setOpenMobile(false)}
          />
        )}
      </AnimatePresence>
    </nav>
  )
}

/* ---------- Helpers ---------- */

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function MobileLink(props: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const { href, children, onClick } = props
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 rounded-xl text-[15px] font-medium hover:bg-gray-50"
    >
      {children}
    </Link>
  )
}
