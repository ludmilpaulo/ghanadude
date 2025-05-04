import React from "react";
import { Text, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import tw from "twrnc";
import ImageUploadButton from "../components/ImageUploadButton";
import {
  setBrandLogo,
  setCustomDesign,
  selectDesign,
} from "../redux/slices/designSlice";

const CustomizeScreen = () => {
  const dispatch = useDispatch();
  const { brandLogo, customDesign } = useSelector(selectDesign);

  return (
    <ScrollView style={tw`flex-1 bg-white p-5`}>
      <Text style={tw`text-2xl font-bold mb-4`}>Customize Your Products</Text>

      <ImageUploadButton
        label="Upload Brand Logo (PNG)"
        currentUri={brandLogo}
        onImageSelected={(uri) => dispatch(setBrandLogo(uri))}
        pngOnly
        color="blue-500"
      />

      <ImageUploadButton
        label="Upload Custom Design"
        currentUri={customDesign}
        onImageSelected={(uri) => dispatch(setCustomDesign(uri))}
        color="purple-500"
      />
    </ScrollView>
  );
};

export default CustomizeScreen;
