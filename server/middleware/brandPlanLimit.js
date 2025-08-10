const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');

// async function brandPlanLimit(req, res, next) {
//   console.log(req.user.userId)
//   const sub = await Subscription.findOne({ userId: req.user.userId, status: 'active', endDate: { $gt: new Date() } }).populate('plan');
//   // console.log(sub)
//   if (!sub) return res.status(403).json({ message: 'No active subscription.' });
//   if (sub.usageCount >= sub.plan.maxCampaigns) return res.status(403).json({ message: 'Campaign limit reached. Upgrade your plan.' });
//   req.subscription = sub;
//   next();
// }
async function brandPlanLimit(req, res, next) {
  console.log(req.user.userId);

  // Fetch the active subscription and populate the 'plan' field
  const sub = await Subscription.findOne({
    userId: req.user.userId,
    status: 'active',
    endDate: { $gt: new Date() }
  }).populate('plan');  // Populate the 'plan' field with the subscription plan

  console.log(sub); // Debugging log to inspect the subscription

  if (!sub) return res.status(403).json({ message: 'No active subscription.' });

  // Ensure the plan is populated
  if (!sub.plan) {
    return res.status(403).json({ message: 'Subscription does not have a valid plan.' });
  }

  // Check if usageCount exceeds maxCampaigns
  if (sub.usageCount >= sub.plan.maxCampaigns) {
    return res.status(403).json({ message: 'Campaign limit reached. Upgrade your plan.' });
  }

  req.subscription = sub; // Pass the subscription to the next middleware
  next();
}

module.exports = brandPlanLimit; 