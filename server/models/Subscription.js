// const mongoose = require('mongoose');

// const userSubscriptionSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
//     razorpaySubscriptionId: String,
//     razorpayPaymentId: String,
//     status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
//     startDate: Date,
//     endDate: Date,
// }, { timestamps: true });

// // Virtual to populate the plan details based on planId
// userSubscriptionSchema.virtual('plan', {
//   ref: 'SubscriptionPlan', // Model to reference
//   localField: 'planId',    // Field in UserSubscription model
//   foreignField: '_id',     // Field in SubscriptionPlan model
//   justOne: true            // Populate just one plan for the subscription
// });

// module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);

const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    razorpaySubscriptionId: String,
    razorpayPaymentId: String,
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
    startDate: Date,
    endDate: Date,
    usageCount: { type: Number, default: 0 },  // Tracks the number of campaigns used
}, { timestamps: true });
userSubscriptionSchema.virtual('plan', {
  ref: 'SubscriptionPlan', // Model to reference
  localField: 'planId',    // Field in UserSubscription model
  foreignField: '_id',     // Field in SubscriptionPlan model
  justOne: true            // Populate just one plan for the subscription
});
module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
