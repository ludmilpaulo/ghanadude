// OrderHistory.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert,
  Linking, ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../services/AuthService';
import { selectUser, selectToken } from '../redux/slices/authSlice';

interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at: string;
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

  const groupOrdersByMonth = (ordersList: Order[]) => {
    const grouped: Record<string, Order[]> = {};
    for (const order of ordersList) {
      const month = new Date(order.created_at).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(order);
    }
    return grouped;
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const groupedOrders = groupOrdersByMonth(orders);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return { bg: 'bg-yellow-200', text: 'text-yellow-800' };
      case 'Processing':
        return { bg: 'bg-blue-200', text: 'text-blue-800' };
      case 'Completed':
        return { bg: 'bg-green-200', text: 'text-green-800' };
      case 'Cancelled':
        return { bg: 'bg-red-200', text: 'text-red-800' };
      default:
        return { bg: 'bg-gray-200', text: 'text-gray-800' };
    }
  };

  return (
    <ScrollView style={tw`flex-1 bg-white px-4 py-6`}>
      <Text style={tw`text-3xl font-bold mb-6 text-blue-700 text-center`}>
        📦 My Orders
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : Object.keys(groupedOrders).length === 0 ? (
        <Text style={tw`text-center text-gray-500 mt-20 text-lg`}>
          No orders found 😞
        </Text>
      ) : (
        Object.entries(groupedOrders).map(([month, monthOrders]) => (
          <View key={month} style={tw`mb-6`}>
            <Text style={tw`text-xl font-semibold text-gray-800 mb-4`}>
              {month}
            </Text>

            {monthOrders.map((order) => {
              const isCancellable = ['Pending', 'Processing'].includes(order.status);
              const statusColor = getStatusColor(order.status);

              return (
                <View
                  key={order.id}
                  style={tw`mb-4 p-4 bg-gray-100 rounded-xl shadow-sm`}
                >
                  <View style={tw`flex-row justify-between items-center mb-2`}>
                    <Text style={tw`text-lg font-bold text-gray-800`}>
                      Order #{order.id}
                    </Text>
                    <View style={tw`px-2 py-1 rounded-full ${statusColor.bg}`}>
                      <Text style={tw`text-xs font-bold ${statusColor.text}`}>
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={tw`text-gray-700 mb-1`}>
                    Total: <Text style={tw`font-bold`}>R{order.total_price.toFixed(2)}</Text>
                  </Text>
                  <Text style={tw`text-gray-500 mb-3`}>
                    {new Date(order.created_at).toLocaleDateString()}
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

                  {isCancellable && (
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
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default OrderHistory;
