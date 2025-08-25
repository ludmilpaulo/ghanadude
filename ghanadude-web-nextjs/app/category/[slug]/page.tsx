'use client'

import { useParams } from 'next/navigation'
import ProductGrid from '@/components/ProductGrid'
import { useGetCategoriesQuery, useGetProductsQuery } from '@/redux/svc/api'
import CategoryPills from '@/components/CategoryPills'

export default function CategoryPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data: cats } = useGetCategoriesQuery()
  const { data: products, isLoading } = useGetProductsQuery(slug === 'all' ? {} : { category: slug })

  return (
    <section className="container py-8">
      {cats && <CategoryPills categories={cats} />}
      <h1 className="mt-6 text-2xl font-bold capitalize">{slug === 'all' ? 'All products' : slug}</h1>
      {isLoading && <div className="py-10 text-center text-gray-500">Loading products...</div>}
      {products && <div className="mt-6"><ProductGrid products={products.results} /></div>}
    </section>
  )
}
