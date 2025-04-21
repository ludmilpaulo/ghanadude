export interface Earnings {
  regular_earnings: number;
  bulk_earnings: number;
  total_earnings: number;
  monthly_breakdown: { month: string; total: number }[];
  order_breakdown: { order_id: number; earnings: number; type: string }[];
  paid_to_dev: number;
  remaining_earnings: number;
}

export interface DevPayment {
  id: number;
  amount: number;
  created_at: string;
  invoice: string;
  note: string;
}
