export interface OrderItem {
  id: number;
  order: number;
  product: number;
  product_name: string;
  quantity: number;
  price: string;
}

export interface Order {
  id: number;
  user: string;
  total_price: string; // or number if consistent
  address: string;
  city: string;
  postal_code: string;
  country: string;
  discount_amount: string;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  invoice?: string;
  coupon: number | null;
  products: number[];
  items: {
    id: number;
    order: number;
    product: number;
    product_name: string;
    quantity: number;
    price: string;
  }[];
}

