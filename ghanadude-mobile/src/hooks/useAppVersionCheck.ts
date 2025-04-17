// src/hooks/useAppVersionCheck.ts
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import { API_BASE_URL } from '../services/AuthService';

export const useAppVersionCheck = () => {
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);
  const [storeUrl, setStoreUrl] = useState<string>("");

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const current = Constants.expoConfig?.version ?? '1.0.0'; // ✅ safer access
        const res = await axios.get(`${API_BASE_URL}/api/version/`);
        const latest = res.data.latest_version;
        const storeUrl = Platform.OS === 'ios' ? res.data.app_store_url : res.data.play_store_url;
        setStoreUrl(storeUrl);
        setIsCompatible(current === latest);
      } catch  {
        console.warn('Version check failed. Defaulting to allow access.');
        setIsCompatible(true);
      }
    };
    checkVersion();
  }, []);

  return { isCompatible, storeUrl };
};
