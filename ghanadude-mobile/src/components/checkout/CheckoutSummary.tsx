import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import InfoTooltip from '../InfoTooltip';


interface CheckoutSummaryProps {
  cartItems: { quantity: number; price: number; name: string }[];
  rewardApplied: number;
  rewardBalance: number;
  siteSettings: {
    vat_percentage: number;
    delivery_fee: number;
    address: string;
    country: string;
  } | null;
  orderType: 'delivery' | 'collection';
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  cartItems,
  rewardApplied,
  rewardBalance,
  siteSettings,
  orderType,
}) => {
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      
  const vatRate = siteSettings ? siteSettings.vat_percentage : 0;
  const deliveryFee = orderType === 'delivery' && siteSettings?.delivery_fee != null
  ? Number(siteSettings.delivery_fee)
  : 0;



  const vatAmount = parseFloat(((subtotal * vatRate) / 100).toFixed(2));
  const total = subtotal + vatAmount + deliveryFee - rewardApplied;

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
        <Text>R{Number(deliveryFee || 0).toFixed(2)}</Text>

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
            <InfoTooltip text={`You've used R${rewardApplied.toFixed(2)} of your R${rewardBalance.toFixed(2)} reward balance.`} />
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
