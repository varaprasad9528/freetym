const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Platform information
  platform: {
    type: String,
    enum: ['instagram', 'youtube'],
    required: true
  },
  
  // Content identification
  contentId: {
    type: String,
    required: true
  },
  
  // Content URL and basic info
  url: {
    type: String,
    required: true
  },
  
  // Content type
  contentType: {
    type: String,
    enum: ['reel', 'post', 'story', 'video', 'short', 'live'],
    required: true
  },
  
  // Content metadata
  metadata: {
    title: { type: String },
    description: { type: String },
    caption: { type: String },
    hashtags: [{ type: String }],
    mentions: [{ type: String }],
    location: { type: String },
    language: { type: String },
    duration: { type: Number }, // in seconds
    thumbnailUrl: { type: String },
    mediaUrls: [{ type: String }], // for multiple images/videos
    isPublic: { type: Boolean, default: true },
    isSponsored: { type: Boolean, default: false },
    sponsoredBrand: { type: String }
  },
  
  // Analytics snapshots (historical data)
  analyticsSnapshots: [{
    timestamp: { type: Date, required: true },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 }, // Instagram specific
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    viewDuration: { type: Number, default: 0 }, // YouTube specific
    subscriberGained: { type: Number, default: 0 }, // YouTube specific
    subscriberLost: { type: Number, default: 0 } // YouTube specific
  }],
  
  // Current analytics (latest snapshot)
  currentAnalytics: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    viewDuration: { type: Number, default: 0 },
    subscriberGained: { type: Number, default: 0 },
    subscriberLost: { type: Number, default: 0 }
  },
  
  // Content status
  status: {
    type: String,
    enum: ['active', 'deleted', 'private', 'archived'],
    default: 'active'
  },
  
  // Verification and processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Error tracking
  lastError: {
    message: { type: String },
    timestamp: { type: Date },
    retryCount: { type: Number, default: 0 }
  },
  
  // Campaign association (if content is part of a campaign)
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  
  // Tags for categorization
  tags: [{ type: String }],
  
  // Content creation and update timestamps
  publishedAt: { type: Date },
  lastAnalyticsUpdate: { type: Date },
  nextAnalyticsUpdate: { type: Date }
}, { 
  timestamps: true,
  // Indexes for efficient querying
  indexes: [
    { userId: 1, platform: 1 },
    { platform: 1, contentId: 1 },
    { userId: 1, status: 1 },
    { publishedAt: -1 },
    { 'currentAnalytics.views': -1 },
    { 'currentAnalytics.likes': -1 }
  ]
});

// Pre-save middleware to update currentAnalytics from latest snapshot
contentSchema.pre('save', function(next) {
  if (this.analyticsSnapshots && this.analyticsSnapshots.length > 0) {
    const latestSnapshot = this.analyticsSnapshots[this.analyticsSnapshots.length - 1];
    this.currentAnalytics = {
      likes: latestSnapshot.likes,
      comments: latestSnapshot.comments,
      shares: latestSnapshot.shares,
      views: latestSnapshot.views,
      saves: latestSnapshot.saves,
      reach: latestSnapshot.reach,
      impressions: latestSnapshot.impressions,
      engagementRate: latestSnapshot.engagementRate,
      viewDuration: latestSnapshot.viewDuration,
      subscriberGained: latestSnapshot.subscriberGained,
      subscriberLost: latestSnapshot.subscriberLost
    };
    this.lastAnalyticsUpdate = latestSnapshot.timestamp;
  }
  next();
});

module.exports = mongoose.model('Content', contentSchema); 