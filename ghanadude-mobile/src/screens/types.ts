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

      // ✅ Optional fields for richer display
    average_rating?: number;   // for displaying stars
    total_reviews?: number;    // optional: number of reviews
    is_featured?: boolean;
  }
  
  export interface Category {
    id: string;
    name: string;
  }
  
  export interface Size {
    id: number;
    name: string;
  }

  export type PayFastSubscriptionFrequency =
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Biannually'
  | 'Annual'

export type PayFastSubscriptionDetails = {
  subscriptionType: number
  billingDate?: string
  recurringAmount?: number
  frequency: PayFastSubscriptionFrequency
  cycles: number
}

export type PayFastTransactionDetails = {
  customerFirstName?: string
  customerLastName?: string
  customerEmailAddress?: string
  customerPhoneNumber?: string
  reference?: string
  amount: number
  itemName: string
  itemDescription?: string
}

export type PayFastMerchantDetails = {
  notifyUrl?: string
  sandbox?: boolean
  signature?: boolean
  merchantId?: string
  merchantKey?: string
  passPhrase?: string
}

export type ChargeCardToken = {
  token: string
  total: number
  itemName: string
  itemDescription?: string
  reference: string
}