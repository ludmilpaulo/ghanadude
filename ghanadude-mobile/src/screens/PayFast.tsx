import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  View,
  Button,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

import { PayFastMerchantDetails, PayFastTransactionDetails } from "./types";
import { buildQueryString, generateMD5, removeUndefined } from "./Helpers";

type Props = PayFastMerchantDetails & {
  paymentMethod?:
    | "ef"
    | "cc"
    | "dc"
    | "mp"
    | "mc"
    | "sc"
    | "ss"
    | "zp"
    | "mt"
    | "rcs";
  transactionDetails: PayFastTransactionDetails;
  isVisible: boolean;
  onClose: (reference?: string) => void;
};

const PayFast = ({
  paymentMethod = "cc",
  isVisible,
  onClose,
  sandbox,
  transactionDetails,
  notifyUrl,
  signature,
  merchantId,
  merchantKey,
  passPhrase,
}: Props) => {
  const [showWeb, setShowWeb] = useState(false);
  const [postBody, setPostBody] = useState("");

  const uri = sandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

  const CUSTOMER_DATA = {
    name_first: transactionDetails.customerFirstName,
    name_last: transactionDetails.customerLastName,
    email_address: transactionDetails.customerEmailAddress,
    cell_number: transactionDetails.customerPhoneNumber,
  };

  const TRANSACTION_DETAILS = {
    m_payment_id: transactionDetails.reference,
    amount: transactionDetails.amount,
    item_name: transactionDetails.itemName,
    item_description: transactionDetails.itemDescription,
    payment_method: paymentMethod,
  };

  const PAYLOAD = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    notify_url: notifyUrl,
    ...CUSTOMER_DATA,
    ...TRANSACTION_DETAILS,
  };

  const CLEAN_PAYLOAD = removeUndefined(PAYLOAD);

  const getQueryString = () => {
    console.log("🧾 CLEAN_PAYLOAD →", CLEAN_PAYLOAD);

    let queryString = buildQueryString(CLEAN_PAYLOAD);
    console.log("🔗 Initial Query String →", queryString);

    if (signature && passPhrase) {
      const queryStringWithPassPhrase = `${queryString}&passphrase=${passPhrase}`;
      const generatedSignature = generateMD5(queryStringWithPassPhrase);
      console.log("🔐 Signature Generated →", generatedSignature);
      queryString = `${queryString}&signature=${generatedSignature}`;
    }

    setPostBody(queryString);
    console.log("📦 Final POST body →", queryString);
    setShowWeb(true);
  };

  useEffect(() => {
    if (isVisible) {
      console.log("📲 PayFast modal opened → isVisible:", isVisible);
      getQueryString();
    }
  }, [isVisible]);

  const handleNavigationChange = (event: WebViewNavigation) => {
    console.log("🌐 WebView navigation change:", event.url);
    if (event.url.includes("finish")) {
      console.log(
        "✅ Payment completed! Closing modal with ref:",
        TRANSACTION_DETAILS.m_payment_id,
      );
      setShowWeb(false);
      onClose(TRANSACTION_DETAILS.m_payment_id);
    }
  };

  const handleCancel = () => {
    console.log("❌ Payment canceled by user");
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <SafeAreaView style={{ flex: 1 }}>
        {showWeb ? (
          <WebView
            onNavigationStateChange={handleNavigationChange}
            startInLoadingState
            renderLoading={() => (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" />
                <Button title="Cancel" onPress={handleCancel} />
              </View>
            )}
            source={{
              uri,
              headers: {
                Accept: "*/*",
                "Content-Type": "application/x-www-form-urlencoded",
              },
              method: "POST",
              body: postBody,
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log("❌ WebView error:", nativeEvent);
            }}
            onHttpError={({ nativeEvent }) => {
              console.log(
                "❌ HTTP error:",
                nativeEvent.statusCode,
                nativeEvent.description,
              );
            }}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" />
            <Button title="Cancel" onPress={handleCancel} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default PayFast;
