'use client'

import { useParams } from 'next/navigation'
import ProductGrid from '@/components/ProductGrid'
import { useGetCategoriesQuery, useGetProductsQuery } from '@/redux/svc/api'
import CategoryPills from '@/components/CategoryPills'
import type { Product, Paginated, Category } from '@/lib/types'

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function categoryNameFromSlug(cats: Category[] | undefined, slug: string): string | null {
  if (!cats) return null
  if (slug === 'all') return null
  const match = cats.find((c) => slugify(c.name) === slug)
  return match?.name ?? null
}

export default function CategoryPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data: cats } = useGetCategoriesQuery()
  const { data: products, isLoading } = useGetProductsQuery({})

  const all: Product[] = Array.isArray(products)
    ? products
    : ((products as Paginated<Product> | undefined)?.results ?? [])

  const name = categoryNameFromSlug(cats, slug)
  const list: Product[] = name ? all.filter((p) => p.category === name) : all

  return (
    <section className="container py-8">
      {cats && <CategoryPills categories={cats} />}
      <h1 className="mt-6 text-2xl font-bold capitalize">
        {slug === 'all' ? 'All products' : (name || slug)}
      </h1>
      {isLoading && <div className="py-10 text-center text-gray-500">Loading products...</div>}
      <div className="mt-6">
        <ProductGrid products={list} />
      </div>
      {!isLoading && list.length === 0 && (
        <div className="mt-6 text-gray-600">No products found for this category.</div>
      )}
    </section>
  )
}
