import axios from "axios";
import { baseAPI } from "@/utils/variables";

// ========== Types ==========
export interface SiteSettings {
  brand_price: string;
  custom_price: string;
  delivery_fee: string;
  vat_percentage: string;
  address: string;
  country: string;
}

export interface AppVersion {
  id: number;
  platform: string;
  latest_version: string;
  store_url: string;
  force_update: boolean;
  logo: string; // This is the URL returned from backend
}

// Used when updating with a file
export interface AppVersionFormData {
  platform: string;
  latest_version: string;
  store_url: string;
  force_update: string;
  logo?: File;
}

// ========== SITE SETTINGS ==========
export const getSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const response = await axios.get<SiteSettings>(
      `${baseAPI}/api/settings/site/`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch site settings", error);
    throw error;
  }
};

export const updateSiteSettings = async (
  data: SiteSettings,
): Promise<SiteSettings> => {
  try {
    const response = await axios.put<SiteSettings>(
      `${baseAPI}/api/settings/site/`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update site settings", error);
    throw error;
  }
};

// ========== APP VERSIONS ==========
export const getAppVersions = async (): Promise<AppVersion[]> => {
  try {
    const response = await axios.get<AppVersion[]>(
      `${baseAPI}/api/settings/app-versions/`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch app versions", error);
    throw error;
  }
};

export const updateAppVersion = async (
  id: number,
  data: FormData,
): Promise<AppVersion> => {
  try {
    const response = await axios.put<AppVersion>(
      `${baseAPI}/api/settings/app-versions/${id}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update app version", error);
    throw error;
  }
};
