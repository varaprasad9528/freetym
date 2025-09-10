const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reelsController = require('../controllers/reelsController');

// Public reels endpoints (no auth required for viewing)
router.get('/', reelsController.getReels);
// get trending reels 
// router.get('/trending', reelsController.getTrendingReels);

// trending reels with all the filters 
router.get('/trending',auth(['influencer', 'brand']), reelsController.getTrending);
// /api/reels/trending?category=beauty&platform=youtube&minFollowers=10000&accountType=creator&days=30&page=1&limit=20
// Authenticated reels endpoints
router.post('/:id/save', auth(['influencer', 'brand']), reelsController.toggleSaveReel);
router.get('/saved', auth(['influencer', 'brand']), reelsController.getSavedReels);

// Influencer-only endpoints
router.post('/', auth(['influencer']), reelsController.addReel);

module.exports = router; 