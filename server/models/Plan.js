const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  title: String, 
  targetUser: { type: String, enum: ['influencer', 'brand'] },
  interval: { type: String, enum: ['monthly', 'yearly'] },
  price: Number, 
  razorpayPlanId: String,
  maxCampaigns: { type: Number, required: true, default: 0 }, 
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
