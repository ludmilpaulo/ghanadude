// services/PaymentService.ts
import axios from "axios";
import { API_BASE_URL } from "./AuthService";



export interface PaymentGatewayInfo {
    url: string; // <-- required from backend
    return_url: string;
    notify_url: string;
    cancel_url: string;
    merchantId: string;
    merchantKey: string;
    sandbox: boolean;
  }
  

export const fetchPaymentGateway = async (): Promise<PaymentGatewayInfo> => {
  const response = await axios.get(`${API_BASE_URL}/api/paymentgateway/active/`);
  return response.data;
};
