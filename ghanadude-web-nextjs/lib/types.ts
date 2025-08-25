export type Category = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  sku?: string | null;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  currency?: string; // e.g., 'ZAR' | 'GHS' | 'USD'
  image?: string | null;
  gallery?: string[];
  rating?: number | null;
  reviews_count?: number | null;
  in_stock?: boolean;
  category?: Category | number | null;
  variants?: Array<{
    id: number;
    name: string;
    price?: number | null;
    image?: string | null;
  }>;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
