import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';

export interface FormFields {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

interface Props {
  form: FormFields;
  setForm: (fields: Partial<FormFields>) => void;
  editableFields: Record<keyof FormFields, boolean>;
  onUseCurrentLocation?: () => void;
}

const fieldLabels: Record<keyof FormFields, string> = {
  first_name: 'First Name',
  last_name: 'Last Name',
  email: 'Email Address',
  phone_number: 'Phone Number',
  address: 'Street Address',
  city: 'City',
  postal_code: 'Postal Code',
  country: 'Country',
};

const CheckoutForm: React.FC<Props> = ({
  form,
  setForm,
  editableFields,
  onUseCurrentLocation,
}) => {
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormFields, string>>>({});

  const handleChange = (field: keyof FormFields, value: string) => {
    setForm({ [field]: value });

    // Live validation
    if (value.trim() === '') {
      setFormErrors(prev => ({ ...prev, [field]: `${fieldLabels[field]} is required.` }));
    } else {
      setFormErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <View style={tw`bg-white p-5 rounded-2xl shadow-lg mt-4`}>
      <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>
        🧾 Shipping Information
      </Text>

      {onUseCurrentLocation && (
        <TouchableOpacity
          onPress={onUseCurrentLocation}
          style={tw`mb-5 bg-blue-600 py-3 px-4 rounded-xl`}
        >
          <Text style={tw`text-white text-center font-semibold`}>
            📍 Use My Current Location
          </Text>
        </TouchableOpacity>
      )}

      {(Object.keys(form) as (keyof FormFields)[]).map((field) => (
        <View key={field} style={tw`mb-4`}>
          <Text style={tw`text-sm font-semibold text-gray-700 mb-1`}>
            {fieldLabels[field]}
          </Text>
          <TextInput
            placeholder={fieldLabels[field]}
            value={form[field]}
            onChangeText={(text) => handleChange(field, text)}
            editable={editableFields[field]}
            style={[
              tw`border px-4 py-3 rounded-xl text-base`,
              editableFields[field]
                ? tw`bg-white border-gray-300`
                : tw`bg-gray-100 border-gray-200 text-gray-500`,
            ]}
          />
          {formErrors[field] && (
            <Text style={tw`text-red-600 text-xs mt-1`}>
              {formErrors[field]}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

export default CheckoutForm;
