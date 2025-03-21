import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import tw from 'twrnc';

const SuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  return (
    <View style={tw`flex-1 justify-center items-center bg-white px-5`}>
      <View style={tw`bg-green-100 p-6 rounded-full`}>
        <Text style={tw`text-5xl`}>✅</Text>
      </View>
      <Text style={tw`text-3xl font-bold my-4`}>Thank You!</Text>
      <Text style={tw`text-center text-lg text-gray-600`}>
        Your order #{route.params.order_id} has been successfully placed.
      </Text>

      <TouchableOpacity
        style={tw`bg-blue-600 py-3 px-6 rounded-full mt-6`}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={tw`text-white font-semibold`}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SuccessScreen;
