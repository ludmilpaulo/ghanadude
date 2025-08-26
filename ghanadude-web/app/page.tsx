'use client'

import Hero from '@/components/Hero'
import ProductGrid from '@/components/ProductGrid'
import CategoryPills from '@/components/CategoryPills'
import { useGetCategoriesQuery, useGetProductsQuery } from '@/redux/svc/api'
import type { Product, Paginated } from '@/lib/types'

export default function HomePage() {
  const { data: cats } = useGetCategoriesQuery()
  const { data: products, isLoading } = useGetProductsQuery(
    { page_size: 12, ordering: '-created' },
    { pollingInterval: 120000 }
  )

  const list: Product[] = Array.isArray(products)
    ? products
    : ((products as Paginated<Product> | undefined)?.results ?? [])

  return (
    <div>
      <Hero />
      <section className="container mt-10">
        {cats && <CategoryPills categories={cats} />}
        <h2 className="mt-6 text-xl font-semibold">New arrivals</h2>
        {isLoading && <div className="py-10 text-center text-gray-500">Loading products...</div>}
        <div className="mt-4">
          <ProductGrid products={list} />
        </div>
      </section>
    </div>
  )
}
