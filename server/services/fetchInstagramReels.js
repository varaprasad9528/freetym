const cron = require('node-cron');
const axios = require('axios');
const User = require('../models/User');
const Reel = require('../models/Reel');
const encryption = require('../utils/encryption');

const INSTAGRAM_API_VERSION = 'v12.0';

const fetchInstagramReels = async () => {
  console.log(`[CRON] Starting Instagram reel fetch at ${new Date().toISOString()}`);

  try {
    const users = await User.find({ 'socialConnections.instagram.connected': true });

    for (const user of users) {
      const accessTokenEncrypted = user.socialConnections.instagram.accessToken;

      if (!accessTokenEncrypted) {
        console.warn(`⚠️  No access token for user: ${user._id}`);
        continue;
      }

      const accessToken = encryption.decrypt(accessTokenEncrypted);

      // Fetch media items (reels/videos)
      const mediaRes = await axios.get(`https://graph.instagram.com/me/media`, {
        params: {
          fields: 'id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,like_count,comments_count,view_count',
          access_token: accessToken,
          limit: 50
        }
      });

      const mediaItems = mediaRes.data.data;

      for (const item of mediaItems) {
        // Skip if not a video or reel
        if (item.media_type !== 'VIDEO') continue;

        const exists = await Reel.findOne({ reelId: item.id });
        if (exists) continue;

        const reel = new Reel({
          reelId: item.id,
          platform: 'instagram',
          influencer: user._id,
          title: item.caption || '',
          description: '',
          thumbnail: item.thumbnail_url || item.media_url,
          url: item.permalink,
          metrics: {
            likes: item.like_count || 0,
            views: item.view_count || 0,
            comments: item.comments_count || 0,
            shares: 0
          },
          tags: [],
          category: '',
          language: '',
          lastUpdated: new Date(item.timestamp)
        });

        await reel.save();
        console.log(`✅ Saved new reel for user ${user._id} - Reel ID: ${item.id}`);
      }
    }

    console.log(`[CRON] Completed Instagram reel fetch at ${new Date().toISOString()}`);
  } catch (error) {
    console.error(`[CRON] Error during Instagram reel fetch:`, error.message);
  }
};

// Schedule: Every day at 2:00 AM
cron.schedule('0 2 * * *', fetchInstagramReels);

module.exports = fetchInstagramReels;
