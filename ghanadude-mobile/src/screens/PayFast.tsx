// PayFast.tsx (simplified)

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, SafeAreaView, View, Button, Text } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

import { PayFastMerchantDetails, PayFastTransactionDetails } from './types';
import { buildQueryString, generateMD5, removeUndefined } from './Helpers';

type Props = PayFastMerchantDetails & {
  paymentMethod?: 'ef' | 'cc' | 'dc' | 'mp' | 'mc' | 'sc' | 'ss' | 'zp' | 'mt' | 'rcs'
  transactionDetails: PayFastTransactionDetails
  isVisible: boolean
  onClose: (reference?: string) => void
}

const PayFast = ({
  paymentMethod = 'cc',
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
  const [postBody, setPostBody] = useState('');

  const uri = sandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';

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
    let queryString = buildQueryString(CLEAN_PAYLOAD);
    if (signature && passPhrase) {
      const queryStringWithPassPhrase = `${queryString}&passphrase=${passPhrase}`;
      const generatedSignature = generateMD5(queryStringWithPassPhrase);
      queryString = `${queryString}&signature=${generatedSignature}`;
    }
    setPostBody(queryString);
    setShowWeb(true);
  };

  useEffect(() => {
    if (isVisible) {
      getQueryString();
    }
  }, [isVisible]);

  const handleNavigationChange = (event: WebViewNavigation) => {
    if (event.url.includes('finish')) {
      setShowWeb(false);
      onClose(TRANSACTION_DETAILS.m_payment_id);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <SafeAreaView style={{ flex: 1 }}>
        {showWeb ? (
          <WebView
            onNavigationStateChange={handleNavigationChange}
            startInLoadingState
            renderLoading={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Button title="Cancel" onPress={() => onClose()} />
              </View>
            )}
            source={{
              uri,
              headers: {
                Accept: '*/*',
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              method: 'POST',
              body: postBody,
            }}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Button title="Cancel" onPress={() => onClose()} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default PayFast;
