// services/siteSettingService.ts

import { baseAPI } from "@/utils/variables";
import axios from "axios";

export interface SiteSetting {
  brand_price: number;
  custom_price: number;
  delivery_fee: number;
  estimatedWeight: number;
  internationalRate: number;
  vat_percentage: number;
  address: string;
  country: string;
}

const API_URL = baseAPI // adjust if needed

export const fetchSiteSettings = async (): Promise<SiteSetting> => {
  const response = await axios.get(`${API_URL}/api/site-settings/`);
  return response.data;
};
