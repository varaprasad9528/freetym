const Otp = require('../models/Otp');
const User = require('../models/User');

// generating otp 
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// personal mails domains 

const commonPersonalDomains = [
  "gmail.com",
  // "yahoo.com",
  // "outlook.com",
  // "hotmail.com",
  // "icloud.com",
  // "aol.com",
  // "live.com",
  // "msn.com",
  // "protonmail.com",
  // "zoho.com",
  // "mail.com",
  // "gmx.com",
  // "yandex.com",
  // "me.com",
  // "mac.com",
];

// checking the mail in allowed personal mails domains 

const isAllowedPersonalEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return commonPersonalDomains.includes(domain);
};

// temporary mails format 

const disposableEmailDomains = [
  "10minutemail.com",
  "tempmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "trashmail.com",
  "yopmail.com",
  "throwawaymail.com",
  "getnada.com",
  "moakt.com",
  "maildrop.cc",
  "dispostable.com",
  "fakeinbox.com",
  "emailondeck.com",
  "spambog.com",
  "mintemail.com",
  "temporarymail.com",
  "tmail.io",
  "sharklasers.com",
  "spamgourmet.com",
  "spam4.me",
];

// elimaniting temporary mails 

const isBlockedEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
};

// validating email

function isEmailValid(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

//otp validate 

function isValidOtp(otp) {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
}

//validate phone number

function isValidPhone(phone) {
  const phoneRegex = /^(?:\+91)?[1-9]\d{9}$/;
  return phoneRegex.test(phone);
}
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


// 7. update contact details
exports.registerEmail = async (req, res) => {
  try {
    const { email } = req.body;
    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Get the user by userId
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!isEmailValid(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (isBlockedEmail(email)) {
      return res
        .status(400)
        .json({ message: "Disposable email addresses are not allowed." });
    }
    if (user.role === "influencer") {
      if (!isAllowedPersonalEmail(email)) {
        return res
          .status(400)
          .json({ message: "Please use a valid personal gmail." });
      }
    }
    if (user.email === email) {
      return res.status(400).json({ message: "The provided email is the same as your registered email." });
    }

    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Generate OTP for the new email
    const otp = generateOtp();
    await Otp.deleteMany({ email, type: "email" }); // Delete any previous OTP for this email

    // Save OTP to the database
    await Otp.create({
      email,
      otp,
      type: "email",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),  // 10 minutes expiry
    });
    console.log(otp)
    // Send OTP to the new email
    // await sendEmailOtp(email, otp, 'verification');

    return res.json({ message: "OTP sent to email." });
  } catch (err) {
    return res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }
    if (!isValidOtp(otp)) {
      return res
        .status(400)
        .json({ message: "Invalid OTP format. It must be a 6-digit number." });
    }
    // Check if OTP exists and is valid
    const record = await Otp.findOne({
      email,
      otp,
      type: "email",
      expiresAt: { $gt: new Date() },  // Check if OTP is still valid
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Mark OTP as verified
    record.verified = true;
    await record.save();
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.email = email;
    await user.save();

    return res.status(200).json({ message: "Email address verified and updated successfully." });
  } catch (err) {
    return res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};

exports.registerPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.userId; // Get userId from the authenticated user

    // Validate phone number
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required." });
    }
    if (!isValidPhone(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number. Must be 10 digits." });
    }
    // Check if phone is valid (optional, you can add your own validation logic here)
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Invalid phone number. Please provide a valid phone number." });
    }

    // Get the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If the provided phone number is the same as the user's registered phone number
    if (user.phone === phone) {
      return res.status(400).json({ message: "The provided phone number is the same as your registered phone number." });
    }

    // If the phone number is different from the registered one, check if the phone number is already registered
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Phone number is already registered." });
    }

    // Generate OTP for the new phone number
    const otp = generateOtp();
    await Otp.deleteMany({ phone, type: "phone" }); // Delete any previous OTP for this phone number

    // Save OTP to the database
    await Otp.create({
      phone,
      otp,
      type: "reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),  // 10 minutes expiry
    });
    console.log(otp)
    // Send OTP to the new phone number (you can replace this with actual sending logic, e.g., using SMS API)
    // await sendPhoneOtp(phone, otp);

    return res.json({ message: "OTP sent to phone number." });
  } catch (err) {
    return res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validate OTP format
    if (!otp || !phone) {
      return res.status(400).json({ message: "Phone and OTP are required." });
    }
    if (!isValidOtp(otp)) {
      return res
        .status(400)
        .json({ message: "Invalid OTP format. It must be a 6-digit number." });
    }
    // Check if OTP exists and is valid
    const record = await Otp.findOne({
      phone,
      otp,
      type: "reset",
      expiresAt: { $gt: new Date() },  // Check if OTP is still valid
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Mark OTP as verified
    record.verified = true;
    await record.save();

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.phone = phone;
    await user.save();

    return res.status(200).json({ message: "Phone number verified and updated successfully." });

  } catch (err) {
    return res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};


