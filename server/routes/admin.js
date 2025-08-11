const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Users
router.get('/users', auth(['admin']), adminController.getUsers);
router.put('/users/:id/approve', auth(['admin']), adminController.approveInfluencer);
router.put('/users/:id/reject', auth(['admin']), adminController.rejectInfluencer);

// Campaigns
router.get('/campaigns', auth(['admin']), adminController.getCampaigns);

// Applications
router.get('/applications', auth(['admin']), adminController.getApplications);

// Plans
router.get('/plans', auth(['admin']), adminController.getPlans);
router.post('/plans', auth(['admin']), adminController.createPlan);           
router.put('/plans/:id', auth(['admin']), adminController.updatePlan);        
router.delete('/plans/:id', auth(['admin']), adminController.deletePlan);     
// Subscriptions
router.get('/subscriptions', auth(['admin']), adminController.getSubscriptions);

// Analytics
router.get('/analytics', auth(['admin']), adminController.getAnalytics);

// Payout management
router.get('/payouts', auth(['admin']), adminController.getPayoutRequests);
router.post('/payouts/:id/complete', auth(['admin']), adminController.completePayout);

// Transactions
router.get('/transactions', auth(['admin']), adminController.getTransactions);
// Admin create campaign
router.post('/campaigns', auth(['admin']), adminController.createCampaign);

module.exports = router; 