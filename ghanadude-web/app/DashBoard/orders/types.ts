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
  total_price: string; // Use number if it's parsed as number
  address: string;
  city: string;
  postal_code: string;
  country: string;
  discount_amount: string;
  delivery_fee: string;
  vat_amount: string;
  payment_method: 'card' | 'delivery' | 'eft';
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  order_type: 'delivery' | 'collection';
  reward_applied: string;
  reward_granted: boolean;
  created_at: string;
  updated_at: string;
  invoice?: string; // Could be a URL or file path
  products: number[];
  items: OrderItem[];
  pin_code: string | null;
  is_dispatched: boolean;
}


// app/DashBoard/orders/types.ts

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
export type OrderType = 'delivery' | 'collection';

export interface BulkOrder {
  id: number;
  user: string; // From serializer: user.username
  product_name: string; // From serializer: product.name
  designer_name: string; // From serializer: designer.name
  quantity: number;
  status: OrderStatus;
  created_at: string; // ISO timestamp
  brand_logo_url?: string; // From brand_logo (ImageField)
  custom_design_url?: string; // From custom_design (ImageField)
  delivery_fee: string; // Returned as string from DRF
  vat_amount: string; // Returned as string from DRF
  order_type: OrderType;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  pin_code: string | null;
  is_dispatched: boolean;
}

