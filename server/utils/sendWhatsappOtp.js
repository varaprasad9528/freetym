const axios = require('axios');
const pabblyConfig = require('../config/pabbly');

async function sendWhatsappOtp(phone, otp) {
  // Use config for API key and endpoint
  const url = pabblyConfig.endpoint;
  const payload = {
    api_key: pabblyConfig.apiKey,
    phone: phone,
    message: `Your Freetym OTP is: ${otp}`,
  };
  // Uncomment and adjust when real API details are available
  // await axios.post(url, payload);
  return true; // Stub for now
}

module.exports = sendWhatsappOtp; 