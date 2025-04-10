// services/EarningsService.ts
import axios from "axios";
import { baseAPI } from "@/utils/variables";
import { DevPayment, Earnings } from "@/app/DashBoard/manager/types";


export const fetchEarnings = async (filter: string): Promise<Earnings> => {
  const response = await axios.get(`${baseAPI}/api/admin/dev-earnings/`, {
    params: { filter },
  });
  return response.data;
};

export const fetchPayments = async (): Promise<DevPayment[]> => {
    const res = await axios.get(`${baseAPI}/api/admin/dev-payments/`);
    return res.data;
  };
  
  export const createPayment = async (data: FormData) => {
    await axios.post(`${baseAPI}/api/admin/dev-payment/`, data);
  };