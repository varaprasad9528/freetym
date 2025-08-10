const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String }, // For email OTP
  phone: { type: String }, // For WhatsApp OTP
  otp: { type: String, required: true },
  type: { type: String, enum: ['email', 'whatsapp','reset'], required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema); 