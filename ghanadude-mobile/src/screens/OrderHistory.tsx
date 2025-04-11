import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { API_BASE_URL } from '../services/AuthService';
import { selectUser, selectToken } from '../redux/slices/authSlice';
import { fetchUserOrders, Order, OrderItem } from '../services/OrderService';
import { HomeStackParamList } from '../navigation/HomeNavigator';
import ReviewForm from '../components/ReviewForm';

const statusOptions = ['Pending', 'Processing', 'Completed', 'Cancelled'];

const OrderHistory: React.FC = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('Completed');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);

  const ensureAuth = () => {
    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in.');
      return null;
    }
    return { user, token };
  };

  useEffect(() => {
    const auth = ensureAuth();
    if (auth) {
      loadOrders(statusFilter);
    }
  }, [statusFilter]);

  const loadOrders = async (status: string) => {
    const auth = ensureAuth();
    if (!auth) return;

    setLoading(true);
    try {
      const res = await fetchUserOrders(auth.user.user_id, auth.token, status);
      setOrders(res.results);
    } catch {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cancelOrder = async (orderId: number) => {
    const auth = ensureAuth();
    if (!auth) return;

    try {
      await axios.post(
        `${API_BASE_URL}/orders/${orderId}/cancel/`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      Alert.alert('Order Cancelled', 'The order has been cancelled.');
      loadOrders(statusFilter);
    } catch {
      Alert.alert('Error', 'Failed to cancel order');
    }
  };

  const isCancellable = (status: string) => ['Pending', 'Processing'].includes(status);

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

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(q) ||
      order.items?.some(item => item.product.name.toLowerCase().includes(q)) ||
      order.items?.some(item => item.product?.designer?.name?.toLowerCase().includes(q))
    );
  });

  const groupedOrders = groupOrdersByMonth(filteredOrders);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: 'bg-yellow-200', text: 'text-yellow-800' };
      case 'Processing': return { bg: 'bg-blue-200', text: 'text-blue-800' };
      case 'Completed': return { bg: 'bg-green-200', text: 'text-green-800' };
      case 'Cancelled': return { bg: 'bg-red-200', text: 'text-red-800' };
      default: return { bg: 'bg-gray-200', text: 'text-gray-800' };
    }
  };

  const openItemsModal = (items: OrderItem[]) => {
    setSelectedItems(items);
    setItemModalVisible(true);
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView
        style={tw`px-4 pt-6`}
        contentContainerStyle={tw`pb-10`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders(statusFilter);
            }}
          />
        }
      >
        <Text style={tw`text-3xl font-bold text-blue-700 text-center mb-4`}>
          📋 Order History
        </Text>

        <TextInput
          placeholder="🔍 Search order, product, designer..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={tw`bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 mb-4`}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-4`}>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setStatusFilter(status)}
              style={tw`px-4 py-2 mr-2 rounded-full ${
                statusFilter === status ? 'bg-blue-700' : 'bg-gray-300'
              }`}
            >
              <Text style={tw`${statusFilter === status ? 'text-white' : 'text-black'} font-semibold`}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {Object.entries(groupedOrders).map(([month, monthOrders]) => (
          <View key={month} style={tw`mb-6`}>
            <Text style={tw`text-xl font-bold mb-2 text-gray-800`}>{month}</Text>

            {monthOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              const thumbnail = order.items?.[0]?.product.images?.[0]?.image;
              const productId = order.items?.[0]?.product.id;
              const total = typeof order.total_price === 'number'
                ? order.total_price.toFixed(2)
                : parseFloat(order.total_price || '0').toFixed(2);

              return (
                <View key={order.id} style={tw`mb-4 p-4 bg-white rounded-xl shadow-md`}>
                  <View style={tw`flex-row justify-between items-center mb-2`}>
                    <Text style={tw`text-lg font-bold text-gray-800`}>
                      {order.type === 'bulk' ? '🧾 Bulk Order' : '📦 Order'} #{order.id}
                    </Text>
                    <View style={tw`px-2 py-1 rounded-full ${statusColor.bg}`}>
                      <Text style={tw`text-xs font-bold ${statusColor.text}`}>
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  {order.type === 'bulk' && order.bulk_file ? (
                    <TouchableOpacity onPress={() => Linking.openURL(order.bulk_file!)}>
                      <Text style={tw`text-blue-600 underline mb-2`}>
                        📎 View Uploaded Bulk Design
                      </Text>
                    </TouchableOpacity>
                  ) : thumbnail ? (
                    <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { id: productId })}>
                      <Image source={{ uri: thumbnail }} style={tw`w-full h-36 rounded-lg mb-2`} resizeMode="cover" />
                    </TouchableOpacity>
                  ) : null}

                  <Text style={tw`text-gray-700 mb-1`}>
                    Total: <Text style={tw`font-bold`}>R{total}</Text>
                  </Text>

                  <Text style={tw`text-gray-500 mb-1`}>
                    Date: {new Date(order.created_at).toLocaleDateString()}
                  </Text>

                  {'reward_applied' in order && order.reward_applied && order.reward_applied > 0 && (
                    <Text style={tw`text-purple-600 font-semibold mb-1`}>
                      🎁 Rewards Used: R{order.reward_applied.toFixed(2)}
                    </Text>
                  )}

                  {'reward_granted' in order && order.reward_granted && (
                    <Text style={tw`text-green-700 font-semibold mb-1`}>
                      ⭐ Rewards Earned: R{Math.floor(parseFloat(order.total_price.toString()) * 0.05)}
                    </Text>
                  )}

                  <View style={tw`flex-row flex-wrap gap-2 mt-2`}>
                    <TouchableOpacity
                      onPress={() => openItemsModal(order.items)}
                      style={tw`bg-gray-800 py-2 px-4 rounded-lg mb-2`}
                    >
                      <Text style={tw`text-white font-bold`}>📦 View Items</Text>
                    </TouchableOpacity>

                    {isCancellable(order.status) && (
                      <TouchableOpacity
                        onPress={() => cancelOrder(order.id)}
                        style={tw`bg-red-600 py-2 px-4 rounded-lg mb-2`}
                      >
                        <Text style={tw`text-white font-bold`}>❌ Cancel Order</Text>
                      </TouchableOpacity>
                    )}

                    {order.status === 'Completed' && order.items?.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setReviewProductId(order.items[0].product.id)}
                        style={tw`bg-yellow-500 py-2 px-4 rounded-lg mb-2`}
                      >
                        <Text style={tw`text-white font-bold`}>📝 Leave Review</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {loading && (
          <ActivityIndicator size="large" color="#3B82F6" style={tw`mt-4`} />
        )}
      </ScrollView>

      {/* Items Modal */}
      <Modal visible={itemModalVisible} animationType="slide" transparent>
        <View style={tw`flex-1 bg-white p-6`}>
          <Text style={tw`text-xl font-bold mb-4`}>🧾 Order Items</Text>
          <ScrollView>
            {selectedItems.map((item) => (
              <View key={item.id} style={tw`mb-4 border-b border-gray-300 pb-2`}>
                <Text style={tw`font-semibold text-gray-800`}>{item.product.name}</Text>
                <Text>Quantity: {item.quantity}</Text>
                <Text>Price: R{item.price}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable
            onPress={() => setItemModalVisible(false)}
            style={tw`mt-6 bg-red-500 py-3 rounded-lg`}
          >
            <Text style={tw`text-white text-center font-bold`}>Close</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal visible={!!reviewProductId} animationType="slide">
        <View style={tw`flex-1 bg-white`}>
          {reviewProductId && user?.user_id && (
            <ReviewForm
              productId={reviewProductId}
              userId={user.user_id}
              onClose={() => setReviewProductId(null)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default OrderHistory;
