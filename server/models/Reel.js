const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  reelId: { type: String, required: true, unique: true },
  platform: { 
    type: String, 
    enum: ['instagram', 'youtube'], 
    required: true 
  },
  influencer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String },
  description: { type: String },
  thumbnail: { type: String },
  url: { type: String, required: true },
  metrics: {
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  tags: [{ type: String }],
  category: { type: String },
  language: { type: String },
  savedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  isTrending: { type: Boolean, default: false },
  trendingScore: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for efficient searching
reelSchema.index({ tags: 1, category: 1, language: 1 });
reelSchema.index({ isTrending: 1, trendingScore: -1 });
reelSchema.index({ platform: 1, 'metrics.views': -1 });

module.exports = mongoose.model('Reel', reelSchema); 