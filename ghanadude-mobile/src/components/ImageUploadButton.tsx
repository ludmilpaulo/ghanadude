import React from "react";
import { Alert, TouchableOpacity, Text, Image, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import tw from "twrnc";

interface ImageUploadButtonProps {
  label: string;
  currentUri?: string | null;
  onImageSelected: (uri: string) => void;
  pngOnly?: boolean;
  color?: string; // tailwind color string like 'blue-500'
  showPreview?: boolean;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  label,
  currentUri,
  onImageSelected,
  pngOnly = false,
  color = "blue-500",
  showPreview = true,
}) => {
  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) {
      console.log("❌ Image picker canceled.");
      return;
    }

    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    if (pngOnly && !uri.toLowerCase().endsWith(".png")) {
      Alert.alert("Invalid Image", "Image must be a PNG file.");
      return;
    }

    Image.getSize(
      uri,
      (width, height) => {
        Alert.alert("Image Selected", `Dimensions: ${width} x ${height}`);
      },
      (err) => console.log("Error getting dimensions:", err),
    );

    onImageSelected(uri);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) {
      console.log("❌ Camera canceled.");
      return;
    }

    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    if (pngOnly && !uri.toLowerCase().endsWith(".png")) {
      Alert.alert("Invalid Image", "Image must be a PNG file.");
      return;
    }

    Image.getSize(
      uri,
      (width, height) => {
        Alert.alert("Photo Captured", `Dimensions: ${width} x ${height}`);
      },
      (err) => console.log("Error getting dimensions:", err),
    );

    onImageSelected(uri);
  };

  const handleImageSelect = () => {
    Alert.alert(
      "Upload Image",
      "Choose an option",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Gallery", onPress: pickFromGallery },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={tw`mb-4`}>
      <TouchableOpacity
        onPress={handleImageSelect}
        style={tw`bg-${color} py-3 rounded-lg`}
      >
        <Text style={tw`text-white text-center font-bold`}>
          {currentUri ? `✅ ${label} Uploaded` : `Upload ${label}`}
        </Text>
      </TouchableOpacity>

      {showPreview && currentUri && (
        <View style={tw`items-center mt-2`}>
          <Image
            source={{ uri: currentUri }}
            style={tw`w-24 h-24 rounded-lg`}
            resizeMode="cover"
          />
          <Text style={tw`text-xs text-gray-500 mt-1`}>{label}</Text>
        </View>
      )}
    </View>
  );
};

export default ImageUploadButton;
