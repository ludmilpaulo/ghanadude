// services/SiteSettingService.ts
import axios from 'axios';
import { API_BASE_URL } from './AuthService';

export interface SiteSetting {
  delivery_fee: number;         // base fee per km
  vat_percentage: number;       // VAT %
  address: string;              // store address
  country: string;
}

export const fetchSiteSettings = async (): Promise<SiteSetting> => {
  const res = await axios.get(`${API_BASE_URL}/api/site-settings/`);
  return res.data;
};
