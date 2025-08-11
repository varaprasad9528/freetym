const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const walletController = require('../controllers/walletController');
const upload = require('../middleware/upload');
// KYC endpoints (influencers only)
router.post(
  '/kyc',
  auth(['influencer']),
  upload.fields([
    { name: 'pancardImage', maxCount: 1 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 }
  ]),
  walletController.uploadKYC
);
router.get('/kyc/status', auth(['influencer']), walletController.getKYCStatus);
router.post('/kyc/bank-upi', auth(['influencer']), walletController.submitBankAndUPI);
// Balance endpoints (influencers only)
router.get('/balance', auth(['influencer']), walletController.getBalance);

module.exports = router; 