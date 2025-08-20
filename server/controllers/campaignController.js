const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const logger = require('../utils/logger');

exports.createCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      budget,
      targetAudience,
      startDate,
      endDate,
      industries,
      socialMedia,
      deliverables,
    } = req.body;
    
    const brand = await User.findById(req.user.userId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    const audience = Array.isArray(targetAudience) ? targetAudience : [targetAudience];
    
    const campaign = await Campaign.create({
      brand: req.user.userId,  
      brandName: brand.name,    
      title,
      description,
      category,
      budget,
      targetAudience: audience,
      startDate,
      endDate,
      requirements: {
        industries,    
        socialMedia,   
        deliverables,   
      }
    });

    // Increment the usageCount for the active subscription
    // await Subscription.findOneAndUpdate(
    //   { userId: req.user.userId, status: 'active', endDate: { $gt: new Date() } },
    //   { $inc: { usageCount: 1 } }
    // );
    
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ message: 'Error creating campaign', error: err.message });
  }
};

exports.createCampaigns = async (req, res) => {
  try {
    const campaignsData = req.body; // An array of campaign objects

    // Ensure the brand (User) exists by ID
    const brand = await User.findById(req.user.userId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Ensure targetAudience is an array
    const audience = Array.isArray(req.body.targetAudience) ? req.body.targetAudience : [req.body.targetAudience];

    // Map through each campaign and insert into the database
    const campaigns = await Campaign.insertMany(campaignsData.map(campaign => ({
      brand: req.user.userId,   // The logged-in user's ID as brand
      brandName: brand.name,     // The brand's name from the User model
      ...campaign,               // Spread the campaign data from the request
      targetAudience: audience   // Set the targetAudience correctly
    })));

    res.status(201).json({ message: 'Campaigns created successfully', campaigns });
  } catch (err) {
    console.error('Error creating campaigns:', err);
    res.status(400).json({ message: 'Error creating campaigns', error: err.message });
  }
};



exports.updateCampaign = async (req, res) => {
  const campaign = await Campaign.findOneAndUpdate({ _id: req.params.id, brand: req.user.userId }, req.body, { new: true });
  if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
  res.json(campaign);
};

exports.deleteCampaign = async (req, res) => {
  const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, brand: req.user.userId });
  if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
  // Decrement usageCount
  await Subscription.updateOne({ brand: req.user.userId, status: 'active' }, { $inc: { usageCount: -1 } });
  res.json({ message: 'Campaign deleted.' });
};

exports.getMyCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ brand: req.user.userId });
  res.json(campaigns);
};

exports.getActiveCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ status: 'active' });
  res.json(campaigns);
};

exports.applyToCampaign = async (req, res) => {
  try {
    // Influencer can only apply if not already applied
    const exists = await Application.findOne({ influencer: req.user.userId, campaign: req.params.id });
    if (exists) return res.status(400).json({ message: 'Already applied.' });
    // TODO: Check influencer quota if needed
    const app = await Application.create({ influencer: req.user.userId, campaign: req.params.id });
    await Campaign.findByIdAndUpdate(req.params.id, { $push: { applications: app._id } });
    res.status(201).json(app);
  } catch (err) {
    res.status(400).json({ message: 'Error applying to campaign', error: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  const apps = await Application.find({ influencer: req.user.userId }).populate('campaign');
  res.json(apps);
};

exports.getCampaignApplications = async (req, res) => {
  const campaign = await Campaign.findOne({ _id: req.params.id, brand: req.user.userId }).populate({ path: 'applications', populate: { path: 'influencer', select: 'name email instagram youtube followers subscribers' } });
  if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
  res.json(campaign.applications);
};

exports.decideApplication = async (req, res) => {
  const { decision } = req.body; // 'accepted' or 'rejected'
  const app = await Application.findById(req.params.appId);
  if (!app) return res.status(404).json({ message: 'Application not found.' });
  app.status = decision;
  app.decisionAt = new Date();
  await app.save();
  res.json(app);
};

exports.getCampaignById = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate('brand', 'name email');
  if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
  res.json(campaign);
};

exports.getCampaignsByBrand = async (req, res) => {
  const campaigns = await Campaign.find({ brand: req.params.brandId });
  res.json(campaigns);
};

exports.adminDeleteCampaign = async (req, res) => {
  const campaign = await Campaign.findByIdAndDelete(req.params.id);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
  res.json({ message: 'Campaign deleted by admin.' });
};

// NEW: Enhanced Campaign Management

// Get explore campaigns (live campaigns for influencers)
exports.getExploreCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, platform } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (platform) filter['requirements.platforms'] = platform;
    
    const campaigns = await Campaign.find(filter)
      .populate('brand', 'name companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Campaign.countDocuments(filter);
    
    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    // logger.error('Get explore campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get influencer's campaigns
exports.getMyCampaignsForInfluencer = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;
    
    // Build filter
    const filter = { 'influencers.userId': userId };
    if (status) filter['influencers.status'] = status;
    
    const campaigns = await Campaign.find(filter)
      .populate('brand', 'name companyName')
      .sort({ createdAt: -1 });
    
    // Filter campaigns based on influencer's status
    const filteredCampaigns = campaigns.map(campaign => {
      const influencerData = campaign.influencers.find(
        inf => inf.userId.toString() === userId
      );
      return {
        ...campaign.toObject(),
        influencerStatus: influencerData.status,
        influencerPhases: influencerData.phases,
        appliedAt: influencerData.appliedAt,
        approvedAt: influencerData.approvedAt,
        completedAt: influencerData.completedAt
      };
    });
    
    res.json({
      success: true,
      data: filteredCampaigns
    });
    
  } catch (error) {
    // logger.error('Get my campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Apply for campaign (enhanced)
exports.applyForCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user.userId;
    
    // Check if campaign exists and is active
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is not active'
      });
    }
    
    // Check if already applied
    const alreadyApplied = campaign.influencers.find(
      inf => inf.userId.toString() === userId
    );
    
    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'Already applied to this campaign'
      });
    }
    
    // Add influencer to campaign
    campaign.influencers.push({
      userId,
      status: 'applied',
      appliedAt: new Date()
    });
    
    await campaign.save();
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        campaignId,
        status: 'applied',
        appliedAt: new Date()
      }
    });
    
  } catch (error) {
    // logger.error('Apply for campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying for campaign',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 