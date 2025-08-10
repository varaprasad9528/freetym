const axios = require('axios');
const User = require('../models/User');
const Content = require('../models/Content');
const encryption = require('../utils/encryption');
const Reel = require('../models/Reel'); 
/**
 * Instagram API Controller
 * Handles OAuth flow, profile verification, and content processing
 */

class InstagramController {
  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID;
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    this.baseUrl = 'https://graph.instagram.com/v12.0';
    
    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      console.warn('⚠️  Instagram API credentials not fully configured');
    }
  }

  /**
   * Generate Instagram OAuth authorization URL
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async initiateOAuth(req, res) {
    try {
      const { userId } = req.user;
      
      if (!this.clientId || !this.redirectUri) {
        return res.status(500).json({ 
          message: 'Instagram API not configured' 
        });
      }

      const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
      const scope = 'user_profile,user_media';
      
      const authUrl = `https://api.instagram.com/oauth/authorize?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `scope=${scope}&` +
        `response_type=code&` +
        `state=${encodeURIComponent(state)}`;

      res.json({ 
        authUrl,
        message: 'Instagram OAuth initiated'
      });
    } catch (error) {
      console.error('Instagram OAuth initiation error:', error);
      res.status(500).json({ 
        message: 'Failed to initiate Instagram OAuth',
        error: error.message 
      });
    }
  }

  /**
   * Handle Instagram OAuth callback
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async handleCallback(req, res) {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.status(400).json({ 
          message: 'Authorization code not provided' 
        });
      }

      // Decode state to get userId
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      const { userId } = stateData;

      // Exchange code for access token
      const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code
      });

      const { access_token, user_id } = tokenResponse.data;

      // Get user profile
      const profileResponse = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token
        }
      });

      const profile = profileResponse.data;

      // Update user with Instagram connection
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Encrypt tokens before storing
      const encryptedAccessToken = encryption.encrypt(access_token);
      
      user.socialConnections.instagram = {
        connected: true,
        username: profile.username,
        userId: profile.id,
        accessToken: encryptedAccessToken,
        refreshToken: null, // Instagram doesn't provide refresh tokens in basic flow
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        followerCount: 0, // Will be updated in profile verification
        profileData: {
          fullName: profile.username,
          profilePicture: null,
          bio: null,
          website: null,
          isPrivate: false,
          isVerified: false
        },
        lastVerifiedAt: new Date(),
        verificationStatus: 'pending'
      };

      await user.save();

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?instagram=connected`);
    } catch (error) {
      console.error('Instagram OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?instagram=error`);
    }
  }

  /**
   * Verify Instagram profile and update metrics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyProfile(req, res) {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);
      
      if (!user || !user.socialConnections.instagram.connected) {
        return res.status(400).json({ 
          message: 'Instagram not connected' 
        });
      }

      const accessToken = encryption.decrypt(user.socialConnections.instagram.accessToken);
      
      // Get detailed profile information
      const profileResponse = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: accessToken
        }
      });

      const profile = profileResponse.data;

      // Get user's media for analytics
      const mediaResponse = await axios.get(`${this.baseUrl}/me/media`, {
        params: {
          fields: 'id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,like_count,comments_count',
          access_token: accessToken,
          limit: 25
        }
      });

      const media = mediaResponse.data.data;
      
      // Calculate total metrics
      let totalLikes = 0;
      let totalComments = 0;
      let totalViews = 0;
      let totalSaves = 0;

      media.forEach(item => {
        totalLikes += item.like_count || 0;
        totalComments += item.comments_count || 0;
        // Instagram doesn't provide view counts for posts, only for reels/videos
        if (item.media_type === 'VIDEO' || item.media_type === 'REELS') {
          totalViews += item.view_count || 0;
        }
      });

      const engagementRate = media.length > 0 ? 
        ((totalLikes + totalComments) / (media.length * (user.socialConnections.instagram.followerCount || 1))) * 100 : 0;

      // Update user's Instagram connection
      user.socialConnections.instagram.followerCount = profile.follower_count || 0;
      user.socialConnections.instagram.profileData = {
        fullName: profile.username,
        profilePicture: profile.profile_picture_url,
        bio: profile.biography,
        website: profile.website,
        isPrivate: profile.is_private,
        isVerified: profile.is_verified
      };
      user.socialConnections.instagram.lastVerifiedAt = new Date();
      user.socialConnections.instagram.verificationStatus = 'verified';

      // Update platform metrics
      user.platformMetrics.instagram = {
        totalLikes,
        totalComments,
        totalViews,
        totalSaves,
        engagementRate,
        lastUpdated: new Date()
      };

      await user.save();

      res.json({
        message: 'Instagram profile verified successfully',
        profile: user.socialConnections.instagram,
        metrics: user.platformMetrics.instagram
      });
    } catch (error) {
      console.error('Instagram profile verification error:', error);
      res.status(500).json({ 
        message: 'Failed to verify Instagram profile',
        error: error.message 
      });
    }
  }

  /**
   * Process Instagram content URL and extract analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processContent(req, res) {
    try {
      const { userId } = req.user;
      const { url, contentType = 'reel' } = req.body;

      if (!url) {
        return res.status(400).json({ 
          message: 'Content URL is required' 
        });
      }

      // Validate Instagram URL
      const instagramUrlRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/;
      const match = url.match(instagramUrlRegex);
      
      if (!match) {
        return res.status(400).json({ 
          message: 'Invalid Instagram URL' 
        });
      }

      const contentId = match[3];
      const user = await User.findById(userId);
      
      if (!user || !user.socialConnections.instagram.connected) {
        return res.status(400).json({ 
          message: 'Instagram not connected' 
        });
      }

      const accessToken = encryption.decrypt(user.socialConnections.instagram.accessToken);

      // Get media details from Instagram API
      const mediaResponse = await axios.get(`${this.baseUrl}/${contentId}`, {
        params: {
          fields: 'id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,like_count,comments_count,view_count',
          access_token: accessToken
        }
      });

      const media = mediaResponse.data;

      // Create or update content record
      let content = await Content.findOne({ 
        userId, 
        platform: 'instagram', 
        contentId 
      });

      if (!content) {
        content = new Content({
          userId,
          platform: 'instagram',
          contentId,
          url,
          contentType,
          metadata: {
            caption: media.caption,
            mediaUrls: [media.media_url],
            thumbnailUrl: media.thumbnail_url,
            isPublic: true
          },
          publishedAt: new Date(media.timestamp),
          processingStatus: 'completed'
        });
      }

      // Create analytics snapshot
      const analyticsSnapshot = {
        timestamp: new Date(),
        likes: media.like_count || 0,
        comments: media.comments_count || 0,
        views: media.view_count || 0,
        shares: 0, // Instagram doesn't provide share count via API
        saves: 0, // Instagram doesn't provide save count via API
        reach: 0, // Instagram doesn't provide reach via basic API
        impressions: 0, // Instagram doesn't provide impressions via basic API
        engagementRate: 0
      };

      content.analyticsSnapshots.push(analyticsSnapshot);
      content.processingStatus = 'completed';
      content.lastAnalyticsUpdate = new Date();

      await content.save();

      res.json({
        message: 'Instagram content processed successfully',
        content: {
          id: content._id,
          contentId: content.contentId,
          url: content.url,
          analytics: content.currentAnalytics,
          metadata: content.metadata
        }
      });
    } catch (error) {
      console.error('Instagram content processing error:', error);
      res.status(500).json({ 
        message: 'Failed to process Instagram content',
        error: error.message 
      });
    }
  }

  /**
   * Refresh Instagram analytics for all user content
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshAnalytics(req, res) {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);
      
      if (!user || !user.socialConnections.instagram.connected) {
        return res.status(400).json({ 
          message: 'Instagram not connected' 
        });
      }

      const accessToken = encryption.decrypt(user.socialConnections.instagram.accessToken);
      
      // Get user's media
      const mediaResponse = await axios.get(`${this.baseUrl}/me/media`, {
        params: {
          fields: 'id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,like_count,comments_count,view_count',
          access_token: accessToken,
          limit: 50
        }
      });

      const media = mediaResponse.data.data;
      let updatedCount = 0;

      // Update each content item
      for (const item of media) {
        let content = await Content.findOne({ 
          userId, 
          platform: 'instagram', 
          contentId: item.id 
        });

        if (!content) {
          // Create new content record
          content = new Content({
            userId,
            platform: 'instagram',
            contentId: item.id,
            url: item.permalink,
            contentType: item.media_type === 'VIDEO' ? 'video' : 
                        item.media_type === 'REELS' ? 'reel' : 'post',
            metadata: {
              caption: item.caption,
              mediaUrls: [item.media_url],
              thumbnailUrl: item.thumbnail_url,
              isPublic: true
            },
            publishedAt: new Date(item.timestamp),
            processingStatus: 'completed'
          });
        }

        // Create analytics snapshot
        const analyticsSnapshot = {
          timestamp: new Date(),
          likes: item.like_count || 0,
          comments: item.comments_count || 0,
          views: item.view_count || 0,
          shares: 0,
          saves: 0,
          reach: 0,
          impressions: 0,
          engagementRate: 0
        };

        content.analyticsSnapshots.push(analyticsSnapshot);
        content.processingStatus = 'completed';
        content.lastAnalyticsUpdate = new Date();

        await content.save();
        updatedCount++;
      }

      res.json({
        message: `Instagram analytics refreshed successfully`,
        updatedCount,
        totalContent: media.length
      });
    } catch (error) {
      console.error('Instagram analytics refresh error:', error);
      res.status(500).json({ 
        message: 'Failed to refresh Instagram analytics',
        error: error.message 
      });
    }
  }
  
// to add the reels by cicking the button 

async importReelsAsReelModel(req, res) {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    
    if (!user || !user.socialConnections.instagram.connected) {
      return res.status(400).json({ message: 'Instagram not connected' });
    }

    const accessToken = encryption.decrypt(user.socialConnections.instagram.accessToken);

    const mediaResponse = await axios.get(`${this.baseUrl}/me/media`, {
      params: {
        fields: 'id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,like_count,comments_count,view_count',
        access_token: accessToken,
        limit: 50
      }
    });

    const mediaItems = mediaResponse.data.data;

    let imported = 0;

    for (const item of mediaItems) {
      if (item.media_type !== 'VIDEO') continue; // Skip posts

      const exists = await Reel.findOne({ reelId: item.id });
      if (exists) continue;

      const newReel = new Reel({
        reelId: item.id,
        platform: 'instagram',
        influencer: userId,
        title: item.caption?.slice(0, 100) || '',
        description: item.caption || '',
        thumbnail: item.thumbnail_url || '',
        url: item.permalink,
        tags: [], // Optional: extract hashtags if needed
        category: '',
        language: '',
        metrics: {
          likes: item.like_count || 0,
          views: item.view_count || 0,
          comments: item.comments_count || 0
        }
      });

      await newReel.save();
      imported++;
    }

    res.json({
      success: true,
      message: `${imported} reels imported successfully.`,
    });

  } catch (error) {
    console.error('Error importing Instagram reels:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to import reels',
      error: error.message 
    });
  }
}

}

module.exports = new InstagramController(); 