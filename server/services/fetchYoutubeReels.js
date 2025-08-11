const cron = require('node-cron');
const axios = require('axios');
const User = require('../models/User');
const Reel = require('../models/Reel');

/**
 * Fetch YouTube videos for connected users daily at 2AM
 * 
 * This assumes your User model stores YouTube access tokens in:
 * user.socialConnections.youtube.accessToken
 * 
 * You must have YouTube Data API v3 enabled and tokens stored.
 */

const fetchYouTubeReels = async () => {
  console.log(`[CRON] Starting YouTube reel fetch at ${new Date().toISOString()}`);

  try {
    const users = await User.find({ 'socialConnections.youtube.connected': true });

    for (const user of users) {
      const accessToken = user.socialConnections.youtube.accessToken; // adjust if encrypted like Instagram

      if (!accessToken) continue;

      // Get the user's YouTube channel ID
      const channelsRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          part: 'contentDetails',
          mine: true,
          access_token: accessToken
        }
      });

      if (!channelsRes.data.items || channelsRes.data.items.length === 0) {
        console.log(`No YouTube channels found for user ${user._id}`);
        continue;
      }

      const uploadsPlaylistId = channelsRes.data.items[0].contentDetails.relatedPlaylists.uploads;

      // Fetch videos from uploads playlist (max 50)
      const playlistItemsRes = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'snippet,contentDetails',
          playlistId: uploadsPlaylistId,
          maxResults: 50,
          access_token: accessToken
        }
      });

      const videos = playlistItemsRes.data.items;

      for (const video of videos) {
        const videoId = video.contentDetails.videoId;

        // Check if reel/video already saved
        const exists = await Reel.findOne({ reelId: videoId });
        if (exists) continue;

        // Get video statistics
        const videoRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,statistics',
            id: videoId,
            access_token: accessToken
          }
        });

        if (!videoRes.data.items || videoRes.data.items.length === 0) continue;

        const videoData = videoRes.data.items[0];
        const stats = videoData.statistics;
        const snippet = videoData.snippet;

        const reel = new Reel({
          reelId: videoId,
          platform: 'youtube',
          influencer: user._id,
          title: snippet.title,
          description: snippet.description,
          thumbnail: snippet.thumbnails?.high?.url || '',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          metrics: {
            likes: stats.likeCount ? parseInt(stats.likeCount) : 0,
            views: stats.viewCount ? parseInt(stats.viewCount) : 0,
            comments: stats.commentCount ? parseInt(stats.commentCount) : 0,
            shares: 0 // YouTube API doesn't provide share count
          },
          lastUpdated: new Date(snippet.publishedAt)
        });

        await reel.save();
        console.log(`✅ Saved YouTube reel: ${videoId}`);
      }
    }

    console.log(`[CRON] Done fetching YouTube reels at ${new Date().toISOString()}`);

  } catch (error) {
    console.error('[CRON] YouTube fetch error:', error.message);
  }
};

// Schedule at 3:00 AM daily
cron.schedule('0 3 * * *', fetchYouTubeReels);

module.exports = fetchYouTubeReels;
