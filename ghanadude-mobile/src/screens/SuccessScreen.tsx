import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../navigation/HomeNavigator';
import tw from 'twrnc';

type SuccessScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'SuccessScreen'>;
type SuccessScreenRouteProp = RouteProp<HomeStackParamList, 'SuccessScreen'>;

const SuccessScreen = () => {
  const navigation = useNavigation<SuccessScreenNavigationProp>();
  const route = useRoute<SuccessScreenRouteProp>();

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
