const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  influencer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  decisionAt: { type: Date },
  postUrl: { type: String },
  analytics: { type: Object },
  earnings: { type: Number, default: 0 },
  payoutStatus: { type: String, enum: ['pending', 'ready', 'withdrawn'], default: 'pending' },
  payoutRequestedAt: { type: Date },
  payoutCompletedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema); 