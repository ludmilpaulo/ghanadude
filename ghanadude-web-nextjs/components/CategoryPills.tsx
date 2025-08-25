'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Category } from '@/lib/types'

export default function CategoryPills({ categories }: { categories: Category[] }) {
  const pathname = usePathname()
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[{ id: 0, name: 'All', slug: 'all'} as Category, ...categories].map((c) => {
        const active = pathname?.includes(`/category/${c.slug}`) || (c.slug === 'all' && pathname === '/')
        return (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${active ? 'bg-brand-600 text-white border-brand-600' : 'bg-white hover:bg-gray-50'}`}
          >
            {c.name}
          </Link>
        )
      })}
    </div>
  )
}
