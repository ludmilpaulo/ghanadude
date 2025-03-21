import axios from "axios";

interface CartItem {
    id: number;
    name: string;
    price: number;  // Use number to match the Redux state
    quantity: number;
  }
  
  interface ShippingInfo {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  }
  
  interface OrderData {
    cartItems: CartItem[];
    totalPrice: number;
    shippingInfo: ShippingInfo;
  }
  
  interface CheckoutResponse {
    paymentUrl: string;  // Add this field for the PayFast payment URL
  }
  
  const API_URL = 'http://your-api-url/checkout/';
  
  export const checkout = async (orderData: OrderData, token: string): Promise<CheckoutResponse> => {
    try {
      const data = {
        token,
        total_price: orderData.totalPrice,
        address: orderData.shippingInfo.address,
        city: orderData.shippingInfo.city,
        postal_code: orderData.shippingInfo.postalCode,
        country: 'South Africa',
        payment_method: 'PayFast',
        items: orderData.cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      };
  
      const response = await axios.post<CheckoutResponse>(API_URL, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      return response.data;  // This will return the correct paymentUrl
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Checkout error:', error.message);
      } else {
        console.error('Checkout error:', error);
      }
      throw new Error('Failed to initiate checkout.');
    }
  };
  