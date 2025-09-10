// otpSender.js

require('dotenv').config();
const axios = require('axios');

async function sendOtpViaPabbly({ name, email, phone, otp, otpType, channel }) {
  const webhookUrl = process.env.PABBLY_WEBHOOK_URL;
  const payload = {
    email,
    phone,
    otp,
    otpType,   // e.g., "registration" or "reset"
    channel    // "email" or "whatsapp"
  };

  try {
    const response = await axios.post(webhookUrl, payload);
    console.log('✅ OTP sent via Pabbly:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Failed to send OTP:', error.message);
    return false;
  }
}

module.exports = { sendOtpViaPabbly };
