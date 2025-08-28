// const razorpay = require('../utils/razorpay');
// const SubscriptionPlan = require('../models/Plan');
// const UserSubscription = require('../models/Subscription');

// exports.getAvailablePlans = async (req, res) => {
//   try {
//     const plans = await SubscriptionPlan.find({ targetUser: 'influencer' });
//     res.status(200).json(plans);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// exports.createOrder = async (req, res) => {
//     try {
//         const { planId } = req.body;
//         const plan = await SubscriptionPlan.findById(planId);
//         if (!plan) return res.status(404).json({ message: 'Plan not found' });

//         const order = await razorpay.orders.create({
//             amount: plan.price * 100, // INR to paisa
//             currency: 'INR',
//             receipt: `receipt_${Date.now()}`,
//             notes: {
//                 planName: plan.title,
//                 userId: req.user.id,
//             }
//         });

//         return res.status(200).json({ order });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Order creation failed' });
//     }
// };

// exports.verifyAndActivate = async (req, res) => {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

//         // (Optionally) verify signature using crypto if needed

//         const plan = await SubscriptionPlan.findById(planId);

//         const startDate = new Date();
//         const endDate = new Date();
//         if (plan.interval === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
//         if (plan.interval === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);

//         await UserSubscription.create({
//             userId: req.user.id,
//             planId: plan._id,
//             razorpayPaymentId: razorpay_payment_id,
//             startDate,
//             endDate
//         });

//         res.status(200).json({ message: 'Subscription activated' });
//     } catch (err) {
//         res.status(500).json({ message: 'Subscription activation failed' });
//     }
// };

// exports.getHistory = async (req, res) => {
//     try {
//         const history = await UserSubscription.find({ userId: req.user.id }).populate('planId');
//         res.status(200).json(history);
//     } catch (err) {
//         res.status(500).json({ message: 'Failed to fetch history' });
//     }
// };

// exports.cancelSubscription = async (req, res) => {
//     try {
//         const { subscriptionId } = req.params;
//         const subscription = await UserSubscription.findOne({ _id: subscriptionId, userId: req.user.id });

//         if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

//         subscription.status = 'cancelled';
//         await subscription.save();

//         res.status(200).json({ message: 'Subscription cancelled (no refund)' });
//     } catch (err) {
//         res.status(500).json({ message: 'Cancellation failed' });
//     }
// };


const SubscriptionPlan = require('../models/Plan');
const UserSubscription = require('../models/Subscription');
const crypto = require('crypto'); 
const razorpay = require('../utils/razorpay');
// Get available plans (for influencer target user)

exports.getAvailablePlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ targetUser: 'influencer' });
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plans', error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.userId;

    if (!planId) return res.status(400).json({ message: 'Plan ID is required' });

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // Razorpay order creation
    try {
      const order = await razorpay.orders.create({
        amount: plan.price * 100, // in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          planId: plan._id.toString(),
          userId: userId.toString()
        }
      });

      res.status(200).json({ order });
    } catch (razorpayError) {
      console.error('Razorpay order creation failed:', razorpayError);
      res.status(500).json({ message: 'Failed to create Razorpay order', error: razorpayError.message });
    }

  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ message: 'Order creation failed', error: err.message });
  }
};


exports.getCheckoutUrl = (req, res) => {
  const { order_id } = req.body;

  if (!order_id) return res.status(400).json({ message: 'Order ID is required' });

  // Assuming your Razorpay key details are stored in environment variables
  const razorpayKey = process.env.RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  // Create the URL for the Razorpay checkout page
  const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.js?order_id=${order_id}&key=${razorpayKey}`;

  res.status(200).json({
    message: 'Checkout URL generated successfully',
    checkoutUrl: checkoutUrl
  });
};


// Controller to generate Razorpay signature
exports.generateRazorpaySignature = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;

    // Check if required parameters are present
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Your Razorpay Secret Key (Make sure you replace this with the actual secret key)
    const razorpaySecretKey = process.env.RAZORPAY_KEY_SECRET; // Replace this with your actual secret key

    // Generate the Razorpay signature using HMAC SHA-256
    const signature = crypto
      .createHmac('sha256', razorpaySecretKey)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Return the generated signature as a response
    res.status(200).json({ razorpay_signature: signature });
  } catch (err) {
    console.error('Error generating Razorpay signature:', err);
    res.status(500).json({ message: 'Error generating Razorpay signature', error: err.message });
  }
};

// Verify Razorpay signature and activate subscription
exports.verifyAndActivate = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    const userId = req.user.userId;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const startDate = new Date();
    const endDate = new Date();
    if (plan.interval === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
    if (plan.interval === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);

    const newSubscription = await UserSubscription.create({
      userId,
      planId: plan._id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySubscriptionId: razorpay_order_id, // storing for reference
      startDate,
      endDate,
      status: 'active'
    });

    res.status(200).json({
      message: 'Subscription activated successfully',
      subscription: newSubscription
    });
  } catch (err) {
    console.error('Payment verification failed:', err);
    res.status(500).json({ message: 'Subscription activation failed', error: err.message });
  }
};

//  Fetch current user's subscription history
// exports.getHistory = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     console.log(userId)
//     // { userId: req.user.id }
//     console.log(req.user.id)
//     // const history = await UserSubscription.find({ userId:userId }).populate('planId');
//     const history = await UserSubscription.find({ userId: req.user.id }).populate('planId');
//     console.log(history)
//     res.status(200).json(history);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch history', error: err.message });
//   }
// };


exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.userId; // Get the userId from the authenticated user's session
    
    // Query the subscription history for this user, including expired, cancelled, and active subscriptions
    const subscriptions = await UserSubscription.find({ userId }) // Filter by userId
      .select('planId startDate endDate status razorpaySubscriptionId razorpayPaymentId')  // Select relevant fields
      .sort({ startDate: -1 }); // Sort by the startDate, newest first
    
    // If no subscriptions found, return a message
    if (subscriptions.length === 0) {
      return res.status(404).json({
        message: 'No subscription history found for this user.'
      });
    }

    // Populate the plan name with the planId
    const subscriptionHistoryWithPlanName = await Promise.all(subscriptions.map(async (subscription) => {
      const plan = await SubscriptionPlan.findById(subscription.planId).select('title'); // Fetch only the name
      return {
        ...subscription.toObject(),
        planName: plan ? plan.title : 'Unknown Plan' // Attach the plan name
      };
    }));
    console.log(subscriptionHistoryWithPlanName)
    // Return the response with plan name
    res.status(200).json(subscriptionHistoryWithPlanName);
    
  } catch (err) {
    console.error('Error fetching subscription history:', err);
    res.status(500).json({
      message: 'Failed to fetch subscription history.',
      error: err.message
    });
  }
};


// Cancel an active subscription 
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subscriptionId } = req.params;

    const subscription = await UserSubscription.findOne({ _id: subscriptionId, userId });
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Only active subscriptions can be cancelled' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json({ message: 'Subscription cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Cancellation failed', error: err.message });
  }
};