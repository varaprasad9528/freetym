const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const influencerController = require('../controllers/influencerController');
const guestSearchLimit = require('../middleware/guestSearchLimit');

// Social profile update
router.put('/profile/social', auth(['influencer']), influencerController.updateSocialProfiles);
// Connect Meta API (stub)
router.post('/profile/meta/connect', auth(['influencer']), influencerController.connectMetaApi);

// Profile endpoints
router.get('/profile/personal', auth(['influencer']), influencerController.getPersonalDetails);
router.patch('/profile/personal', auth(['influencer']), influencerController.editPersonalDetails);
router.get('/profile/username', auth(['influencer']), influencerController.getUsername);
router.patch('/profile/username', auth(['influencer']), influencerController.editUsername);

// Submit post URL for a campaign
router.post('/campaigns/:id/post', auth(['influencer']), influencerController.submitPostUrl);
// Get analytics for all promotions (with time range)
router.get('/dashboard/analytics', auth(['influencer']), influencerController.getDashboardAnalytics);
// Request withdrawal for a promotion
router.post('/applications/:id/withdraw', auth(['influencer']), influencerController.requestWithdrawal);
// Influencer search (public, with guest search limit)
router.get('/search', guestSearchLimit, influencerController.searchInfluencers);

// Campaign dashboard endpoints
router.get('/campaigns/my', auth(['influencer']), influencerController.getMyCampaigns);
router.get('/campaigns/explore', auth(['influencer']), influencerController.getExploreCampaigns);
router.get('/campaigns/applied', auth(['influencer']), influencerController.getAppliedCampaigns);
router.post('/campaigns/apply/:campaignId', auth(['influencer']), influencerController.applyToCampaign);
router.get('/campaigns/:campaignId',auth(['influencer']), influencerController.getSingleCampaign);
// Social Account Management
router.post('/accounts', auth(['influencer']), influencerController.addSocialAccount);
router.get('/accounts/:id', auth(['influencer']), influencerController.getSocialAccountAnalytics);
router.post('/accounts/refresh', auth(['influencer']), influencerController.refreshSocialAccountData);

// // Media Kit Management
// router.get('/media-kit', auth(['influencer']), influencerController.getAllMediaKits);
// router.post('/media-kit/media-kit',auth(['influencer']), influencerController.addMediaKit);
// router.put('/media-kit/:mediaKitId',auth(['influencer']), influencerController.updateMediaKit);
// router.delete('/media-kit/:mediaKitId',auth(['influencer']), influencerController.deleteMediaKit);
// Media Kit Management
router.get('/media-kit', auth(['influencer']), influencerController.getAllMediaKits);
router.post('/media-kit',auth(['influencer']), influencerController.addMediaKit);
router.put('/media-kit/:mediaKitId',auth(['influencer']), influencerController.updateMediaKit);
router.delete('/media-kit/:mediaKitId',auth(['influencer']), influencerController.deleteMediaKit);
module.exports = router; 

