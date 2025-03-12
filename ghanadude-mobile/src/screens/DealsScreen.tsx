import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import tw from 'twrnc';
import { FontAwesome, Feather } from '@expo/vector-icons';

const deals = [
    { id: '1', title: 'Deal 1', description: 'Get 20% off for bulk purchases', price: 100, image: 'https://via.placeholder.com/150' },
    { id: '2', title: 'Deal 2', description: 'Exclusive wholesale prices', price: 250, image: 'https://via.placeholder.com/150' },
    { id: '3', title: 'Deal 3', description: 'Limited-time discount on bulk orders', price: 150, image: 'https://via.placeholder.com/150' },
];

const DealsScreen = () => {
    const [bulkQuantities, setBulkQuantities] = useState<{ [key: string]: number }>({});
    const [brandLogo, setBrandLogo] = useState<string | null>(null);

    // Handle Quantity Change
    const handleQuantityChange = (id: string, increase: boolean) => {
        setBulkQuantities((prev) => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + (increase ? 1 : -1)),
        }));
    };

    // Handle Image Upload
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setBrandLogo(result.assets[0].uri);
        }
    };

    return (
        <View style={tw`flex-1 bg-white p-5`}>
            <Text style={tw`text-2xl font-bold mb-5`}>Exclusive Deals</Text>

            {/* Upload Brand Section */}
            <View style={tw`bg-gray-100 p-4 rounded-lg mb-5 flex items-center`}>
                <Text style={tw`text-lg font-semibold mb-2`}>Upload Your Brand Logo</Text>
                {brandLogo ? (
                    <Image source={{ uri: brandLogo }} style={tw`w-24 h-24 rounded-full mb-3`} />
                ) : (
                    <View style={tw`w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-3`}>
                        <FontAwesome name="image" size={30} color="gray" />
                    </View>
                )}
                <TouchableOpacity
                    onPress={pickImage}
                    style={tw`bg-blue-600 px-4 py-2 rounded-lg flex-row items-center`}
                >
                    <Feather name="upload" size={16} color="white" />
                    <Text style={tw`text-white font-semibold ml-2`}>Upload Logo</Text>
                </TouchableOpacity>
            </View>

            {/* Deals List */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {deals.map((deal) => (
                    <View key={deal.id} style={tw`bg-gray-100 p-4 rounded-lg mb-4`}>
                        {/* Product Image */}
                        <Image source={{ uri: deal.image }} style={tw`w-full h-40 rounded-lg mb-3`} />

                        {/* Product Details */}
                        <Text style={tw`text-lg font-semibold`}>{deal.title}</Text>
                        <Text style={tw`text-gray-500 mb-2`}>{deal.description}</Text>
                        <Text style={tw`text-black font-bold text-lg`}>R{deal.price}</Text>

                        {/* Bulk Purchase Quantity Selector */}
                        <View style={tw`flex-row items-center mt-3`}>
                            <TouchableOpacity
                                onPress={() => handleQuantityChange(deal.id, false)}
                                disabled={bulkQuantities[deal.id] === 1}
                            >
                                <FontAwesome name="minus-circle" size={20} color={bulkQuantities[deal.id] > 1 ? "black" : "gray"} />
                            </TouchableOpacity>

                            <TextInput
                                style={tw`mx-3 text-lg font-semibold border px-4 py-1 w-16 text-center rounded-lg`}
                                keyboardType="numeric"
                                value={(bulkQuantities[deal.id] || 1).toString()}
                                onChangeText={(text) =>
                                    setBulkQuantities((prev) => ({
                                        ...prev,
                                        [deal.id]: Math.max(1, Number(text) || 1),
                                    }))
                                }
                            />

                            <TouchableOpacity onPress={() => handleQuantityChange(deal.id, true)}>
                                <FontAwesome name="plus-circle" size={20} color="black" />
                            </TouchableOpacity>
                        </View>

                        {/* Buy Now Button */}
                        <TouchableOpacity style={tw`bg-green-600 mt-3 p-3 rounded-lg`}>
                            <Text style={tw`text-white font-semibold text-center`}>Buy in Bulk</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default DealsScreen;
