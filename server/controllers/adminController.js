const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/Plan');
exports.getUsers = async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select('-password');
  res.json(users);
};

exports.approveInfluencer = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

exports.rejectInfluencer = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

exports.getCampaigns = async (req, res) => {
  const campaigns = await Campaign.find().populate('brand', 'name email');
  res.json(campaigns);
};

exports.getApplications = async (req, res) => {
  const apps = await Application.find().populate('influencer campaign');
  res.json(apps);
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find(); 
    res.status(200).json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// CREATE a new subscription plan
exports.createPlan = async (req, res) => {
  try {
    const { title, targetUser, interval, price, razorpayPlanId } = req.body;

    const newPlan = new SubscriptionPlan({ title, targetUser, interval, price, razorpayPlanId });
    await newPlan.save();

    res.status(201).json({ message: 'Plan created successfully', plan: newPlan });
  } catch (err) {
    res.status(500).json({ message: 'Error creating plan', error: err.message });
  }
};

// UPDATE an existing plan
exports.updatePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const updates = req.body;

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(planId, updates, { new: true });

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan updated successfully', plan: updatedPlan });
  } catch (err) {
    res.status(500).json({ message: 'Error updating plan', error: err.message });
  }
};

// DELETE a plan
exports.deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;

    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(planId);

    if (!deletedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting plan', error: err.message });
  }
};

exports.getSubscriptions = async (req, res) => {
  const subs = await Subscription.find().populate('brand plan');
  res.json(subs);
};

exports.getAnalytics = async (req, res) => {
  const userCount = await User.countDocuments();
  const brandCount = await User.countDocuments({ role: 'brand' });
  const influencerCount = await User.countDocuments({ role: 'influencer' });
  const campaignCount = await Campaign.countDocuments();
  const planCount = await Plan.countDocuments();
  const subscriptionCount = await Subscription.countDocuments();
  const earnings = await Subscription.aggregate([
    { $group: { _id: null, total: { $sum: '$paymentId' } } } // Placeholder, replace with actual payment amount field
  ]);
  res.json({
    userCount,
    brandCount,
    influencerCount,
    campaignCount,
    planCount,
    subscriptionCount,
    earnings: earnings[0]?.total || 0,
  });
};

exports.getPayoutRequests = async (req, res) => {
  const apps = await Application.find({ payoutStatus: 'pending' }).populate('influencer campaign');
  res.json(apps);
};

exports.completePayout = async (req, res) => {
  const app = await Application.findByIdAndUpdate(
    req.params.id,
    { payoutStatus: 'withdrawn', payoutCompletedAt: new Date() },
    { new: true }
  );
  if (!app) return res.status(404).json({ message: 'Payout request not found.' });
  res.json({ message: 'Payout completed.', app });
};

exports.getTransactions = async (req, res) => {
  const subs = await Subscription.find().populate('brand plan');
  res.json(subs);
};

exports.createCampaign = async (req, res) => {
  const { title, description, category, budget, targetAudience, startDate, endDate, brand } = req.body;
  const campaign = await Campaign.create({
    brand,
    title,
    description,
    category,
    budget,
    targetAudience,
    startDate,
    endDate,
    status: 'active',
  });
  res.status(201).json(campaign);
}; 