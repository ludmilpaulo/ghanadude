// utils/string.ts
export const normalize = (str: string): string =>
  str?.trim().toLowerCase().replace(/\s+/g, " ");

// src/utils/types.ts
export type RootStackParamList = {
  Home: undefined;
  BannerScreen: undefined;
  productPage: { id: number };
  CartPage: undefined;
  CheckoutPage: undefined;
  UserProfile: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  BillingDetailsForm: { totalPrice: number };
  ProfileInformation: undefined;
  OrderHistory: undefined;
};
