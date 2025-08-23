const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/brandcontroller');
const auth = require('../middleware/auth');


// Route to get all campaigns for the authenticated brand
router.get('/campaigns/my', auth(['brand']), campaignController.getAllCampaignsForABrand);

// Brand reviews and accepts/rejects an influencer's application
router.post('/campaigns/review-application', auth(['brand']), campaignController.reviewApplication);

// Route to get all applications for a specific campaign
router.get('/campaigns/:campaignId/applications', auth(['brand']), campaignController.getAllApplicationsForCampaign);

module.exports = router; 