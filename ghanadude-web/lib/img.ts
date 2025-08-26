import type { Product } from '@/lib/types'

export function firstImageUrl(p: Product): string {
  // Your serializer returns absolute URLs in images[].image
  if (p.images && p.images.length > 0 && p.images[0].image) {
    return p.images[0].image
  }
  return '/placeholder.svg'
}
