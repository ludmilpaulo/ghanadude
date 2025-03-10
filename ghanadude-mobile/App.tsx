import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { TailwindProvider } from "tailwindcss-react-native";
import { store, persistor } from "./src/redux/store"; // Ensure correct import path
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./src/navigation/AppNavigator";
import tw from 'twrnc';

import 'react-native-gesture-handler';
import 'react-native-reanimated';

import ErrorBoundary from "./src/components/ErrorBoundary"; // Ensure correct import path
import { SafeAreaView } from "react-native";


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <TailwindProvider>
          <PersistGate loading={null} persistor={persistor}>
            <ErrorBoundary>
            <SafeAreaView style={tw`flex-1 bg-gray-50`}>
              <AppNavigator />
              </SafeAreaView>
            </ErrorBoundary>
          </PersistGate>
        </TailwindProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}