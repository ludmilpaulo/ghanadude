import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../navigation/HomeNavigator';
import tw from 'twrnc';
import { StackNavigationProp } from '@react-navigation/stack';
// import { useDispatch } from 'react-redux';
// import { resetBasket } from '../redux/slices/basketSlice';

type SuccessScreenRouteProp = RouteProp<HomeStackParamList, 'SuccessScreen'>;
type NavigationProp = StackNavigationProp<HomeStackParamList, 'SuccessScreen'>;

const SuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SuccessScreenRouteProp>();
  const [loading, setLoading] = useState(false);
  // const dispatch = useDispatch();

  const handleContinue = async () => {
    setLoading(true);

    // dispatch(resetBasket()); // Optional: clear basket
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    }, 400); // small delay for UX
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-white px-6`}>
      <View style={tw`bg-green-100 p-6 rounded-full mb-6`}>
        <Text style={tw`text-5xl text-green-600`}>✓</Text>
      </View>

      <Text style={tw`text-3xl font-bold text-gray-800 mb-2`}>Thank You!</Text>
      <Text style={tw`text-center text-lg text-gray-600 mb-4`}>
        Your order #{route.params?.order_id || 'N/A'} has been successfully placed.
      </Text>

      <TouchableOpacity
        style={tw`bg-blue-600 w-full py-3 rounded-full mt-4 ${loading ? 'opacity-50' : ''}`}
        onPress={handleContinue}
        disabled={loading}
      >
        {loading ? (
          <View style={tw`flex-row justify-center items-center`}>
            <ActivityIndicator color="#fff" />
            <Text style={tw`text-white font-semibold ml-2`}>Loading...</Text>
          </View>
        ) : (
          <Text style={tw`text-white font-semibold text-center`}>Continue Shopping</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SuccessScreen;
