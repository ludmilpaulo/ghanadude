// types.ts


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
