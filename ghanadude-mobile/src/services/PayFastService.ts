import axios from "axios";
import CryptoJS from "crypto-js";

const PAYFAST_MERCHANT_ID = "10034002"; // Your PayFast Merchant ID
const PAYFAST_MERCHANT_KEY = "lbs5ilpk38s8g"; // Your PayFast Merchant Key
const PAYFAST_PASSPHRASE = ""; // Leave blank if not set
const PAYFAST_RETURN_URL = "https://www.trustmenclinic.com/thank-you";
const PAYFAST_CANCEL_URL = "https://www.trustmenclinic.com/cancel";
const PAYFAST_NOTIFY_URL = "https://ludmil.pythonanywhere.com/order/notify/";
const PAYFAST_URL = "https://sandbox.payfast.co.za/onsite/process";

// ✅ Generate Secure PayFast Signature (Fixed)
const generateSignature = (data: Record<string, string>, passphrase?: string): string => {
  const queryString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  const finalQueryString = passphrase && passphrase.trim() !== ""
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : queryString;

  return CryptoJS.MD5(finalQueryString).toString();
};

// ✅ Convert Data to PayFast Format
const dataToString = (data: Record<string, string>): string => {
  return Object.keys(data)
    .map((key) => `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}`)
    .join("&");
};

// ✅ Handle PayFast Payment Request
export const handleMakePayment = async (form: any, totalPrice: number) => {
  console.log("🚀 Initiating PayFast Payment...");

  const paymentData: Record<string, string> = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: PAYFAST_RETURN_URL,
    cancel_url: PAYFAST_CANCEL_URL,
    notify_url: PAYFAST_NOTIFY_URL,
    name_first: form.fullName.split(" ")[0] || "Customer",
    name_last: form.fullName.split(" ")[1] || "Unknown",
    email_address: form.email,
    phone: form.phone,
    address: form.address,
    city: form.city,
    postal_code: form.postalCode,
    country: form.country,
    m_payment_id: `${new Date().getTime()}`,
    amount: totalPrice.toFixed(2),
    item_name: form.item_name,
  };

  paymentData.signature = generateSignature(paymentData, PAYFAST_PASSPHRASE);
  const pfParamString = dataToString(paymentData);

  console.log("🔍 Sending Request to PayFast:", pfParamString);

  try {
    const response = await axios.post(PAYFAST_URL, pfParamString, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log("✅ PayFast Response:", response.data);

    const paymentUUID = response.data.uuid || null;

    if (paymentUUID) {
      console.log("✅ Extracted PayFast UUID:", paymentUUID);
      return `https://sandbox.payfast.co.za/onsite/process?uuid=${paymentUUID}`;
    } else {
      console.error("❌ No PayFast UUID found in response:", response.data);
      return null;
    }
  } catch (error: any) {
    console.error("❌ PayFast API Error:", error.response ? error.response.data : error.message);
    return null;
  }
};
