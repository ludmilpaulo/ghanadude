import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import { API_BASE_URL } from '../services/AuthService';
import tw from 'twrnc';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';

type FilterType = 'all' | 'with_invoice' | 'without_invoice';

const InvoiceHistoryScreen = () => {
  const user = useSelector(selectUser);
  const token = useSelector((state: any) => state.auth.token);
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/user/${user.user_id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch {
      Alert.alert('Error', 'Failed to fetch orders');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'with_invoice') return !!order.invoice;
    if (filter === 'without_invoice') return !order.invoice;
    return true;
  });

  const downloadInvoice = async (orderId: number) => {
    const fileUri = FileSystem.documentDirectory + `invoice_${orderId}.pdf`;
    const url = `${API_BASE_URL}/orders/${orderId}/invoice/`;

    try {
      const res = await FileSystem.downloadAsync(
        url,
        fileUri,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Downloaded', `Invoice saved to:\n${res.uri}`);
    } catch {
      Alert.alert('Download failed', 'Could not download the invoice');
    }
  };

  const openInvoicePreview = async (orderId: number) => {
    const pdfUrl = `${API_BASE_URL}/orders/${orderId}/invoice/`;
    setSelectedPDF(pdfUrl);
  };

  return (
    <ScrollView style={tw`flex-1 bg-white p-4`}>
      <Text style={tw`text-2xl font-bold mb-4`}>📄 Invoice History</Text>

      {/* Filter Buttons */}
      <View style={tw`flex-row mb-4`}>
        {['all', 'with_invoice', 'without_invoice'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f as FilterType)}
            style={tw`mr-2 px-3 py-1 rounded-full ${filter === f ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <Text style={tw`${filter === f ? 'text-white' : 'text-black'}`}>{f.replace('_', ' ').toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOrders.map(order => (
        <View key={order.id} style={tw`mb-4 p-4 bg-gray-100 rounded-lg`}>
          <Text style={tw`font-bold`}>Order #{order.id}</Text>
          <Text>Status: {order.status}</Text>
          <Text>Total: R{order.total_price}</Text>

          <View style={tw`flex-row items-center mt-2`}>
            <Text style={tw`text-xs px-2 py-1 rounded-full ${order.invoice ? 'bg-green-600' : 'bg-red-500'} text-white`}>
              {order.invoice ? 'Invoice Available' : 'No Invoice'}
            </Text>
          </View>

          {order.invoice && (
            <>
              <TouchableOpacity
                onPress={() => openInvoicePreview(order.id)}
                style={tw`mt-2 bg-blue-600 py-2 px-4 rounded-lg`}
              >
                <Text style={tw`text-white text-center`}>👀 Preview Invoice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => downloadInvoice(order.id)}
                style={tw`mt-2 bg-green-600 py-2 px-4 rounded-lg`}
              >
                <Text style={tw`text-white text-center`}>⬇️ Download Invoice</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ))}

      {/* PDF Preview In-App via WebView */}
      {selectedPDF && (
        <View style={tw`h-[500px] mt-6 border border-gray-300`}>
          <Text style={tw`text-base font-bold mb-2`}>🧾 PDF Preview</Text>
          <WebView
            source={{ uri: selectedPDF }}
            style={tw`flex-1`}
            originWhitelist={['*']}
            onError={() => Alert.alert('Error', 'Failed to load PDF')}
          />
          <TouchableOpacity
            onPress={() => setSelectedPDF(null)}
            style={tw`bg-red-600 py-2 mt-2 rounded-lg`}
          >
            <Text style={tw`text-white text-center font-bold`}>✖ Close Preview</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default InvoiceHistoryScreen;
