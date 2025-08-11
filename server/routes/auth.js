const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration steps
router.post('/register/email', authController.registerEmail); // Step 1 & 2: Name, Email, send email OTP
router.post('/register/email/verify', authController.verifyEmailOtp); // Verify email OTP
router.post('/register/phone', authController.registerPhone); // Step 3: Phone, send WhatsApp OTP
router.post('/register/phone/verify', authController.verifyPhoneOtp); // Verify WhatsApp OTP
router.post('/register/details', authController.registerDetails); // Step 4: Country, Language, create user

// Dedicated registration endpoints
router.post('/register/influencer', authController.registerInfluencer);
router.post('/register/brand', authController.registerBrand);
router.post('/register/agency', authController.registerAgency);

// Login
router.post('/login', authController.login);
//forgot password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router; 