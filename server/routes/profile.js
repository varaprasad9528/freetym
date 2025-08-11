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
module.exports = router;
