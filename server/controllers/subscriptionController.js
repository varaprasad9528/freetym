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

// Get available plans (for influencer target user)
exports.getAvailablePlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ targetUser: 'influencer' });
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Simulate order creation without Razorpay
exports.createOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await SubscriptionPlan.findById(planId);

        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        // Simulate an order creation response (mocking Razorpay)
        const order = {
            id: `order_${Date.now()}`,  // Generate a mock order ID
            amount: plan.price * 100, // Convert to paise (1 INR = 100 paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                planName: plan.title,
                userId: req.user.id
            },
            status: 'created',
            created_at: Date.now()
        };

        // Return the simulated order
        return res.status(200).json({ order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Order creation failed' });
    }
};

// Simulate Razorpay payment verification and activate subscription
exports.verifyAndActivate = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

        // Simulating the Razorpay verification process (since we are not using Razorpay's signature)
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment verification data' });
        }

        // Fetch the plan details
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        // Calculate start and end dates based on plan interval (monthly/yearly)
        const startDate = new Date();
        const endDate = new Date();

        if (plan.interval === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
        if (plan.interval === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);

        // Create the subscription record in the database
        // console.log(req.user)
        const newSubscription = await UserSubscription.create({
            userId: req.user.userId,
            planId: plan._id,
            razorpayPaymentId: razorpay_payment_id,  // Simulated payment ID
            startDate,
            endDate,
            status: 'active'  // Set the subscription status as 'active'
        });

        // Send a success response
        res.status(200).json({
            message: 'Subscription activated successfully',
            subscription: newSubscription
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Subscription activation failed' });
    }
};

// Fetch user's subscription history
exports.getHistory = async (req, res) => {
    try {
        const history = await UserSubscription.find({ userId: req.user.id }).populate('planId');
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch history' });
    }
};

// Cancel user's subscription
exports.cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await UserSubscription.findOne({ _id: subscriptionId, userId: req.user.id });

        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

        // Change the subscription status to 'cancelled'
        subscription.status = 'cancelled';
        await subscription.save();

        res.status(200).json({ message: 'Subscription cancelled (no refund)' });
    } catch (err) {
        res.status(500).json({ message: 'Cancellation failed' });
    }
};
