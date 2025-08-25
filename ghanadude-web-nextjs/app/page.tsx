'use client'

import Hero from '@/components/Hero'
import ProductGrid from '@/components/ProductGrid'
import CategoryPills from '@/components/CategoryPills'
import { useGetCategoriesQuery, useGetProductsQuery } from '@/redux/svc/api'

export default function HomePage() {
  const { data: cats } = useGetCategoriesQuery()
  const { data: products, isLoading } = useGetProductsQuery({ page_size: 12, ordering: '-created' }, { pollingInterval: 120000 })

  return (
    <div>
      <Hero />
      <section className="container mt-10">
        {cats && <CategoryPills categories={cats} />}
        <h2 className="mt-6 text-xl font-semibold">New arrivals</h2>
        {isLoading && <div className="py-10 text-center text-gray-500">Loading products...</div>}
        {products && <div className="mt-4"><ProductGrid products={products.results} /></div>}
      </section>
    </div>
  )
}
