import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../services/AuthService';
import { selectUser } from '../redux/slices/authSlice';

const OrderHistory = () => {
  const user = useSelector(selectUser);
  const token = useSelector((state: any) => state.auth.token);
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/user/${user.user_id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch {
      Alert.alert('Error', 'Could not load orders');
    }
  };

  const cancelOrder = async (orderId: number) => {
    try {
      await axios.post(`${API_BASE_URL}/orders/${orderId}/cancel/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Cancelled', 'Order cancelled');
      loadOrders();
    } catch {
      Alert.alert('Error', 'Could not cancel order');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <ScrollView style={tw`p-4`}>
      <Text style={tw`text-2xl font-bold mb-4`}>📦 My Orders</Text>

      {orders.map((order: any) => (
        <View key={order.id} style={tw`mb-4 p-4 bg-white rounded-lg shadow`}>
          <Text style={tw`text-base`}>Order #{order.id}</Text>
          <Text>Status: {order.status}</Text>
          <Text>Total: R{order.total_price}</Text>

          {order.invoice && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`${API_BASE_URL}/orders/${order.id}/invoice/`)}
              style={tw`mt-2 bg-blue-600 py-2 px-4 rounded-lg`}
            >
              <Text style={tw`text-white text-center`}>📄 View Invoice</Text>
            </TouchableOpacity>
          )}

          {(order.status === 'Pending' || order.status === 'Processing') && (
            <TouchableOpacity
              onPress={() => cancelOrder(order.id)}
              style={tw`mt-2 bg-red-600 py-2 px-4 rounded-lg`}
            >
              <Text style={tw`text-white text-center`}>❌ Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default OrderHistory;
