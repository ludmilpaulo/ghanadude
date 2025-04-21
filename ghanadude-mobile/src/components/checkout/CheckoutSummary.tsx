import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import tw from "twrnc";
import InfoTooltip from "../InfoTooltip";

interface CheckoutSummaryProps {
  cartItems: { quantity: number; price: number; name: string }[];
  rewardApplied: number;
  rewardBalance: number;
  siteSettings: {
    vat_percentage: number;
    delivery_fee: number;
    brand_price: number;
    custom_price: number;
    address: string;
    country: string;
  } | null;
  brandLogoQty?: number;
  customDesignQty?: number;
  orderType: "delivery" | "collection";
  deliveryFee: number;
  deliveryFeeLoading?: boolean;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  cartItems,
  rewardApplied,
  rewardBalance,
  siteSettings,
  brandLogoQty = 0,
  customDesignQty = 0,
  orderType,
  deliveryFee,
  deliveryFeeLoading = false,
}) => {
  const brand_price = siteSettings?.brand_price || 0;
  const custom_price = siteSettings?.custom_price || 0;

  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const designSubtotal =
    brand_price * brandLogoQty + custom_price * customDesignQty;
  const subtotal = cartSubtotal + designSubtotal;

  const vatRate = siteSettings ? siteSettings.vat_percentage : 0;
  const vatAmount = parseFloat(((subtotal * vatRate) / 100).toFixed(2));
  const total =
    subtotal +
    vatAmount +
    (orderType === "delivery" ? deliveryFee : 0) -
    rewardApplied;

  return (
    <View style={tw`bg-white shadow-md p-4 rounded-lg mt-4`}>
      <Text style={tw`text-lg font-semibold mb-2`}>Order Summary</Text>

      <View style={tw`flex-row justify-between mb-1`}>
        <Text>🛍️ Subtotal</Text>
        <Text>R{subtotal.toFixed(2)}</Text>
      </View>

      <View style={tw`flex-row justify-between mb-1 items-center`}>
        <Text>📦 Delivery</Text>
        <View style={tw`flex-row items-center`}>
          {orderType === "collection" ? (
            <Text>R0.00</Text>
          ) : deliveryFeeLoading ? (
            <ActivityIndicator size="small" color="#888" />
          ) : (
            <Text>R{Number(deliveryFee).toFixed(2)}</Text>
          )}
          <InfoTooltip text="Delivery fee is based on distance and estimated parcel weight." />
        </View>
      </View>

      <View style={tw`flex-row justify-between mb-1 items-center`}>
        <Text>🧾 VAT ({vatRate}%)</Text>
        <View style={tw`flex-row items-center`}>
          <Text>R{vatAmount.toFixed(2)}</Text>
          <InfoTooltip text="Value-Added Tax charged on this order." />
        </View>
      </View>

      {rewardApplied > 0 && (
        <View style={tw`flex-row justify-between mb-1 items-center`}>
          <Text>🎁 Reward Used</Text>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-green-700`}>-R{rewardApplied.toFixed(2)}</Text>
            <InfoTooltip
              text={`You've used R${rewardApplied.toFixed(2)} of your R${rewardBalance.toFixed(2)} reward balance.`}
            />
          </View>
        </View>
      )}

      <View style={tw`border-t border-gray-300 my-2`} />

      <View style={tw`flex-row justify-between items-center`}>
        <Text style={tw`text-lg font-bold`}>💰 Total</Text>
        <Text style={tw`text-lg font-bold`}>R{total.toFixed(2)}</Text>
      </View>
    </View>
  );
};
export default CheckoutSummary;
