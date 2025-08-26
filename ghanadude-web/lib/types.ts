// Types aligned to your DRF serializers (no `any`)

export type Category = {
  id: number;
  name: string;
};

export type Brand = {
  id: number;
  name: string;
  logo?: string | null;
  logo_url?: string | null;
};

export type ImageItem = {
  id: number;
  image: string; // absolute URL (via ImageSerializer.get_image -> Image.url)
};

export type Product = {
  id: number;
  name: string;
  description?: string | null; // CKEditor5 HTML
  images: ImageItem[];         // from ImageSerializer
  price: number;               // serializer returns price_with_markup
  category: string;            // category name
  brand: string;               // brand name
  stock: number;
  on_sale: boolean;
  bulk_sale: boolean;
  discount_percentage: number;
  season: 'summer' | 'winter' | 'all_seasons';
  gender: 'unisex' | 'male' | 'female';
  sizes: string[];             // names only

  // optional UI extras if you add them later:
  rating?: number | null;
  reviews_count?: number | null;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
