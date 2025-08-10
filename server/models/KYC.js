const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  pancard: {
    number: { type: String, required: true },
    image: { type: String, required: true }
  },
  aadhar: {
    number: { type: String, required: true },
    front: { type: String, required: true },
    back: { type: String, required: true }
  },
  bankDetails: {
    accountHolderName: { type: String },
    accountNumber: { type: String },
    bankName: { type: String },
    ifscCode: { type: String },
    bankVerified: { type: Boolean, default: false }, 
    bankVerifiedAt: { type: Date },                  
    bankVerifiedBy: {                                
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bankVerificationNotes: { type: String }          
  },
  upiDetails: {
    googlePay: { type: String },
    phonePe: { type: String },
    paytm: { type: String }
  },
  verified: { type: Boolean, default: false },
  balance: {
    available: { type: Number, default: 0 },
    locked: { type: Number, default: 0 }
  },
  verificationNotes: { type: String },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('KYC', kycSchema);
