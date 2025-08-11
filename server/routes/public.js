const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const publicSearchLimit = require('../middleware/publicSearchLimit');
const User = require('../models/User');

// Public search endpoint with rate limiting
router.get('/search', publicSearchLimit, publicController.searchInfluencers);

// Demo request endpoint
router.post('/demo-requests', publicController.submitDemoRequest);

// Public route to get media kit by slug
router.get('/media-kit/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Search across all users for mediaKit with that slug
    const user = await User.findOne({ 'mediaKit.customUrl': slug });

    if (!user) {
      return res.status(404).json({ message: 'Media kit not found' });
    }

    const mediaKit = user.mediaKit.find(kit => kit.customUrl === slug);

    if (!mediaKit) {
      return res.status(404).json({ message: 'Media kit not found' });
    }

    res.status(200).json({ mediaKit, influencer: {
      username: user.username,
      name: user.name,
      profilePic: user.profilePic // optional additional public data
    }});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching media kit', error });
  }
});

module.exports = router; 