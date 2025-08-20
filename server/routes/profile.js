const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');


// Get Profile
router.get('/',auth(['influencer']), profileController.getProfile);

// Update Personal Details
router.put('/personal-details',auth(['influencer']), profileController.updatePersonalDetails);

// Update Username
router.put('/username',auth(['influencer']), profileController.updateUsername);

// Update Address
router.put('/address',auth(['influencer']), profileController.updateAddress);

// Update Commercials
router.put('/commercials',auth(['influencer']), profileController.updateCommercials);

//get contact details 
router.get('/contact-details',auth(['influencer']), profileController.getContactDetails);

// Register Phone (Send OTP)
router.post('/register/phone',auth(['influencer']), profileController.registerPhone);

// Verify Phone OTP
router.put('/verify/phone',auth(['influencer']), profileController.verifyPhoneOtp);

// Register Email (Send OTP)
router.post('/register/email',auth(['influencer']), profileController.registerEmail);

// Verify Email OTP
router.put('/verify/email',auth(['influencer']), profileController.verifyEmailOtp);

module.exports = router;


