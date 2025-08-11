const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

router.get('/plans', auth(['influencer']), subscriptionController.getAvailablePlans);
router.post('/order', auth(['influencer', 'brand']), subscriptionController.createOrder);
router.post('/verify', auth(['influencer', 'brand']), subscriptionController.verifyAndActivate);
router.get('/history', auth(['influencer', 'brand']), subscriptionController.getHistory);
router.put('/cancel/:subscriptionId', auth(['influencer', 'brand']), subscriptionController.cancelSubscription);

module.exports = router;

