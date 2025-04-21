import React from "react";
import {
  Text,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { TailwindProvider } from "tailwindcss-react-native";
import { store, persistor } from "./src/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./src/navigation/AppNavigator";
import tw from "twrnc";
import Toast from "react-native-toast-message";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { SafeAreaView } from "react-native";
import { useAppVersionCheck } from "./src/hooks/useAppVersionCheck";

export default function App() {
  const { isCompatible, storeUrl } = useAppVersionCheck();

  if (isCompatible === null) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#4B5563" />
        <Text style={tw`mt-4 text-gray-600`}>Checking for updates...</Text>
      </SafeAreaView>
    );
  }

  if (!isCompatible) {
    return (
      <SafeAreaView
        style={tw`flex-1 justify-center items-center bg-white px-8`}
      >
        <Text style={tw`text-xl font-bold text-red-600 text-center mb-4`}>
          ⚠️ Update Required
        </Text>
        <Text style={tw`text-center text-gray-700 mb-6`}>
          A new version of the app is available. Please update to continue using
          the app.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(storeUrl)}
          style={tw`bg-blue-600 px-6 py-3 rounded-full`}
        >
          <Text style={tw`text-white text-lg font-bold`}>Update Now</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <TailwindProvider>
          <PersistGate loading={null} persistor={persistor}>
            <ErrorBoundary>
              <SafeAreaView style={tw`flex-1 bg-gray-50`}>
                <AppNavigator />
                <Toast />
              </SafeAreaView>
            </ErrorBoundary>
          </PersistGate>
        </TailwindProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
