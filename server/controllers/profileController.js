const User = require('../models/User');

// 1. Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. Update Personal Details
exports.updatePersonalDetails = async (req, res) => {
  const { firstName, lastName, dob, gender, relationshipStatus, about } = req.body;
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      firstName,
      lastName,
      dob,
      gender,
      relationshipStatus,
      about
    });
    res.json({ message: 'Personal details updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating personal details' });
  }
};

// 3. Update Username
exports.updateUsername = async (req, res) => {
  const { username } = req.body;
  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Username already taken' });

    await User.findByIdAndUpdate(req.user.userId, { username });
    res.json({ message: 'Username updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating username' });
  }
};

// 4. Update Address
exports.updateAddress = async (req, res) => {
  const { country, state, city, pincode, fullAddress } = req.body;
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      address: { country, state, city, pincode, fullAddress }
    });
    res.json({ message: 'Address updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating address' });
  }
};

// 5. Update Commercials
exports.updateCommercials = async (req, res) => {
  const { platform, services } = req.body;
  console.log(platform)
  try {
    if (!['instagram', 'youtube'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const update = {};
    update[`commercials.${platform}`] = services; // services: [{ service, rate }]

    await User.findByIdAndUpdate(req.user.userId, update);
    res.json({ message: `${platform} commercials updated` });
  } catch (err) {
    res.status(500).json({ error: 'Error updating commercials' });
  }
};

// 6. Get Contact Details
exports.getContactDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('email phone');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      email: user.email,
      phone: user.phone
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching contact details' });
  }
};
