const User = require('../models/User');
const Application = require('../models/Application');
const Campaign = require('../models/Campaign');
const generateUniqueSlug = require('../utils/slugGenerator');
const logger = require('../utils/logger');
const dotenv = require('dotenv');
dotenv.config();
exports.updateSocialProfiles = async (req, res) => {
  const { instagram, youtube, followers, subscribers } = req.body;
  const user = await User.findByIdAndUpdate(req.user.userId, { instagram, youtube, followers, subscribers }, { new: true });
  res.json(user);
};

exports.connectMetaApi = async (req, res) => {
  // Stub for Meta API integration
  const user = await User.findByIdAndUpdate(req.user.userId, { metaApiConnected: true, metaApiData: {} }, { new: true });
  res.json({ message: 'Meta API connected (stub)', user });
};

exports.submitPostUrl = async (req, res) => {
  const { postUrl } = req.body;
  // Stub: fetch analytics from Meta API in future
  const analytics = { views: 0, likes: 0, comments: 0 }; // Placeholder
  const app = await Application.findOneAndUpdate(
    { influencer: req.user.userId, campaign: req.params.id },
    { postUrl, analytics, payoutStatus: 'ready' },
    { new: true }
  );
  if (!app) return res.status(404).json({ message: 'Application not found.' });
  res.json(app);
};

exports.getDashboardAnalytics = async (req, res) => {
  const { from, to } = req.query;
  const filter = { influencer: req.user.userId };
  if (from || to) {
    filter.appliedAt = {};
    if (from) filter.appliedAt.$gte = new Date(from);
    if (to) filter.appliedAt.$lte = new Date(to);
  }
  const apps = await Application.find(filter);
  const totalEarnings = apps.reduce((sum, a) => sum + (a.earnings || 0), 0);
  res.json({
    totalEarnings,
    promotions: apps.map(a => ({
      campaign: a.campaign,
      postUrl: a.postUrl,
      analytics: a.analytics,
      earnings: a.earnings,
      payoutStatus: a.payoutStatus,
      payoutRequestedAt: a.payoutRequestedAt,
      payoutCompletedAt: a.payoutCompletedAt,
      appliedAt: a.appliedAt,
    }))
  });
};

exports.requestWithdrawal = async (req, res) => {
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, influencer: req.user.userId, payoutStatus: 'ready' },
    { payoutStatus: 'pending', payoutRequestedAt: new Date() },
    { new: true }
  );
  if (!app) return res.status(400).json({ message: 'Not eligible for withdrawal.' });
  res.json({ message: 'Withdrawal requested.', app });
};

exports.searchInfluencers = async (req, res) => {
  const { query, category, platform } = req.query;
  const filter = { role: 'influencer', status: 'approved' };
  if (category) filter.category = category;
  if (platform) filter.platform = platform;
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { location: { $regex: query, $options: 'i' } },
      { instagram: { $regex: query, $options: 'i' } },
      { youtube: { $regex: query, $options: 'i' } }
    ];
  }
  const influencers = await User.find(filter).select('-password -metaApiData');
  res.json(influencers);
};

// Get personal details
exports.getPersonalDetails = async (req, res) => {
  const user = await User.findById(req.user.userId).select('firstName lastName dateOfBirth gender relationshipStatus about');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

// Edit personal details (only relationshipStatus, about)
exports.editPersonalDetails = async (req, res) => {
  const { relationshipStatus, about } = req.body;
  const updates = {};
  if (relationshipStatus !== undefined) updates.relationshipStatus = relationshipStatus;
  if (about !== undefined) updates.about = about;
  const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true, select: 'firstName lastName dateOfBirth gender relationshipStatus about' });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

// Get username
exports.getUsername = async (req, res) => {
  const user = await User.findById(req.user.userId).select('username');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ username: user.username });
};

// Edit username (must be unique)
exports.editUsername = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Username required.' });
  const exists = await User.findOne({ username, _id: { $ne: req.user.userId } });
  if (exists) return res.status(400).json({ message: 'Username already taken.' });
  const user = await User.findByIdAndUpdate(req.user.userId, { username }, { new: true, select: 'username' });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ username: user.username });
};

// My Campaigns: accepted/working
// exports.getMyCampaigns = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;

//     const skip = (page - 1) * limit;

//     // Find accepted applications for this influencer
//     const total = await Application.countDocuments({ influencer: req.user.userId, status: 'accepted' });

//     const apps = await Application.find({ influencer: req.user.userId, status: 'accepted' })
//       .populate('campaign')
//       .skip(skip)
//       .limit(limit);

//     const campaigns = apps.map(a => a.campaign);

//     res.json({
//       total,
//       page,
//       limit,
//       campaigns
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch campaigns', error: err.message });
//   }
// };
// Get influencer's campaigns based on phase
// exports.getMyCampaigns = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { phase, page = 1, limit = 10 } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Find accepted applications for this influencer
//     const filter = { 'influencers.userId': userId, 'status': 'accepted' };

//     // Apply phase filter if provided
//     if (phase) {
//       filter['influencers.phases.' + phase] = { $exists: true }; // Check if the phase exists
//     }

//     const campaigns = await Campaign.find(filter)
//       .populate('brand', 'name companyName')
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Campaign.countDocuments(filter);

//     // Format campaigns to return phase details
//     const filteredCampaigns = campaigns.map(campaign => {
//       const influencerData = campaign.influencers.find(
//         inf => inf.userId.toString() === userId
//       );
//       return {
//         ...campaign.toObject(),
//         influencerStatus: influencerData.status,
//         influencerPhases: influencerData.phases,
//         appliedAt: influencerData.appliedAt,
//         approvedAt: influencerData.approvedAt,
//         completedAt: influencerData.completedAt
//       };
//     });

//     res.json({
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       campaigns: filteredCampaigns
//     });

//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch campaigns', error: err.message });
//   }
// };

// exports.getMyCampaigns = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { phase='planning', page, limit } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     if(phase==""){
//       phase="planning"
//     }
//     // 1. Get accepted applications
//     const acceptedApplications = await Application.find({
//       influencer: userId,
//       status: 'accepted'
//     }).select('campaign');

//     const campaignIds = acceptedApplications.map(app => app.campaign);
//     console.log(campaignIds)
//     if (campaignIds.length === 0) {
//       return res.json({ total: 0, page: parseInt(page), limit: parseInt(limit), campaigns: [] });
//     }

//     // 2. Build influencer filter for phase
//     const influencerFilter = {
//       userId: userId
//     };

//     if (phase === 'planning') {
//       influencerFilter['phases.planning'] = { $exists: true };
//     } else if (phase === 'ongoing') {
//       influencerFilter['phases.ongoing'] = { $exists: true };
//     } else if (phase === 'completed') {
//       influencerFilter.$or = [
//         { 'phases.completed': { $exists: true } },
//         { status: 'completed' }
//       ];
//     }

//     const campaignFilter = {
//       _id: { $in: campaignIds },
//       influencers: { $elemMatch: influencerFilter }
//     };

//     // 3. Fetch filtered campaigns
//     const campaigns = await Campaign.find(campaignFilter)
//       .populate('brand', 'name companyName')
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Campaign.countDocuments(campaignFilter);

//     // 4. Format response
//     const filteredCampaigns = campaigns.map(campaign => {
//       const influencerData = campaign.influencers.find(
//         inf => inf.userId.toString() === userId
//       );
//       return {
//         ...campaign.toObject(),
//         influencerStatus: influencerData.status,
//         influencerPhases: influencerData.phases,
//         appliedAt: influencerData.appliedAt,
//         approvedAt: influencerData.approvedAt,
//         completedAt: influencerData.completedAt
//       };
//     });

//     // 5. Return result
//     res.json({
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       campaigns: filteredCampaigns
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch campaigns', error: err.message });
//   }
// };

exports.getMyCampaigns = async (req, res) => {
  try {
    const userId = req.user.userId;
    let { phase, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    if(phase=""){
      phase = 'planning'
    }
    
    const acceptedApplications = await Application.find({
      influencer: userId,
      status: 'accepted'
    }).select('campaign payoutStatus appliedAt');

    const campaignIds = acceptedApplications.map(app => app.campaign);
    const appMap = {};
    acceptedApplications.forEach(app => {
      appMap[app.campaign.toString()] = app;
    });

    if (campaignIds.length === 0) {
      return res.json({ total: 0, page: parseInt(page), limit: parseInt(limit), campaigns: [] });
    }

    
    const influencerFilter = { userId };

    if (phase === 'planning') {
      influencerFilter['phases.planning'] = { $exists: true };
    } else if (phase === 'ongoing') {
      influencerFilter['phases.ongoing'] = { $exists: true };
    } else if (phase === 'completed') {
      influencerFilter.$or = [
        { 'phases.completed': { $exists: true } },
        { status: 'completed' }
      ];
    }

    const campaignFilter = {
      _id: { $in: campaignIds },
      influencers: { $elemMatch: influencerFilter }
    };

    
    const campaigns = await Campaign.find(campaignFilter)
      .populate('brand', 'name companyName')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Campaign.countDocuments(campaignFilter);

    
    const filteredCampaigns = campaigns.map(campaign => {
      const influencerData = campaign.influencers.find(
        inf => inf.userId.toString() === userId
      );

      const app = appMap[campaign._id.toString()];

      return {
        _id: campaign._id,
        title: campaign.title,
        brand: campaign.brand,
        influencerStatus: influencerData.status,
        appliedAt: influencerData.appliedAt || app?.appliedAt,
        approvedAt: influencerData.approvedAt,
        completedAt: influencerData.completedAt,
        paymentStatus: app?.payoutStatus || 'pending'
      };
    });

    
    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      campaigns: filteredCampaigns
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch campaigns', error: err.message });
  }
};

// Explore Campaigns: open/public, not applied/accepted/rejected
exports.getExploreCampaigns = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1;
  // Find campaigns not already applied to by this influencer
  const applied = await Application.find({ influencer: req.user.userId }).distinct('campaign');
  const query = { status: 'active', _id: { $nin: applied } };
  const total = await Campaign.countDocuments(query);
  const campaigns = await Campaign.find(query).skip((page-1)*limit).limit(limit);
  res.json({ total, page, limit, campaigns });
};

// Applied Campaigns: pending
exports.getAppliedCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { influencer: req.user.userId, status: 'pending' };

    const total = await Application.countDocuments(filter);

    const apps = await Application.find(filter)
      .populate('campaign')
      .skip(skip)
      .limit(limit);

    const campaigns = apps.map(app => app.campaign);

    res.json({
      total,
      page,
      limit,
      campaigns
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applied campaigns', error: err.message });
  }
};

exports.getSingleCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.status(200).json(campaign);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch campaign', error: err.message });
  }
};

// exports.applyToCampaign = async (req, res) => {
//   try {
//     const campaignId = req.params.campaignId;
//     const influencerId = req.user.userId;

//     // Check if the campaign exists
//     const campaign = await Campaign.findById(campaignId);
//     if (!campaign || campaign.status !== 'active') {
//       return res.status(404).json({ message: 'Campaign not found or not active' });
//     }

//     // Check if already applied
//     const existingApplication = await Application.findOne({
//       influencer: influencerId,
//       campaign: campaignId
//     });

//     if (existingApplication) {
//       return res.status(400).json({ message: 'Already applied to this campaign' });
//     }

//     // Create the application
//     const application = await Application.create({
//       influencer: influencerId,
//       campaign: campaignId,
//       status: 'pending'
//     });

//     res.status(201).json({ message: 'Application submitted', application });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to apply to campaign', error: err.message });
//   }
// };


//  Social Account Management

// Add new social account

exports.applyToCampaign = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const influencerId = req.user.userId;

    // 1. Find campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== 'active') {
      return res.status(404).json({ message: 'Campaign not found or not active' });
    }

    // 2. Check if already applied (via Application model)
    const existingApplication = await Application.findOne({
      influencer: influencerId,
      campaign: campaignId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this campaign' });
    }

    // 3. Create new application
    const application = await Application.create({
      influencer: influencerId,
      campaign: campaignId,
      status: 'pending'
    });

    // 4. Add influencer entry to campaign
    campaign.influencers.push({
      userId: influencerId,
      status: 'applied',
      appliedAt: new Date()
    });

    // 5. Optionally add application ID to campaign.applications
    campaign.applications.push(application._id);

    await campaign.save();

    // 6. Respond
    res.status(201).json({ message: 'Application submitted', application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to apply to campaign', error: err.message });
  }
};

exports.addSocialAccount = async (req, res) => {
  try {
    const { platform, handle, platformId } = req.body;
    const userId = req.user.userId;
    
    // Validate required fields
    if (!platform || !handle || !platformId) {
      return res.status(400).json({
        success: false,
        message: 'Platform, handle, and platform ID are required'
      });
    }
    
    // Validate platform
    if (!['instagram', 'youtube'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform must be instagram or youtube'
      });
    }
    
    // Check if account already exists
    const user = await User.findById(userId);
    const existingAccount = user.socialAccounts.find(
      account => account.platform === platform && account.handle === handle
    );
    
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Social account already exists'
      });
    }
    
    // Add new social account
    user.socialAccounts.push({
      platform,
      handle,
      platformId,
      analytics: {
        followers: 0,
        growthRate: 0,
        engagementRate: 0,
        avgViews: 0,
        avgLikes: 0,
        lastUpdated: new Date()
      }
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Social account added successfully',
      data: user.socialAccounts[user.socialAccounts.length - 1]
    });
    
  } catch (error) {
    // logger.error('Add social account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding social account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get social account analytics
exports.getSocialAccountAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const account = user.socialAccounts.id(id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }
    
    res.json({
      success: true,
      data: account
    });
    
  } catch (error) {
    // logger.error('Get social account analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching social account analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Refresh social account data
exports.refreshSocialAccountData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const account = user.socialAccounts.id(id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }
    
    // TODO: Integrate with actual social media APIs
    // For now, simulate data refresh
    const mockAnalytics = {
      followers: Math.floor(Math.random() * 100000) + 1000,
      growthRate: (Math.random() * 10).toFixed(2),
      engagementRate: (Math.random() * 5).toFixed(2),
      avgViews: Math.floor(Math.random() * 50000) + 1000,
      avgLikes: Math.floor(Math.random() * 5000) + 100,
      lastUpdated: new Date()
    };
    
    account.analytics = mockAnalytics;
    await user.save();
    
    res.json({
      success: true,
      message: 'Social account data refreshed successfully',
      data: account
    });
    
  } catch (error) {
    // logger.error('Refresh social account data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing social account data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

//  Media Kit Management

// Get all media kits for a user
exports.getAllMediaKits = async (req, res) => {
  try {
    console.log(req.user)
    const user = await User.findById(req.user.userId).select('mediaKit');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    console.log(user)
    res.json(user.mediaKit);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching media kits', error });
  }
};

// Add new media kit
// exports.addMediaKit = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     user.mediaKit.push(req.body);
//     await user.save();
//     res.status(201).json({ message: 'Media kit added', mediaKit: user.mediaKit });
//   } catch (error) {
//     res.status(500).json({ message: 'Error adding media kit', error });
//   }
// };


// exports.addMediaKit = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     // Use "aboutMe" as base or fallback to username
//     const baseTitle = req.body.aboutMe || user.username || 'media-kit';

//     // Generate unique slug
//     const slug = await generateUniqueSlug(baseTitle, req.user.id);

//     const newMediaKit = {
//       ...req.body,
//       customUrl: slug,
//     };

//     user.mediaKit.push(newMediaKit);
//     await user.save();

//     res.status(201).json({
//       message: 'Media kit added',
//       mediaKit: user.mediaKit,
//       shareUrl: `${process.env.BASE_URL}/media-kit/${slug}`,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error adding media kit', error });
//   }
// };
exports.addMediaKit = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate base title for slug
    const baseTitle = req.body.aboutMe || user.name || 'media-kit';

    // Generate a unique slug
    const customUrl = await generateUniqueSlug(baseTitle, user._id);

    // Build the new media kit object
    const newMediaKit = {
      ...req.body,
      customUrl
    };

    // Add media kit to user's profile
    user.mediaKit.push(newMediaKit);
    await user.save();

    // Send back full shareable URL
    res.status(201).json({
      message: 'Media kit added',
      mediaKit: newMediaKit,
      shareUrl: `${process.env.BASE_URL}/media-kit/${customUrl}`
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating influencer',
      error: error.message
    });
  }
};

// Update existing media kit by mediaKitId
// exports.updateMediaKit = async (req, res) => {
//   try {
//     const { mediaKitId } = req.params;
//     const user = await User.findById(req.user.id);
//     const mediaKit = user.mediaKit.id(mediaKitId);
//     if (!mediaKit) {
//       return res.status(404).json({ message: 'Media kit not found' });
//     }

//     // Update fields
//     Object.assign(mediaKit, req.body);
//     await user.save();
//     res.json({ message: 'Media kit updated', mediaKit });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating media kit', error });
//   }
// };
exports.updateMediaKit = async (req, res) => {
  try {
    const { mediaKitId } = req.params;
    console.log(req)
    const user = await User.findById(req.user.userId);
    const mediaKit = user.mediaKit.id(mediaKitId);

    if (!mediaKit) {
      return res.status(404).json({ message: 'Media kit not found' });
    }
    console.log("Media kit")
    console.log(req.body)
    // If title is updated, regenerate slug
    if (req.body.title && req.body.title !== mediaKit.title) {
      const newSlug = await generateUniqueSlug(req.body.title, user._id);
      mediaKit.customUrl = newSlug;
    }

    // Update the rest of the fields
    Object.assign(mediaKit, req.body);

    await user.save();
    res.json({ message: 'Media kit updated', mediaKit });
  } catch (error) {
    res.status(500).json({ message: 'Error updating media kit', error });
  }
};

// Delete media kit



exports.deleteMediaKit = async (req, res) => {
  try {
    const { mediaKitId } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const kit = user.mediaKit.id(mediaKitId);
    if (!kit) return res.status(404).json({ message: 'Media kit not found' });

    // Proper removal using .pull() if .remove() isn't available
    user.mediaKit.pull({ _id: mediaKitId });

    await user.save();

    res.json({ message: 'Media kit deleted' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting media kit',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

