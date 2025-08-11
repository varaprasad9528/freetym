const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

router.post('/send-email', otpController.sendEmailOtp);
router.post('/send-whatsapp', otpController.sendWhatsappOtp);
router.post('/verify-email', otpController.verifyEmailOtp);
router.post('/verify-whatsapp', otpController.verifyWhatsappOtp);

module.exports = router; 