import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../services/AuthService';
import { selectUser, selectToken } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';

interface Order {
  id: number;
  status: string;
  total_price: number;
  invoice?: string;
}

const OrderHistory: React.FC = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const ensureAuth = () => {
    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in to view orders.');
      return null;
    }
    return { user, token };
  };

  const loadOrders = async () => {
    const auth = ensureAuth();
    if (!auth) return;

    setLoading(true);
    try {
      const res = await axios.get<Order[]>(
        `${API_BASE_URL}/orders/user/${auth.user.user_id}/`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setOrders(res.data);
      console.log('✅ Orders loaded:', res.data);
    } catch (err) {
      console.error('❌ Failed to load orders:', err);
      Alert.alert('Error', 'Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: number) => {
    const auth = ensureAuth();
    if (!auth) return;

    try {
      await axios.post(
        `${API_BASE_URL}/orders/${orderId}/cancel/`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      Alert.alert('Cancelled', 'Order cancelled successfully');
      loadOrders();
    } catch (err) {
      console.error('❌ Failed to cancel order:', err);
      Alert.alert('Error', 'Could not cancel order');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <ScrollView style={tw`flex-1 bg-gray-100 p-4`}>
      <Text style={tw`text-2xl font-bold mb-4 text-gray-800`}>📦 My Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4A5568" />
      ) : orders.length === 0 ? (
        <Text style={tw`text-center text-gray-500`}>No orders found.</Text>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={tw`mb-4 p-4 bg-white rounded-lg shadow`}>
            <Text style={tw`text-base text-gray-800 font-semibold`}>
              Order #{order.id}
            </Text>
            <Text style={tw`text-gray-700`}>Status: {order.status}</Text>
            <Text style={tw`text-gray-700 mb-2`}>
              Total: R{order.total_price.toFixed(2)}
            </Text>

            {order.invoice && (
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`${API_BASE_URL}/orders/${order.id}/invoice/`)
                }
                style={tw`mb-2 bg-blue-600 py-2 px-4 rounded-lg`}
              >
                <Text style={tw`text-white text-center font-bold`}>
                  📄 View Invoice
                </Text>
              </TouchableOpacity>
            )}

            {(order.status === 'Pending' || order.status === 'Processing') && (
              <TouchableOpacity
                onPress={() => cancelOrder(order.id)}
                style={tw`bg-red-600 py-2 px-4 rounded-lg`}
              >
                <Text style={tw`text-white text-center font-bold`}>
                  ❌ Cancel Order
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default OrderHistory;
