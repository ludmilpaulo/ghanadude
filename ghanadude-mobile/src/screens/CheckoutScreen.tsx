// CheckoutScreen.tsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import PayFast from './PayFast';

const CheckoutScreen = () => {
  const [isVisible, setVisible] = useState(false);

  const handlePaymentClose = (reference?: string) => {
    setVisible(false);
    if (reference) {
      // Handle successful payment logic here
      console.log('Payment completed:', reference);
    } else {
      // Handle cancellation or error here
      console.log('Payment cancelled or failed');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Make Payment" onPress={() => setVisible(true)} />
      <PayFast
        merchantId="10037687"
        merchantKey="t9k4qun47sejo"
        passPhrase="" // leave empty as per your current setting
        sandbox={true}
        notifyUrl="https://your-domain.com/notify/"
        signature={false} // set to false because there's no passphrase
        transactionDetails={{
          customerFirstName: 'John',
          customerLastName: 'Doe',
          customerEmailAddress: 'john.doe@gmail.com',
          customerPhoneNumber: '0123456789',
          reference: 'ORDER12345',
          amount: '100.00',
          itemName: 'Test ItemLudmil',
          itemDescription: 'Test Description',
        }}
        isVisible={isVisible}
        onClose={handlePaymentClose}
      />

    </View>
  );
};

export default CheckoutScreen;
