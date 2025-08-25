import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Product, Category, Paginated } from '@/lib/types'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string
if (!baseUrl) {
  // eslint-disable-next-line no-console
  console.warn('NEXT_PUBLIC_API_BASE_URL is not set')
}

type ProductsQueryArgs = {
  page?: number;
  page_size?: number;
  category?: string; // category slug
  search?: string;
  ordering?: string; // e.g., '-created'
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      // Attach language preference if your backend uses it
      if (typeof navigator !== 'undefined') {
        headers.set('Accept-Language', navigator.language || 'en')
      }
      return headers
    },
  }),
  tagTypes: ['Products', 'Product', 'Categories'],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => ({ url: '/api/categories/' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: 'Categories' as const, id: c.id })),
              { type: 'Categories', id: 'LIST' },
            ]
          : [{ type: 'Categories', id: 'LIST' }],
    }),

    getProducts: builder.query<Paginated<Product>, ProductsQueryArgs | void>({
      query: (args) => ({
        url: '/api/products/',
        params: args ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    getProductBySlug: builder.query<Product, string>({
      query: (slug) => ({ url: `/api/products/${slug}/` }),
      providesTags: (_res, _err, slug) => [{ type: 'Product', id: slug }],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetProductBySlugQuery,
} = api
