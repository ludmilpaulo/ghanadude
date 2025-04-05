import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import tw from 'twrnc';
import { FontAwesome } from '@expo/vector-icons';
import ProductService from '../services/ProductService';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import {
  updateBasket,
  selectCartItems,
} from '../redux/slices/basketSlice';
import {
  setBrandLogo,
  setCustomDesign,
  selectDesign,
} from '../redux/slices/designSlice';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../navigation/HomeNavigator';

interface ProductImage {
  id: number;
  image: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  bulk_sale: boolean;
  images: ProductImage[];
  sizes: string[];
}

type DealsScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'DealsScreen'
>;

const DealsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<DealsScreenNavigationProp>();
  const cartItems = useSelector(selectCartItems);
  const { brandLogo, customDesign } = useSelector(selectDesign);

  const [products, setProducts] = useState<Product[]>([]);
  const [bulkQuantities, setBulkQuantities] = useState<Record<number, number>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchBulkProducts();
  }, []);

  const fetchBulkProducts = async () => {
    try {
      const allProducts: Product[] = await ProductService.getProducts();
      setProducts(allProducts.filter((p) => p.bulk_sale));
    } catch {
      Alert.alert('Error', 'Unable to load products.');
    }
  };

  const pickImage = async (
    setter: (uri: string) => void,
    pngOnly = false,
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: false, // You can also set this to true if backend accepts base64
    });
  
    if (!result.canceled) {
      const asset = result.assets[0];
      const uri = asset.uri;
  
      if (pngOnly && !uri.toLowerCase().endsWith('.png')) {
        Alert.alert('Invalid Image', 'Brand logo must be PNG.');
        return;
      }
  
      // Save full asset object to Redux instead of just URI
      setter(uri); // keep this if you just want URI
      // Alternatively, you can save the full asset object if you want to use it in FormData
    }
  };
  

  const handleQuantityChange = (id: number, increase: boolean) => {
    setBulkQuantities((prev) => ({
      ...prev,
      [id]: Math.max(10, (prev[id] || 10) + (increase ? 1 : -1)),
    }));
  };

  const isProductInCart = (productId: number, selectedSize: string): boolean =>
    cartItems.some(
      (item) =>
        item.id === productId &&
        item.selectedSize === selectedSize &&
        item.isBulk,
    );

  const handleAddToCart = (product: Product) => {
    const quantity = bulkQuantities[product.id] || 10;
    const selectedSize = selectedSizes[product.id];

    if (!selectedSize) {
      Alert.alert('Size Required', 'Please select a size.');
      return;
    }

    if (isProductInCart(product.id, selectedSize)) {
      navigation.navigate('Cart');
      return;
    }

    dispatch(
      updateBasket({
        id: product.id,
        name: product.name,
        selectedSize,
        quantity,
        image: product.images[0]?.image,
        price: Number(product.price),
        originalPrice: Number(product.price),
        stock: 100,
        isBulk: true,
        brandLogo, // still just a string URI
        customDesign, // still just a string URI
      }),
    );
    

    Alert.alert('Success', 'Product added to cart.');
  };

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      <Text style={tw`text-2xl font-bold mb-4`}>Exclusive Bulk Deals</Text>

      <TouchableOpacity
        onPress={() => pickImage((uri) => dispatch(setBrandLogo(uri)), true)}
        style={tw`bg-blue-500 py-2 rounded-lg mb-2`}
      >
        <Text style={tw`text-white text-center`}>
          {brandLogo ? '✅ Brand Logo Uploaded' : 'Upload Brand Logo (PNG)'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => pickImage((uri) => dispatch(setCustomDesign(uri)))}
        style={tw`bg-purple-500 py-2 rounded-lg mb-4`}
      >
        <Text style={tw`text-white text-center`}>
          {customDesign ? '✅ Custom Design Uploaded' : 'Upload Custom Design'}
        </Text>
      </TouchableOpacity>

      <ScrollView>
        {products.map(product => (
          <View key={product.id} style={tw`bg-gray-100 p-4 rounded-lg mb-4`}>
            <Image source={{ uri: product.images[0]?.image }} style={tw`h-40 rounded-lg mb-2`} />
            <Text style={tw`text-lg font-semibold`}>{product.name}</Text>
            <Text style={tw`text-gray-500`}>R{product.price}</Text>

            <Picker
              selectedValue={selectedSizes[product.id]}
              onValueChange={val => setSelectedSizes(prev => ({ ...prev, [product.id]: val }))}
            >
              <Picker.Item label="Select Size" value="" />
              {product.sizes.map(size => (
                <Picker.Item key={size} label={size} value={size} />
              ))}
            </Picker>

            <View style={tw`flex-row items-center justify-center my-2`}>
              <TouchableOpacity onPress={() => handleQuantityChange(product.id, false)}>
                <FontAwesome name="minus-circle" size={24} />
              </TouchableOpacity>
              <TextInput
                keyboardType="numeric"
                style={tw`mx-3 text-center border p-2 w-16 rounded`}
                value={(bulkQuantities[product.id] || 10).toString()}
                onChangeText={text => setBulkQuantities(prev => ({
                  ...prev,
                  [product.id]: Math.max(10, parseInt(text, 10) || 10),
                }))}
              />
              <TouchableOpacity onPress={() => handleQuantityChange(product.id, true)}>
                <FontAwesome name="plus-circle" size={24} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleAddToCart(product)}
              style={tw`bg-green-600 py-2 rounded-lg my-2`}
            >
              <Text style={tw`text-white text-center`}>
                {isProductInCart(product.id, selectedSizes[product.id]) ? 'Go to Cart' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ProductDetail', { id: product.id })}
              style={tw`bg-blue-600 py-2 rounded-lg`}
            >
              <Text style={tw`text-white text-center`}>View Product</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default DealsScreen;
