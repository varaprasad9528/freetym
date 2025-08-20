const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const brandPlanLimit = require('../middleware/brandPlanLimit');
const campaignController = require('../controllers/campaignController');

// Brand: create campaign (plan limit)
// router.post('/', auth(['brand']), brandPlanLimit, campaignController.createCampaign);
router.post('/', auth(['brand']), campaignController.createCampaign);
router.post('/bulk', auth(['brand']), campaignController.createCampaigns);
// Brand: update/delete own campaign
router.put('/:id', auth(['brand']), campaignController.updateCampaign);
router.delete('/:id', auth(['brand']), campaignController.deleteCampaign);
// Brand: view own campaigns
router.get('/my', auth(['brand']), campaignController.getMyCampaigns);
// Brand: view applications to a campaign
router.get('/:id/applications', auth(['brand']), campaignController.getCampaignApplications);
// Brand: accept/reject application
router.post('/:id/applications/:appId/decision', auth(['brand']), campaignController.decideApplication);

// Influencer: view active campaigns
router.get('/', auth(['influencer']), campaignController.getActiveCampaigns);
// Influencer: apply to campaign
router.post('/:id/apply', auth(['influencer']), campaignController.applyToCampaign);
// Influencer: view own applications
router.get('/applications/me', auth(['influencer']), campaignController.getMyApplications);

// NEW: Enhanced Campaign Management
router.get('/explore', auth(['influencer']), campaignController.getExploreCampaigns);
router.get('/my-campaigns', auth(['influencer']), campaignController.getMyCampaignsForInfluencer);
router.post('/apply', auth(['influencer']), campaignController.applyForCampaign);

// Get one campaign
router.get('/:id', auth(['influencer', 'brand', 'admin']), campaignController.getCampaignById);
// Get all campaigns by brand
router.get('/brand/:brandId', auth(['brand', 'admin']), campaignController.getCampaignsByBrand);
// Admin delete campaign
router.delete('/admin/:id', auth(['admin']), campaignController.adminDeleteCampaign);

module.exports = router; 