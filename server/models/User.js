const mongoose = require('mongoose');


const mediaKitSchema = new mongoose.Schema({
  aboutMe: { type: String },
  contact: {
    email: { type: String },
    phone: { type: String },
  },
  links: [{
    title: { type: String },
    url: { type: String },
  }],
  rates: [{
    service: { type: String },
    price: { type: Number },
  }],
  customUrl: { type: String },
  collaborations: [{
    brand: { type: String },
    contentUrl: { type: String },
  }]
}, { _id: true }); 


const userSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Role Management
  role: { 
    type: String, 
    enum: ['admin', 'brand', 'influencer', 'talentpartner', 'agency'], 
    required: true 
  },

  // Profile Section
  firstName: { type: String },
  lastName: { type: String },
  dob: { type: Date },
  gender: { type: String },
  relationshipStatus: { type: String },
  about: { type: String },
  username: { type: String, sparse: true },
  // username: { type: String, unique: true, sparse: true },

  // Contact Details (read-only)
  country: { type: String },
  language: { type: String },

  // Address Section
  address: {
    country: { type: String },
    state: { type: String },
    city: { type: String },
    pincode: { type: String },
    fullAddress: { type: String }
  },

  // Commercials Section
  commercials: {
    instagram: [{
      service: { type: String, required: true },
      rate: { type: Number, required: true }
    }],
    youtube: [{
      service: { type: String, required: true },
      rate: { type: Number, required: true }
    }]
  },

  // Status & Terms
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  termsAccepted: { type: Boolean, required: true },

  // Brand/Agency Details
  companyName: { type: String },
  businessEmail: { type: String },
  industryType: { type: String },

  // Influencer Social Profiles
  instagram: { type: String },
  youtube: { type: String },
  followers: { type: Number },
  subscribers: { type: Number },
  category: { type: String },
  platform: { type: String },
  location: { type: String },

  // Meta API Info
  metaApiConnected: { type: Boolean, default: false },
  metaApiData: { type: Object },

  // Social Media Connections
  socialConnections: {
    instagram: {
      connected: { type: Boolean, default: false },
      username: { type: String },
      userId: { type: String },
      accessToken: { type: String, encrypted: true },
      refreshToken: { type: String, encrypted: true },
      tokenExpiresAt: { type: Date },
      followerCount: { type: Number },
      profileData: {
        fullName: { type: String },
        profilePicture: { type: String },
        bio: { type: String },
        website: { type: String },
        isPrivate: { type: Boolean },
        isVerified: { type: Boolean }
      },
      lastVerifiedAt: { type: Date },
      verificationStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' }
    },
    youtube: {
      connected: { type: Boolean, default: false },
      channelId: { type: String },
      channelTitle: { type: String },
      accessToken: { type: String, encrypted: true },
      refreshToken: { type: String, encrypted: true },
      tokenExpiresAt: { type: Date },
      subscriberCount: { type: Number },
      channelData: {
        description: { type: String },
        customUrl: { type: String },
        thumbnailUrl: { type: String },
        country: { type: String },
        viewCount: { type: Number },
        videoCount: { type: Number }
      },
      lastVerifiedAt: { type: Date },
      verificationStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' }
    }
  },

  // Social Platform Metrics
  platformMetrics: {
    instagram: {
      totalLikes: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
      lastUpdated: { type: Date }
    },
    youtube: {
      totalViews: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      averageViewDuration: { type: Number, default: 0 },
      lastUpdated: { type: Date }
    }
  },

  // Social Accounts Integration (for multiple handles)
  socialAccounts: [{
    platform: { type: String, enum: ['instagram', 'youtube'], required: true },
    handle: { type: String, required: true },
    platformId: { type: String, required: true },
    analytics: {
      followers: { type: Number, default: 0 },
      growthRate: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
      avgViews: { type: Number, default: 0 },
      avgLikes: { type: Number, default: 0 },
      lastUpdated: { type: Date }
    }
  }],

  // Media Kit
  mediaKit: [mediaKitSchema],

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
