// services/SiteSettingService.ts
import axios from "axios";
import { API_BASE_URL } from "./AuthService";

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

export const fetchSiteSettings = async (): Promise<SiteSetting> => {
  const res = await axios.get(`${API_BASE_URL}/api/site-settings/`);
  const settings = res.data;

  return {
    brand_price: parseFloat(settings.brand_price),
    custom_price: parseFloat(settings.custom_price),
    delivery_fee: parseFloat(settings.delivery_fee),
    estimatedWeight: parseFloat(settings.estimatedWeight),
    internationalRate: parseFloat(settings.internationalRate),
    vat_percentage: parseFloat(settings.vat_percentage),
    address: settings.address,
    country: settings.country,
  };
};
