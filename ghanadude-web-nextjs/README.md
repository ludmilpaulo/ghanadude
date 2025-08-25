# GhanaDude Web (Next.js + TypeScript + Tailwind + Redux Toolkit)

A modern, attractive e‑commerce storefront for **GhanaDude**, consuming the Django REST backend you shared.

## ✨ Features
- Next.js App Router (TypeScript, strict mode)
- Tailwind CSS with clean, modern UI
- Redux Toolkit + RTK Query for data & caching (no `any`)
- Product list, category filter, product detail
- Client cart with badge & checkout skeleton
- 2‑minute background polling for fresh products
- SEO metadata & responsive layout

## 🔧 Configure
1. Copy `.env.local.example` to `.env.local` and set your API base URL:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_IMAGE_BASE_URL=http://localhost:8000
   ```

   Back-end endpoints expected (adjust if your Django routes differ):
   - `GET /api/categories/` → `Category[]`
   - `GET /api/products/` → `Paginated<Product>` (supports `page`, `page_size`, `category` (slug), `search`, `ordering`)
   - `GET /api/products/:slug/` → `Product`

2. Install deps & run:
   ```bash
   npm i
   npm run dev
   ```

## 🧱 Project Structure
```
app/                # App Router pages
components/         # UI components
lib/                # Shared types
redux/              # Store + RTK Query + slices
public/             # Logo & placeholders
tailwind.config.ts
```

## 🧩 Hooking up Orders & Auth
- Create an order endpoint on Django (e.g. `POST /api/orders/`) and replace the TODO in `app/checkout/page.tsx` to call it.
- If you use Djoser/JWT, add endpoints to `redux/svc/api.ts` for `auth/jwt/create/` and attach the token in `prepareHeaders`.

## 🖼 Images
Set `NEXT_PUBLIC_IMAGE_BASE_URL` (e.g. `https://yourdomain.com`) if your product images are served under `/media/...`

## 🧪 Notes
- This template avoids `any`, uses strong domain types, and keeps UI performant.
- Customize colors (Tailwind `brand` palette) to your preference.
- Add filters/sorts/search in `app/category/[slug]/page.tsx` via `useGetProductsQuery` params.
