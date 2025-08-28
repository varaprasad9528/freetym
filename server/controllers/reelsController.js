const Reel = require('../models/Reel');
const User = require('../models/User');
const logger = require('../utils/logger');

// Get reels with filters
exports.getReels = async (req, res) => {
  try {
    const { 
      filter = 'latest', 
      category, 
      language, 
      platform, 
      limit = 20, 
      page = 1 
    } = req.query;
    
    // Build filter
    const queryFilter = {};
    
    if (category) {
      queryFilter.category = category;
    }
    
    if (language) {
      queryFilter.language = language;
    }
    
    if (platform) {
      queryFilter.platform = platform;
    }
    
    // Apply trending filter
    if (filter === 'trending') {
      queryFilter.isTrending = true;
    }
    
    // Build sort
    let sort = {};
    switch (filter) {
      case 'trending':
        sort = { trendingScore: -1, 'metrics.views': -1 };
        break;
      case 'popular':
        sort = { 'metrics.views': -1, 'metrics.likes': -1 };
        break;
      case 'latest':
      default:
        sort = { createdAt: -1 };
        break;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reels = await Reel.find(queryFilter)
      .populate('influencer', 'name instagram youtube')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Reel.countDocuments(queryFilter);
    
    res.json({
      success: true,
      data: reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    // logger.error('Get reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// get trending reels 
exports.getTrendingReels = async (req, res) => {
  try {
    const {
      category,
      language,
      platform,
      limit = 20,
      page = 1
    } = req.query;

    const queryFilter = {
      isTrending: true // Only trending reels
    };

    if (category) {
      queryFilter.category = category;
    }

    if (language) {
      queryFilter.language = language;
    }

    if (platform) {
      queryFilter.platform = platform;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reels = await Reel.find(queryFilter)
      .populate('influencer', 'name instagram youtube')
      .sort({ trendingScore: -1, 'metrics.views': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reel.countDocuments(queryFilter);

    res.json({
      success: true,
      data: reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trending reels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// with all the filters

exports.getTrending = async (req, res) => {
  try {
    let {
      category,
      language,
      platform,
      minFollowers,
      maxFollowers,
      accountType,
      days,
      limit, 
      page ,
    } = req.query;
    
    console.log(req.user)
    if (days=" "){
      days=30
    }
    if (limit=" "){
      limit=20
    }
    if (page=" "){
      page=1
    }
    const queryFilter = {
      isTrending: true,
    };

    if (category) {
      queryFilter.category = category;
    }

    if (language) {
      queryFilter.language = language;
    }

    if (platform) {
      queryFilter.platform = platform;
    }

    // Apply date range (last X days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    queryFilter.createdAt = { $gte: startDate };

    // Build follower filter via aggregation
    const matchStage = {
      ...queryFilter
    };

    const lookupStage = {
      $lookup: {
        from: 'users',
        localField: 'influencer',
        foreignField: '_id',
        as: 'influencer'
      }
    };

    const unwindStage = {
      $unwind: '$influencer'
    };

    const influencerMatch = {};

    if (accountType) {
      influencerMatch['influencer.accountType'] = accountType;
    }

    if (minFollowers || maxFollowers) {
      influencerMatch['influencer.followerCount'] = {};
      if (minFollowers) {
        influencerMatch['influencer.followerCount'].$gte = parseInt(minFollowers);
      }
      if (maxFollowers) {
        influencerMatch['influencer.followerCount'].$lte = parseInt(maxFollowers);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pipeline = [
      { $match: matchStage },
      lookupStage,
      unwindStage,
      { $match: influencerMatch },
      {
        $sort: {
          trendingScore: -1,
          'metrics.views': -1
        }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ];

    const reels = await Reel.aggregate(pipeline);

    // Count total matching documents for pagination
    const countPipeline = [
      { $match: matchStage },
      lookupStage,
      unwindStage,
      { $match: influencerMatch },
      { $count: 'total' }
    ];

    const countResult = await Reel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching trending reels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending reels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Save/unsave reel
exports.toggleSaveReel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }
    
    const isSaved = reel.savedBy.includes(userId);
    
    if (isSaved) {
      // Remove from saved
      reel.savedBy = reel.savedBy.filter(id => id.toString() !== userId);
    } else {
      // Add to saved
      reel.savedBy.push(userId);
    }
    
    await reel.save();
    
    res.json({
      success: true,
      message: isSaved ? 'Reel removed from saved' : 'Reel saved successfully',
      data: {
        saved: !isSaved,
        savedCount: reel.savedBy.length
      }
    });
    
  } catch (error) {
    // logger.error('Toggle save reel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving reel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get saved reels for user
exports.getSavedReels = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reels = await Reel.find({ savedBy: userId })
      .populate('influencer', 'name instagram youtube')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Reel.countDocuments({ savedBy: userId });
    
    res.json({
      success: true,
      data: reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    // logger.error('Get saved reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved reels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add new reel (for influencers)
exports.addReel = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      reelId, 
      platform, 
      title, 
      description, 
      thumbnail, 
      url, 
      tags, 
      category, 
      language 
    } = req.body;
    
    // Validate required fields
    if (!reelId || !platform || !url) {
      return res.status(400).json({
        success: false,
        message: 'Reel ID, platform, and URL are required'
      });
    }
    
    // Check if reel already exists
    const existingReel = await Reel.findOne({ reelId });
    if (existingReel) {
      return res.status(400).json({
        success: false,
        message: 'Reel already exists'
      });
    }
    
    const reel = new Reel({
      reelId,
      platform,
      influencer: userId,
      title,
      description,
      thumbnail,
      url,
      tags: tags || [],
      category,
      language
    });
    
    await reel.save();
    
    res.status(201).json({
      success: true,
      message: 'Reel added successfully',
      data: reel
    });
    
  } catch (error) {
    // logger.error('Add reel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 