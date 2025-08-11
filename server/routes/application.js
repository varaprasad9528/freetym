const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

// Influencer apply to campaign
router.post('/apply/:campaignId', auth(['influencer']), applicationController.applyToCampaign);
// Influencer view own applications
router.get('/my-applications', auth(['influencer']), applicationController.getMyApplications);
// Brand view applications for a campaign
router.get('/campaign/:campaignId', auth(['brand']), applicationController.getCampaignApplications);
// Brand accept/reject application
router.put('/status/:applicationId', auth(['brand']), applicationController.updateApplicationStatus);
// Admin view all applications
router.get('/admin/all', auth(['admin']), applicationController.getAllApplications);

module.exports = router; 