import CryptoJS from 'crypto-js';

export const removeUndefined = (obj: any) => {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};

export const buildQueryString = (payload: any) => {
  return Object.entries(payload)
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string).replace(/%20/g, '+')}`)
    .join('&');
};

export const generateMD5 = (data: string) => CryptoJS.MD5(data).toString();
