export interface OrderItem {
  id: number;
  order: number;
  product: number;
  product_name: string;
  quantity: number;
  price: string;
  selected_size: string | null;
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
  payment_method: "card" | "delivery" | "eft";
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  order_type: "delivery" | "collection";
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

export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";
export type OrderType = "delivery" | "collection";


export interface BulkOrderItem {
  id: number;
  product_name: string | null; 
  quantity: number;
  price: string;
  brand_logo?: string;  // ✅ Not brand_logo_url
  custom_design?: string; 
  selected_size: string;
}

export interface BulkOrder {
  id: number;
  user: string;
  designer_name: string;
  quantity: number;
  total_price: string;
  status: OrderStatus;
  created_at: string;
  brand_logo_url?: string;
  reward_applied: string;
  reward_granted: boolean;
  custom_design_url?: string;
  delivery_fee: string;
  vat_amount: string;
  order_type: OrderType;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  pin_code: string | null;
  is_dispatched: boolean;
  items: BulkOrderItem[];
}
