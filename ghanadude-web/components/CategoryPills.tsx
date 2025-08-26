'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Category } from '@/lib/types'

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function CategoryPills({ categories }: { categories: Category[] }) {
  const pathname = usePathname()
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[{ id: 0, name: 'All' } as Category, ...categories].map((c) => {
        const slug = c.name === 'All' ? 'all' : slugify(c.name)
        const active =
          pathname?.includes(`/category/${slug}`) || (slug === 'all' && pathname === '/')
        return (
          <Link
            key={`${c.id}-${slug}`}
            href={`/category/${slug}`}
            className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${
              active ? 'bg-brand-600 text-white border-brand-600' : 'bg-white hover:bg-gray-50'
            }`}
          >
            {c.name}
          </Link>
        )
      })}
    </div>
  )
}
