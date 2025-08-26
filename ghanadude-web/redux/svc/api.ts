import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Product, Category, Paginated } from '@/lib/types'

const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || 'https://www.ghanadude.co.za'

type ProductsQueryArgs = {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  category?: string
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      if (typeof navigator !== 'undefined') {
        headers.set('Accept-Language', navigator.language || 'en')
      }
      return headers
    },
  }),
  tagTypes: ['Products', 'Product', 'Categories'],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => ({ url: '/product/categories/' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: 'Categories' as const, id: c.id })),
              { type: 'Categories', id: 'LIST' },
            ]
          : [{ type: 'Categories', id: 'LIST' }],
    }),

    getProducts: builder.query<Paginated<Product> | Product[], ProductsQueryArgs | void>({
      query: (args) => ({
        url: '/product/products/',
        params: args ?? {},
      }),
      providesTags: (result) => {
        const items = Array.isArray(result) ? result : (result?.results ?? [])
        return items.length
          ? [
              ...items.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Products', id: 'LIST' as const },
            ]
          : [{ type: 'Products' as const, id: 'LIST' as const }]
      },
    }),

    getProductById: builder.query<Product, string | number>({
      query: (id) => ({ url: `/product/products/${id}/` }),
      providesTags: (_res, _err, id) => [{ type: 'Product', id }],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
} = api
