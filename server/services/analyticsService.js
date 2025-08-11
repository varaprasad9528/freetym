const cron = require('node-cron');
const User = require('../models/User');
const Content = require('../models/Content');
const instagramController = require('../controllers/instagramController');
const youtubeController = require('../controllers/youtubeController');
const encryption = require('../utils/encryption');



class AnalyticsService {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
  }

  /**
   * Initialize the analytics service
   */
  init() {
    // Schedule daily analytics update at 2 AM
    cron.schedule('0 2 * * *', () => {
      this.updateAllAnalytics();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log('📊 Analytics service initialized - Daily updates scheduled at 2 AM UTC');
  }

  /**
   * Update analytics for all connected users
   */
  async updateAllAnalytics() {
    if (this.isRunning) {
      console.log('⚠️  Analytics update already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();
    
    try {
      console.log('🔄 Starting daily analytics update...');
      
      // Get all users with social connections
      const users = await User.find({
        $or: [
          { 'socialConnections.instagram.connected': true },
          { 'socialConnections.youtube.connected': true }
        ]
      });

      console.log(`📈 Found ${users.length} users with social connections`);

      let instagramUpdated = 0;
      let youtubeUpdated = 0;
      let errors = [];

      for (const user of users) {
        try {
          // Update Instagram analytics
          if (user.socialConnections.instagram.connected) {
            await this.updateInstagramAnalytics(user);
            instagramUpdated++;
          }

          // Update YouTube analytics
          if (user.socialConnections.youtube.connected) {
            await this.updateYouTubeAnalytics(user);
            youtubeUpdated++;
          }

          // Small delay to avoid rate limiting
          await this.delay(1000);

        } catch (error) {
          console.error(`❌ Error updating analytics for user ${user._id}:`, error.message);
          errors.push({
            userId: user._id,
            error: error.message
          });
        }
      }

      this.nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next day

      console.log(`✅ Analytics update completed:`);
      console.log(`   - Instagram: ${instagramUpdated} users updated`);
      console.log(`   - YouTube: ${youtubeUpdated} users updated`);
      console.log(`   - Errors: ${errors.length}`);

      if (errors.length > 0) {
        console.error('❌ Errors during analytics update:', errors);
      }

    } catch (error) {
      console.error('❌ Fatal error during analytics update:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Update Instagram analytics for a specific user
   * @param {Object} user - User document
   */
  async updateInstagramAnalytics(user) {
    try {
      // Check if token needs refresh
      if (new Date() > user.socialConnections.instagram.tokenExpiresAt) {
        console.log(`🔄 Instagram token expired for user ${user._id}, skipping...`);
        return;
      }

      const accessToken = encryption.decrypt(user.socialConnections.instagram.accessToken);
      
      // Get user's media
      const axios = require('axios');
      const mediaResponse = await axios.get('https://graph.instagram.com/v12.0/me/media', {
        params: {
          fields: 'id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,like_count,comments_count,view_count',
          access_token: accessToken,
          limit: 25
        }
      });

      const media = mediaResponse.data.data;
      
      // Update each content item
      for (const item of media) {
        let content = await Content.findOne({ 
          userId: user._id, 
          platform: 'instagram', 
          contentId: item.id 
        });

        if (!content) {
          // Create new content record
          content = new Content({
            userId: user._id,
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
      }

      // Update user's platform metrics
      const totalLikes = media.reduce((sum, item) => sum + (item.like_count || 0), 0);
      const totalComments = media.reduce((sum, item) => sum + (item.comments_count || 0), 0);
      const totalViews = media.reduce((sum, item) => {
        if (item.media_type === 'VIDEO' || item.media_type === 'REELS') {
          return sum + (item.view_count || 0);
        }
        return sum;
      }, 0);

      const engagementRate = media.length > 0 ? 
        ((totalLikes + totalComments) / (media.length * (user.socialConnections.instagram.followerCount || 1))) * 100 : 0;

      user.platformMetrics.instagram = {
        totalLikes,
        totalComments,
        totalViews,
        totalSaves: 0,
        engagementRate,
        lastUpdated: new Date()
      };

      await user.save();

    } catch (error) {
      console.error(`❌ Instagram analytics update failed for user ${user._id}:`, error.message);
      throw error;
    }
  }

  /**
   * Update YouTube analytics for a specific user
   * @param {Object} user - User document
   */
  async updateYouTubeAnalytics(user) {
    try {
      // Check if token needs refresh
      if (new Date() > user.socialConnections.youtube.tokenExpiresAt) {
        console.log(`🔄 YouTube token expired for user ${user._id}, refreshing...`);
        const newTokens = await youtubeController.refreshAccessToken(user.socialConnections.youtube.refreshToken);
        user.socialConnections.youtube.accessToken = newTokens.accessToken;
        user.socialConnections.youtube.tokenExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
        await user.save();
      }

      const accessToken = encryption.decrypt(user.socialConnections.youtube.accessToken);
      
      // Get user's videos
      const axios = require('axios');
      const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          channelId: user.socialConnections.youtube.channelId,
          type: 'video',
          order: 'date',
          maxResults: 25,
          access_token: accessToken
        }
      });

      const videos = videosResponse.data.items;
      
      // Update each content item
      for (const video of videos) {
        let content = await Content.findOne({ 
          userId: user._id, 
          platform: 'youtube', 
          contentId: video.id.videoId 
        });

        if (!content) {
          // Create new content record
          content = new Content({
            userId: user._id,
            platform: 'youtube',
            contentId: video.id.videoId,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            contentType: 'video',
            metadata: {
              title: video.snippet.title,
              description: video.snippet.description,
              thumbnailUrl: video.snippet.thumbnails.high.url,
              isPublic: true
            },
            publishedAt: new Date(video.snippet.publishedAt),
            processingStatus: 'completed'
          });
        }

        // Get video statistics
        const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'statistics,contentDetails',
            id: video.id.videoId,
            access_token: accessToken
          }
        });

        const stats = statsResponse.data.items[0];
        
        if (stats) {
          // Create analytics snapshot
          const analyticsSnapshot = {
            timestamp: new Date(),
            likes: parseInt(stats.statistics.likeCount) || 0,
            comments: parseInt(stats.statistics.commentCount) || 0,
            views: parseInt(stats.statistics.viewCount) || 0,
            shares: 0,
            saves: 0,
            reach: 0,
            impressions: 0,
            engagementRate: 0,
            viewDuration: 0,
            subscriberGained: 0,
            subscriberLost: 0
          };

          content.analyticsSnapshots.push(analyticsSnapshot);
          content.processingStatus = 'completed';
          content.lastAnalyticsUpdate = new Date();

          await content.save();
        }
      }

      // Update user's platform metrics
      const totalViews = videos.reduce((sum, video) => {
        // This would need to be calculated from the stats we fetched above
        return sum;
      }, 0);

      user.platformMetrics.youtube = {
        totalViews,
        totalLikes: 0, // Would need to be calculated from individual video stats
        totalComments: 0, // Would need to be calculated from individual video stats
        averageViewDuration: 0, // Would need to be calculated from individual video stats
        lastUpdated: new Date()
      };

      await user.save();

    } catch (error) {
      console.error(`❌ YouTube analytics update failed for user ${user._id}:`, error.message);
      throw error;
    }
  }

  /**
   * Manual trigger for analytics update
   */
  async triggerUpdate() {
    console.log('🚀 Manual analytics update triggered');
    await this.updateAllAnalytics();
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun
    };
  }

  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

module.exports = analyticsService; 