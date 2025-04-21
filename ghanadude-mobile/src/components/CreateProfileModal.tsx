import React, { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import tw from "twrnc";
import { fetchAndPrefillLocation } from "../services/LocationService";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
};

export default function CreateProfileModal({
  visible,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    setErrors((prev) => ({ ...prev, [key]: "" })); // clear error on change
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!form.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (form.phone_number.length < 8) {
      newErrors.phone_number = "Phone number must be at least 8 digits";
    }
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.postal_code.trim())
      newErrors.postal_code = "Postal code is required";
    if (!form.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    console.log("Form Data Sent:", form);
    onSave(form);
  };

  useEffect(() => {
    if (visible) {
      fetchAndPrefillLocation().then((location) => {
        if (location) {
          setForm((prev) => ({
            ...prev,
            ...location,
          }));
        }
      });
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={tw`flex-1 justify-center bg-black/50`}>
        <View style={tw`bg-white m-4 p-6 rounded-2xl shadow-lg max-h-[85%]`}>
          <Text style={tw`text-xl font-bold mb-4 text-center`}>
            Complete Your Profile
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {[
              { label: "First Name", key: "first_name" },
              { label: "Last Name", key: "last_name" },
              { label: "Phone Number", key: "phone_number" },
              { label: "Address", key: "address" },
              { label: "City", key: "city" },
              { label: "Postal Code", key: "postal_code" },
              { label: "Country", key: "country" },
            ].map(({ label, key }) => (
              <View key={key}>
                <TextInput
                  placeholder={label}
                  value={form[key as keyof typeof form]}
                  onChangeText={(text) => handleChange(key, text)}
                  style={tw`border-b border-gray-300 py-2 mb-1 text-base`}
                  placeholderTextColor="#aaa"
                />
                {errors[key] && (
                  <Text style={tw`text-red-500 text-sm mb-2`}>
                    {errors[key]}
                  </Text>
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={handleSave}
              style={tw`bg-blue-600 p-3 rounded-xl mt-2`}
            >
              <Text style={tw`text-white text-center font-bold`}>
                Save Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={tw`mt-3 p-2 rounded-xl border border-gray-300`}
            >
              <Text style={tw`text-center text-gray-700`}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
