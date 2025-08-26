'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useGetProductsQuery } from '@/redux/svc/api'
import { firstImageUrl } from '@/lib/img'
import type { Product } from '@/lib/types'

export default function Hero() {
  // Pull a handful of products for the carousel
  const { data, isLoading } = useGetProductsQuery({ page_size: 10, ordering: '-created' })
  const products: Product[] = useMemo(
    () => (Array.isArray(data) ? data : data?.results ?? []),
    [data]
  )

  // Extract distinct, valid image URLs from products
  const slides: string[] = useMemo(() => {
    const urls = products
      .map((p) => firstImageUrl(p))
      .filter((u): u is string => Boolean(u && u.trim().length > 0))
    // de-duplicate while preserving order
    return Array.from(new Set(urls))
  }, [products])

  const [index, setIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const length = slides.length

  // Auto-advance every 3 seconds
  useEffect(() => {
    if (length < 2) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % length)
    }, 3000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [length])

  const goPrev = () => setIndex((i) => (i - 1 + length) % length)
  const goNext = () => setIndex((i) => (i + 1) % length)

  // Pause on hover (nice UX touch)
  const onMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }
  const onMouseLeave = () => {
    if (length < 2) return
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % length)
      }, 3000)
    }
  }

  return (
    <section className="bg-gradient-to-br from-brand-50/80 via-white to-white">
      <div className="container py-16 grid md:grid-cols-2 gap-10 items-center">
        {/* Left: copy & CTAs */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-soft">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-600" />
            New drops every week
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
            Premium Ghanaian Apparel —{' '}
            <span className="text-brand-700">Made for You</span>
          </h1>

          <p className="mt-4 text-gray-600 max-w-xl">
            Shop ready-to-wear styles or customize your own. Upload your logo for branded merch.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/category/all"
              className="inline-flex items-center justify-center bg-brand-600 text-white px-5 py-3 rounded-2xl shadow-soft hover:bg-brand-700"
            >
              Shop now
            </Link>
            <Link
              href="/custom"
              className="inline-flex items-center justify-center bg-white border px-5 py-3 rounded-2xl hover:bg-gray-50"
            >
              Custom orders
            </Link>
          </div>

          {/* Trust row */}
          <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
            <span>Fast delivery</span>
            <span className="h-1 w-1 rounded-full bg-gray-300 inline-block" />
            <span>Secure checkout</span>
            <span className="h-1 w-1 rounded-full bg-gray-300 inline-block" />
            <span>Quality guaranteed</span>
          </div>
        </div>

        {/* Right: carousel */}
        <div className="relative aspect-[4/3] rounded-3xl shadow-soft overflow-hidden bg-gray-100">
          <div
            className="h-full w-full"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={length > 0 ? slides[index] : 'placeholder'}
                initial={{ opacity: 0.0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                {length > 0 ? (
                  <Image
                    src={slides[index]}
                    alt="Featured product"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <Image
                    src="/placeholder.svg"
                    alt="No image"
                    fill
                    className="object-cover"
                    priority
                  />
                )}

                {/* subtle gradient overlay for readability */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls (hidden if only one slide) */}
          {length > 1 && (
            <>
              <button
                aria-label="Previous slide"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-white/90 border shadow hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next slide"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-white/90 border shadow hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === index ? 'w-6 bg-white shadow ring-1 ring-black/10' : 'w-2.5 bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Loading shimmer */}
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
          )}
        </div>
      </div>
    </section>
  )
}
