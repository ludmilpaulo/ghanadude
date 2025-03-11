// types.ts

export interface ProductImage {
    id: number;
    image: string;
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    category: string;
    brand: number;
    stock: number;
    on_sale: boolean;
    discount_percentage: number;
    season: 'summer' | 'winter' | 'all_seasons';
    images: ProductImage[];
    sizes: string[];
  }
  
  export interface Category {
    id: string;
    name: string;
  }
  
  export interface Size {
    id: number;
    name: string;
  }
  