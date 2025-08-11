const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Import controllers
const instagramController = require('../controllers/instagramController');
const youtubeController = require('../controllers/youtubeController');

// Rate limiting for social media API calls
const socialApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many social media API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all social media routes
router.use(socialApiLimiter);

// Basic test route
router.get('/test', (req, res) => {
  res.json({ message: 'Social routes working' });
});


// Instagram OAuth Routes
router.get('/instagram/auth', auth(['influencer']), instagramController.initiateOAuth);
router.get('/instagram/callback', instagramController.handleCallback);
router.post('/instagram/verify', auth(['influencer']), instagramController.verifyProfile);
router.post('/instagram/content', 
  auth(['influencer']),
  [
    body('url').isURL().withMessage('Valid Instagram URL is required'),
    body('contentType').isIn(['reel', 'post', 'story']).withMessage('Valid content type is required')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    next();
  },
  instagramController.processContent
);
router.post('/instagram/refresh', auth(['influencer']), instagramController.refreshAnalytics);
// adding the instagram reels by clicking a button 
router.post('/import-reels', auth(['influencer']), instagramController.importReelsAsReelModel);

// YouTube OAuth Routes
router.get('/youtube/auth', auth(['influencer']), youtubeController.initiateOAuth);
router.get('/youtube/callback', youtubeController.handleCallback);
router.post('/youtube/verify', auth(['influencer']), youtubeController.verifyChannel);
router.post('/youtube/content', 
  auth(['influencer']),
  [
    body('url').isURL().withMessage('Valid YouTube URL is required'),
    body('contentType').isIn(['video', 'short']).withMessage('Valid content type is required')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    next();
  },
  youtubeController.processContent
);
router.post('/youtube/refresh', auth(['influencer']), youtubeController.refreshAnalytics);
// to add the youtube reels by clickig a buttton 
router.post('/youtube/import-reels',auth(['influencer']), youtubeController.importReelsAsReelModel.bind(youtubeController));
// Content Management Routes
router.get('/content', auth(['influencer']), async (req, res) => {
  try {
    const { userId } = req.user;
    const { platform, page = 1, limit = 10 } = req.query;
    
    const Content = require('../models/Content');
    
    const query = { userId };
    if (platform) {
      query.platform = platform;
    }
    
    const skip = (page - 1) * limit;
    
    const content = await Content.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email');
    
    const total = await Content.countDocuments(query);
    
    res.json({
      content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch content',
      error: error.message 
    });
  }
});

router.get('/content/:id', auth(['influencer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const Content = require('../models/Content');
    
    const content = await Content.findOne({ _id: id, userId })
      .populate('userId', 'name email');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json({ content });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch content',
      error: error.message 
    });
  }
});

// Profile Enrichment Route
router.post('/profile/enrich', auth(['influencer']), async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await require('../models/User').findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const results = {};
    
    // Refresh Instagram data if connected
    if (user.socialConnections.instagram.connected) {
      try {
        await instagramController.verifyProfile({ user: { userId } }, { json: (data) => { results.instagram = data; } });
      } catch (error) {
        results.instagram = { error: error.message };
      }
    }
    
    // Refresh YouTube data if connected
    if (user.socialConnections.youtube.connected) {
      try {
        await youtubeController.verifyChannel({ user: { userId } }, { json: (data) => { results.youtube = data; } });
      } catch (error) {
        results.youtube = { error: error.message };
      }
    }
    
    res.json({
      message: 'Profile enrichment completed',
      results
    });
  } catch (error) {
    console.error('Profile enrichment error:', error);
    res.status(500).json({ 
      message: 'Failed to enrich profile',
      error: error.message 
    });
  }
});

// Social Connection Status Route
router.get('/connections', auth(['influencer']), async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await require('../models/User').findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const connections = {
      instagram: {
        connected: user.socialConnections.instagram.connected,
        username: user.socialConnections.instagram.username,
        verificationStatus: user.socialConnections.instagram.verificationStatus,
        lastVerifiedAt: user.socialConnections.instagram.lastVerifiedAt
      },
      youtube: {
        connected: user.socialConnections.youtube.connected,
        channelTitle: user.socialConnections.youtube.channelTitle,
        verificationStatus: user.socialConnections.youtube.verificationStatus,
        lastVerifiedAt: user.socialConnections.youtube.lastVerifiedAt
      }
    };
    
    res.json({ connections });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch connections',
      error: error.message 
    });
  }
});

// Disconnect Social Account Route
router.delete('/connections/:platform', auth(['influencer']), async (req, res) => {
  try {
    const { platform } = req.params;
    const { userId } = req.user;
    
    if (!['instagram', 'youtube'].includes(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }
    
    const user = await require('../models/User').findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Reset platform connection
    user.socialConnections[platform] = {
      connected: false,
      username: null,
      userId: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      followerCount: 0,
      profileData: {},
      lastVerifiedAt: null,
      verificationStatus: 'pending'
    };
    
    // Reset platform metrics
    user.platformMetrics[platform] = {
      totalLikes: 0,
      totalComments: 0,
      totalViews: 0,
      engagementRate: 0,
      lastUpdated: null
    };
    
    await user.save();
    
    res.json({ 
      message: `${platform} account disconnected successfully` 
    });
  } catch (error) {
    console.error('Disconnect account error:', error);
    res.status(500).json({ 
      message: 'Failed to disconnect account',
      error: error.message 
    });
  }
});

module.exports = router; 