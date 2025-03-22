import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import tw from "twrnc";

const { width } = Dimensions.get("window");

const BANNERS = [
  {
    id: 1,
    image: "https://yourcdn.com/banner1.jpg",
    title: "Summer Collection",
    subtitle: "Up to 50% off",
  },
  {
    id: 2,
    image: "https://yourcdn.com/banner2.jpg",
    title: "New Arrivals",
    subtitle: "Shop the latest styles",
  },
];

const HeroCarousel = () => {
  return (
    <Carousel
      width={width - 32}
      height={180}
      autoPlay
      autoPlayInterval={5000}
      scrollAnimationDuration={800}
      data={BANNERS}
      renderItem={({ item }) => (
        <View style={tw`rounded-xl overflow-hidden bg-white shadow-lg`}>
          <Image
            source={{ uri: item.image }}
            style={tw`w-full h-44`}
            resizeMode="cover"
          />
          <View style={tw`absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4`}>
            <Text style={tw`text-white text-lg font-bold`}>{item.title}</Text>
            <Text style={tw`text-white text-sm`}>{item.subtitle}</Text>
          </View>
        </View>
      )}
    />
  );
};

export default HeroCarousel;
