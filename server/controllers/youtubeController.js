const axios = require('axios');
const User = require('../models/User');
const Content = require('../models/Content');
const encryption = require('../utils/encryption');
const Reel = require('../models/Reel');
require('dotenv').config();
/**
 * YouTube API Controller
 * Handles OAuth flow, channel verification, and content processing
 */
console.log('YOUTUBE_CLIENT_ID:', process.env.YOUTUBE_CLIENT_ID);
let clientId = process.env.YOUTUBE_CLIENT_ID;
let clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
let redirectUri = process.env.YOUTUBE_REDIRECT_URI;
let apiKey = process.env.YOUTUBE_API_KEY;
let baseUrl = 'https://www.googleapis.com/youtube/v3';
let refreshAccessToken= async (refreshToken)=> {
    try {
      const decryptedRefreshToken = encryption.decrypt(refreshToken);
      
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: decryptedRefreshToken
      });

      const { access_token, expires_in } = response.data;
      return {
        accessToken: encryption.encrypt(access_token),
        expiresIn: expires_in
      };
    } catch (error) {
      console.error('YouTube token refresh error:', error);
      throw new Error('Failed to refresh YouTube access token');
    }
  }
class YouTubeController {
  constructor() {
    // console.log(process.env.YOUTUBE_CLIENT_ID)
    let clientId = process.env.YOUTUBE_CLIENT_ID;
    let clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    let redirectUri = process.env.YOUTUBE_REDIRECT_URI;
    let apiKey = process.env.YOUTUBE_API_KEY;
    let baseUrl = 'https://www.googleapis.com/youtube/v3';
    console.log(clientId,clientSecret,redirectUri,apiKey)
    if (!clientId || !clientSecret || !redirectUri) {
      console.warn('⚠️  YouTube API credentials not fully configured');
    }
  }

  /**
   * Generate YouTube OAuth authorization URL
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async initiateOAuth(req, res) {
    try {
      const { userId } = req.user;
      let clientId = process.env.YOUTUBE_CLIENT_ID;
      let clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
      let redirectUri = process.env.YOUTUBE_REDIRECT_URI;
      let apiKey = process.env.YOUTUBE_API_KEY;
      let baseUrl = 'https://www.googleapis.com/youtube/v3';
      console.log(userId)
      console.log("1")
      console.log(clientId)
      if (!clientId || !redirectUri) {
        return res.status(500).json({ 
          message: 'YouTube API not configured' 
        });
      }
      console.log("2")

    console.log(clientId,clientSecret,redirectUri,apiKey)
    console.log("!")
    console.log(redirectUri)
      const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
      const scope = 'https://www.googleapis.com/auth/youtube.readonly';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `state=${encodeURIComponent(state)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      res.json({ 
        authUrl,
        message: 'YouTube OAuth initiated'
      });
    } catch (error) {
      console.error('YouTube OAuth initiation error:', error);
      res.status(500).json({ 
        message: 'Failed to initiate YouTube OAuth',
        error: error.message 
      });
    }
  }
   /**
   * Refresh YouTube access token
   * @param {string} refreshToken - Encrypted refresh token
   * @returns {Object} - New access token and expiration
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decryptedRefreshToken = encryption.decrypt(refreshToken);
      
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: decryptedRefreshToken
      });

      const { access_token, expires_in } = response.data;
      return {
        accessToken: encryption.encrypt(access_token),
        expiresIn: expires_in
      };
    } catch (error) {
      console.error('YouTube token refresh error:', error);
      throw new Error('Failed to refresh YouTube access token');
    }
  }

  /**
   * Verify YouTube channel and update metrics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyChannel(req, res) {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);
      
      if (!user || !user.socialConnections.youtube.connected) {
        return res.status(400).json({ 
          message: 'YouTube not connected' 
        });
      }
      
      // Check if token needs refresh
      if (new Date() > user.socialConnections.youtube.tokenExpiresAt) {
        const newTokens = await refreshAccessToken(user.socialConnections.youtube.refreshToken);
        user.socialConnections.youtube.accessToken = newTokens.accessToken;
        user.socialConnections.youtube.tokenExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
      }

      const accessToken = encryption.decrypt(user.socialConnections.youtube.accessToken);
      
      // Get channel information
      const channelResponse = await axios.get(`${baseUrl}/channels`, {
        params: {
          part: 'snippet,statistics',
          id: user.socialConnections.youtube.channelId,
          access_token: accessToken
        }
      });

      const channel = channelResponse.data.items[0];
      
      // Get recent videos for analytics
      const videosResponse = await axios.get(`${baseUrl}/search`, {
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
      
      // Get video statistics
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalDuration = 0;

      for (const video of videos) {
        const statsResponse = await axios.get(`${baseUrl}/videos`, {
          params: {
            part: 'statistics,contentDetails',
            id: video.id.videoId,
            access_token: accessToken
          }
        });

        const stats = statsResponse.data.items[0];
        if (stats) {
          totalViews += parseInt(stats.statistics.viewCount) || 0;
          totalLikes += parseInt(stats.statistics.likeCount) || 0;
          totalComments += parseInt(stats.statistics.commentCount) || 0;
          
          // Parse duration (ISO 8601 format)
          const duration = stats.contentDetails.duration;
          const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
          const hours = parseInt(match[1]) || 0;
          const minutes = parseInt(match[2]) || 0;
          const seconds = parseInt(match[3]) || 0;
          totalDuration += hours * 3600 + minutes * 60 + seconds;
        }
      }

      const averageViewDuration = videos.length > 0 ? totalDuration / videos.length : 0;

      // Update user's YouTube connection
      user.socialConnections.youtube.channelTitle = channel.snippet.title;
      user.socialConnections.youtube.subscriberCount = parseInt(channel.statistics.subscriberCount) || 0;
      user.socialConnections.youtube.channelData = {
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        thumbnailUrl: channel.snippet.thumbnails.default.url,
        country: channel.snippet.country,
        viewCount: parseInt(channel.statistics.viewCount) || 0,
        videoCount: parseInt(channel.statistics.videoCount) || 0
      };
      user.socialConnections.youtube.lastVerifiedAt = new Date();
      user.socialConnections.youtube.verificationStatus = 'verified';

      // Update platform metrics
      user.platformMetrics.youtube = {
        totalViews,
        totalLikes,
        totalComments,
        averageViewDuration,
        lastUpdated: new Date()
      };

      await user.save();

      res.json({
        message: 'YouTube channel verified successfully',
        channel: user.socialConnections.youtube,
        metrics: user.platformMetrics.youtube
      });
    } catch (error) {
      console.error('YouTube channel verification error:', error);
      res.status(500).json({ 
        message: 'Failed to verify YouTube channel',
        error: error.message 
      });
    }
  }
  /**
   * Handle YouTube OAuth callback
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async handleCallback(req, res) {
    let clientId = process.env.YOUTUBE_CLIENT_ID;
      let clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
      let redirectUri = process.env.YOUTUBE_REDIRECT_URI;
      let apiKey = process.env.YOUTUBE_API_KEY;
      let baseUrl = 'https://www.googleapis.com/youtube/v3';
    try {
      const { code, state } = req.query;
      console.log("Handle call back ")
      if (!code) {
        return res.status(400).json({ 
          message: 'Authorization code not provided' 
        });
      }
      console.log("Call back")
      // Decode state to get userId
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      const { userId } = stateData;

      // Exchange code for access token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code
      });

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Get channel information
      const channelResponse = await axios.get(`${baseUrl}/channels`, {
        params: {
          part: 'snippet,statistics',
          mine: true,
          access_token
        }
      });

      const channel = channelResponse.data.items[0];
      if (!channel) {
        return res.status(400).json({ 
          message: 'No YouTube channel found' 
        });
      }

      // Update user with YouTube connection
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Encrypt tokens before storing
      const encryptedAccessToken = encryption.encrypt(access_token);
      const encryptedRefreshToken = encryption.encrypt(refresh_token);
      
      user.socialConnections.youtube = {
        connected: true,
        channelId: channel.id,
        channelTitle: channel.snippet.title,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        channelData: {
          description: channel.snippet.description,
          customUrl: channel.snippet.customUrl,
          thumbnailUrl: channel.snippet.thumbnails.default.url,
          country: channel.snippet.country,
          viewCount: parseInt(channel.statistics.viewCount) || 0,
          videoCount: parseInt(channel.statistics.videoCount) || 0
        },
        lastVerifiedAt: new Date(),
        verificationStatus: 'verified'
      };

      await user.save();
      console.log(user)
      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}/influencer/dashboard`);
    } catch (error) {
      console.error('YouTube OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/influencer/dashboard`);
    }
  }



  /**
   * Process YouTube content URL and extract analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processContent(req, res) {
    try {
      const { userId } = req.user;
      const { url, contentType = 'video' } = req.body;

      if (!url) {
        return res.status(400).json({ 
          message: 'Content URL is required' 
        });
      }

      // Validate YouTube URL
      const youtubeUrlRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]+)/;
      const match = url.match(youtubeUrlRegex);
      
      if (!match) {
        return res.status(400).json({ 
          message: 'Invalid YouTube URL' 
        });
      }

      const videoId = match[3];
      const user = await User.findById(userId);
      
      if (!user || !user.socialConnections.youtube.connected) {
        return res.status(400).json({ 
          message: 'YouTube not connected' 
        });
      }

      // Check if token needs refresh
      if (new Date() > user.socialConnections.youtube.tokenExpiresAt) {
        const newTokens = await refreshAccessToken(user.socialConnections.youtube.refreshToken);
        user.socialConnections.youtube.accessToken = newTokens.accessToken;
        user.socialConnections.youtube.tokenExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
        await user.save();
      }

      const accessToken = encryption.decrypt(user.socialConnections.youtube.accessToken);

      // Get video details from YouTube API
      const videoResponse = await axios.get(`${baseUrl}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          access_token: accessToken
        }
      });

      const video = videoResponse.data.items[0];
      if (!video) {
        return res.status(404).json({ 
          message: 'Video not found' 
        });
      }

      // Create or update content record
      let content = await Content.findOne({ 
        userId, 
        platform: 'youtube', 
        contentId: videoId 
      });

      if (!content) {
        content = new Content({
          userId,
          platform: 'youtube',
          contentId: videoId,
          url,
          contentType: contentType === 'short' ? 'short' : 'video',
          metadata: {
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnailUrl: video.snippet.thumbnails.high.url,
            duration: video.contentDetails.duration,
            isPublic: video.snippet.privacyStatus === 'public',
            isSponsored: false
          },
          publishedAt: new Date(video.snippet.publishedAt),
          processingStatus: 'completed'
        });
      }

      // Create analytics snapshot
      const analyticsSnapshot = {
        timestamp: new Date(),
        likes: parseInt(video.statistics.likeCount) || 0,
        comments: parseInt(video.statistics.commentCount) || 0,
        views: parseInt(video.statistics.viewCount) || 0,
        shares: 0, // YouTube doesn't provide share count via API
        saves: 0, // YouTube doesn't provide save count via API
        reach: 0, // YouTube doesn't provide reach via API
        impressions: 0, // YouTube doesn't provide impressions via API
        engagementRate: 0,
        viewDuration: 0, // Will be calculated separately
        subscriberGained: 0, // Will be calculated separately
        subscriberLost: 0 // Will be calculated separately
      };

      content.analyticsSnapshots.push(analyticsSnapshot);
      content.processingStatus = 'completed';
      content.lastAnalyticsUpdate = new Date();

      await content.save();

      res.json({
        message: 'YouTube content processed successfully',
        content: {
          id: content._id,
          contentId: content.contentId,
          url: content.url,
          analytics: content.currentAnalytics,
          metadata: content.metadata
        }
      });
    } catch (error) {
      console.error('YouTube content processing error:', error);
      res.status(500).json({ 
        message: 'Failed to process YouTube content',
        error: error.message 
      });
    }
  }

  /**
   * Refresh YouTube analytics for all user content
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshAnalytics(req, res) {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);
      
      if (!user || !user.socialConnections.youtube.connected) {
        return res.status(400).json({ 
          message: 'YouTube not connected' 
        });
      }

      // Check if token needs refresh
      if (new Date() > user.socialConnections.youtube.tokenExpiresAt) {
        const newTokens = await refreshAccessToken(user.socialConnections.youtube.refreshToken);
        user.socialConnections.youtube.accessToken = newTokens.accessToken;
        user.socialConnections.youtube.tokenExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
        await user.save();
      }

      const accessToken = encryption.decrypt(user.socialConnections.youtube.accessToken);
      
      // Get user's videos
      const videosResponse = await axios.get(`${baseUrl}/search`, {
        params: {
          part: 'snippet',
          channelId: user.socialConnections.youtube.channelId,
          type: 'video',
          order: 'date',
          maxResults: 50,
          access_token: accessToken
        }
      });

      const videos = videosResponse.data.items;
      let updatedCount = 0;

      // Update each content item
      for (const video of videos) {
        let content = await Content.findOne({ 
          userId, 
          platform: 'youtube', 
          contentId: video.id.videoId 
        });

        if (!content) {
          // Create new content record
          content = new Content({
            userId,
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
        const statsResponse = await axios.get(`${baseUrl}/videos`, {
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
          updatedCount++;
        }
      }

      res.json({
        message: `YouTube analytics refreshed successfully`,
        updatedCount,
        totalContent: videos.length
      });
    } catch (error) {
      console.error('YouTube analytics refresh error:', error);
      res.status(500).json({ 
        message: 'Failed to refresh YouTube analytics',
        error: error.message 
      });
    }
  }

async importReelsAsReelModel(req, res) {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    console.log(user)
    if (!user || !user.socialConnections.youtube?.connected) {
      return res.status(400).json({ message: 'YouTube not connected' });
    }

    // Refresh token if expired
    if (new Date() > user.socialConnections.youtube.tokenExpiresAt) {
      const newTokens = await this.refreshAccessToken(user.socialConnections.youtube.refreshToken);
      user.socialConnections.youtube.accessToken = newTokens.accessToken;
      user.socialConnections.youtube.tokenExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
      await user.save();
    }

    const accessToken = encryption.decrypt(user.socialConnections.youtube.accessToken);
    const baseUrl = 'https://www.googleapis.com/youtube/v3';

    // Get uploads playlist ID
    const channelsRes = await axios.get(`${baseUrl}/channels`, {
      params: {
        part: 'contentDetails',
        id: user.socialConnections.youtube.channelId,
        access_token: accessToken
      }
    });

    const uploadsPlaylistId = channelsRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      return res.status(400).json({ message: 'No YouTube uploads playlist found' });
    }

    // Get uploaded videos (limit 50)
    const playlistItemsRes = await axios.get(`${baseUrl}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: 50,
        access_token: accessToken
      }
    });
    console.log("!")
    const videos = playlistItemsRes.data.items;
    let imported = 0;
    // console.log(videos)
    for (const video of videos) {
      const videoId = video.contentDetails.videoId;
      const exists = await Reel.findOne({ reelId: videoId });
      if (exists) continue;

      // Get detailed video data
      const videoRes = await axios.get(`${baseUrl}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          access_token: accessToken
        }
      });

      const videoData = videoRes.data.items?.[0];
      if (!videoData) continue;
console.log(videoData)
function parseISODuration(duration) {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const [, hours, minutes, seconds] = duration.match(regex) || [];
  return (
    (parseInt(hours) || 0) * 3600 +
    (parseInt(minutes) || 0) * 60 +
    (parseInt(seconds) || 0)
  );
}

function calculateTrendingScore(metrics, publishedAt) {
  const views = parseInt(metrics.viewCount) || 0;
  const likes = parseInt(metrics.likeCount) || 0;
  const comments = parseInt(metrics.commentCount) || 0;

  const engagement = likes + comments;
  const ageInHours = (Date.now() - new Date(publishedAt)) / (1000 * 60 * 60);

  if (views === 0 || ageInHours <= 0) return 0;

  const score = (engagement / views) * 100 + (views / (ageInHours + 1)) * 0.1;
  return Math.round(score * 100) / 100; // Round to 2 decimals
}

      // Filter only Shorts (duration <= 3 minutes)
      const durationISO = videoData.contentDetails.duration;
      const durationSeconds = parseISODuration(durationISO);
      if (durationSeconds > 180) continue; // Skip if longer than 3 min

      const snippet = videoData.snippet;
      const stats = videoData.statistics;

      const trendingScore = calculateTrendingScore(stats, snippet.publishedAt);
      const isTrending = trendingScore >= 50; // Adjust this threshold as needed

      const newReel = new Reel({
        reelId: videoId,
        platform: 'youtube',
        influencer: userId,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails?.high?.url || '',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        tags: [],
        category: snippet.categoryId || '',
        language: snippet.defaultAudioLanguage || '',
        metrics: {
          likes: parseInt(stats.likeCount) || 0,
          views: parseInt(stats.viewCount) || 0,
          comments: parseInt(stats.commentCount) || 0
        },
        isTrending,
        trendingScore,
        lastUpdated: new Date(snippet.publishedAt)
      });
      
      await newReel.save();
      imported++;
    }

    res.json({
      success: true,
      message: `${imported} YouTube shorts imported successfully.`
    });
  } catch (error) {
    console.error('Error importing YouTube reels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import YouTube reels',
      error: error.message
    });
  }
}

}

module.exports = new YouTubeController(); 