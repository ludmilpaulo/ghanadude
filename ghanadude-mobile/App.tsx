import React from "react";
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
