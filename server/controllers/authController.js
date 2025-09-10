const User = require("../models/User");
const Enquiry = require("../models/Enquiry");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendEmailOtp = require("../utils/sendEmailOtp");
const sendWhatsappOtp = require("../utils/sendWhatsappOtp");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { sendOtpViaPabbly } = require("../utils/otpSender");
// const axios = require('axios'); // For Pabbly WhatsApp API

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

// validate password 

function isValidPassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return passwordRegex.test(password);
}

// validate password 

function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push("Minimum 8 characters required.");
  }
  //need to comment this 
  // if (password.length > 12) {
  //   errors.push("Maximum 12 characters allowed.");
  // }
  if (!/[a-z]/.test(password)) {
    errors.push("At least one lowercase letter required.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter required.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("At least one digit required.");
  }
  if (!/[\W_]/.test(password)) {
    errors.push("At least one special character required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// registering email (Sending otp to email)
exports.registerEmail = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    console.log(role);
    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ message: "Name, email, and role are required." });
    }
    if (!isEmailValid(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (isBlockedEmail(email)) {
      return res
        .status(400)
        .json({ message: "Disposable email addresses are not allowed." });
    }
    if (role === "influencer") {
      if (!isAllowedPersonalEmail(email)) {
        return res
          .status(400)
          .json({ message: "Please use a valid personal gmail." });
      }
    }
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered." });
    
    // commented the enquiry form 
    // in the email registration 
    // const Enquiryform = await Enquiry.findOne({ email });

    // if (Enquiryform) {
    //   Enquiryform.name = name || Enquiryform.name;
    //   Enquiryform.role = role || Enquiryform.role;
    //   Enquiryform.createdAt = new Date();
    //   await Enquiryform.save();
    // } else {
    //   const newEntry = new Enquiry({
    //     name,
    //     email,
    //     role,
    //     status: "new",
    //   });
    //   await newEntry.save();
    // }
    const otp = generateOtp();
    console.log(otp)
    await Otp.deleteMany({ email, type: "email" });
    var data=await Otp.create({
      email,
      otp,
      type: "email",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    console.log(data)
    // For verification email
    await sendEmailOtp(email, otp, 'verification');
     // otpType=reset,registration  channel = email,whatsapp
      const sent = await sendOtpViaPabbly({
        email,
        otp,
        otpType:"registration",
        channel:"email"
      });
    console.log(otp);
    res.json({ message: "OTP sent to email." });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

// verifying the email otp 
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { name,role,email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    if (!isEmailValid(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (!isValidOtp(otp)) {
      return res
        .status(400)
        .json({ message: "Invalid OTP format. It must be a 6-digit number." });
    }
    
    console.log(name,role,email, otp)
    const record = await Otp.findOne({
      email,
      otp,
      type: "email",
      expiresAt: { $gt: new Date() },
    });
    console.log(record)
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    record.verified = true;
    await record.save();
    const Enquiryform = await Enquiry.findOne({ email });
    console.log(role)
    if (Enquiryform) {
      Enquiryform.name = name || Enquiryform.name;
      Enquiryform.role = role || Enquiryform.role;
      Enquiryform.createdAt = new Date();
      await Enquiryform.save();
    } else {
      const newEntry = new Enquiry({
        name,
        email,
        role:"agency",
        status: "new",
      });
      await newEntry.save();
    }
    console.log("Verified")
    return res
      .status(200)
      .json({ success: true, message: "Email OTP verified successfully." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error verifying OTP", error: err.message });
  }
};

// registerning the mobile number (Sending otp)

// exports.registerPhone = async (req, res) => {
//   try {
//     const { phone, email } = req.body;
//     if (!phone || !email)
//       return res.status(400).json({ message: "Phone and email are required." });
//     if (!isValidPhone(phone)) {
//       return res
//         .status(400)
//         .json({ message: "Invalid phone number. Must be 10 digits." });
//     }
//     console.log(email)
//     const emailOtp = await Otp.findOne({
//       email,
//       type: "email",
//       verified: true,
//     });
//     console.log(emailOtp)
//     if (!emailOtp)
//       return res.status(400).json({ message: "Email OTP not verified." });

//     // commented enquiry 
//     // const enquiry = await Enquiry.findOne({ email });

//     // enquiry.phone = phone;

//     // await enquiry.save();

//     const otp = generateOtp();
//     await Otp.deleteMany({ phone, type: "whatsapp" });
//     await Otp.create({
//       phone,
//       otp,
//       type: "whatsapp",
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//     });
//     console.log(otp);
//     // Try to send WhatsApp OTP, fallback to console log if service unavailable
//     try {
//       await sendWhatsappOtp(phone, otp);
//     } catch (whatsappError) {
//       console.log("WhatsApp OTP service unavailable, using console fallback");
//       console.log(`WhatsApp OTP for ${phone}: ${otp}`);
//     }
//     res.json({ message: "OTP sent to WhatsApp." });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error sending WhatsApp OTP", error: err.message });
//   }
// };

exports.registerPhone = async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone || !email)
      return res.status(400).json({ message: "Phone and email are required." });

    if (!isValidPhone(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number. Must be 10 digits." });
    }

    console.log(email);

    const emailOtp = await Otp.findOne({
      email,
      type: "email",
      verified: true,
    });
    console.log(emailOtp);

    if (!emailOtp)
      return res.status(400).json({ message: "Email OTP not verified." });

    // 🔹 Check if phone already exists in Enquiry (or replace with your User model)
    const existingUser = await Enquiry.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Phone number already exists." });
    }

    const otp = generateOtp();
    await Otp.deleteMany({ phone, type: "whatsapp" });
    await Otp.create({
      phone,
      otp,
      type: "whatsapp",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    console.log(otp);

    try {
      await sendWhatsappOtp(phone, otp);
       // otpType=reset,registration  channel = email,whatsapp
        const sent = await sendOtpViaPabbly({
          phone,
          otp,
          otpType:"registration",
          channel:"whatsapp"
        });
    } catch (whatsappError) {
      console.log("WhatsApp OTP service unavailable, using console fallback");
      console.log(`WhatsApp OTP for ${phone}: ${otp}`);
    }

    res.json({ message: "OTP sent to WhatsApp." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error sending WhatsApp OTP", error: err.message });
  }
};

// verifying the mobile otp 

exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { email,phone, otp } = req.body;

    if (!isValidOtp(otp)) {
      return res
        .status(400)
        .json({ message: "Invalid OTP format. Must be a 6-digit number." });
    }

    if (!isValidPhone(phone)) {
      return res
        .status(400)
        .json({
          message:
            "Invalid phone number. Must be 10 digits and not start with 0.",
        });
    }
    const record = await Otp.findOne({
      phone,
      otp,
      type: "whatsapp",
      expiresAt: { $gt: new Date() },
    });
    if (!record)
      return res.status(400).json({ message: "Invalid or expired OTP." });
    record.verified = true;
    await record.save();
    const enquiry = await Enquiry.findOne({ email });
    console.log(enquiry)
    enquiry.phone = phone;

    await enquiry.save();
    console.log(enquiry)

    res.json({ message: "WhatsApp OTP verified." });
    
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error verifying WhatsApp OTP", error: err.message });
  }
};


exports.registerDetails = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      country,
      language,
      instagram,
      youtube,
      followers,
      subscribers,
    } = req.body;
    if (!name || !email || !phone || !password || !role)
      return res.status(400).json({ message: "Missing required fields." });
    const emailOtp = await Otp.findOne({
      email,
      type: "email",
      verified: true,
    });
    const phoneOtp = await Otp.findOne({
      phone,
      type: "whatsapp",
      verified: true,
    });
    if (!emailOtp || !phoneOtp)
      return res.status(400).json({ message: "OTP verification required." });
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ message: "User already exists." });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role,
      country,
      language,
      instagram,
      youtube,
      followers,
      subscribers,
      status: role === "influencer" ? "pending" : "approved",
    });
    await Otp.deleteMany({ $or: [{ email }, { phone }] });
    res.json({
      message: "Registration successful. Please login.",
      userId: user._id,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
};

// login user (common for all users)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All the fields are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Wrong email or password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials." });
    // console.log(user)
    if (user.role === "influencer" && user.status === "pending")
      return res.status(403).json({ message: "Account pending approval." });
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, role: user.role, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// Dedicated influencer registration
exports.registerInfluencer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      gender,
      dob,
      location,
      language,
      termsAccepted,
    } = req.body;
    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !gender ||
      !dob ||
      !location ||
      !language
    )
      return res.status(400).json({ message: "Missing required fields." });
    if (!termsAccepted)
      return res.status(400).json({ message: "Terms must be accepted." });
    // validating the password 1 Caps 1numeric and 1 special character 
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }
    // validating the password 1 Caps 1numeric and 1 special character 
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      return res.status(400).json({
        message: "Password does not meet the criteria.",
        details: errors,
      });
    }
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords does not match" });
    const emailOtp = await Otp.findOne({
      email,
      type: "email",
      verified: true,
    });
    const phoneOtp = await Otp.findOne({
      phone,
      type: "whatsapp",
      verified: true,
    });
    if (!emailOtp || !phoneOtp)
      return res.status(400).json({ message: "OTP verification required." });
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    console.log(existing)
    if (existing)
      return res.status(400).json({ message: "User already exists." });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: fullName,
      email,
      phone,
      password: hashed,
      role: "influencer",
      gender,
      dob,
      location,
      language,
      termsAccepted,
      status: "approved",
    });
    //
    const enquiry = await Enquiry.findOneAndUpdate(
      { email },
      { status: "registered" },
      { new: true }
    );
    await Otp.deleteMany({ $or: [{ email }, { phone }] });
    res.json({
      message: "Registration successful. Please login."
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating influencer", error: err.message });
  }
};

// Dedicated brand registration
exports.registerBrand = async (req, res) => {
  try {
    const {
      fullName,
      companyName,
      businessEmail,
      phone,
      password,
      confirmPassword,
      industryType,
      location,
      termsAccepted,
    } = req.body;
    if (
      !fullName ||
      !companyName ||
      !businessEmail ||
      !phone ||
      !password ||
      !confirmPassword ||
      !industryType ||
      !location
    )
      return res.status(400).json({ message: "Missing required fields." });
    if (!termsAccepted)
      return res.status(400).json({ message: "Terms must be accepted." });
    // validating the password 1 Caps 1numeric and 1 special character 
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }
    // validating the password 1 Caps 1numeric and 1 special character 
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      return res.status(400).json({
        message: "Password does not meet the criteria.",
        details: errors,
      });
    }
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match." });
    const emailOtp = await Otp.findOne({
      email: businessEmail,
      type: "email",
      verified: true,
    });
    const phoneOtp = await Otp.findOne({
      phone,
      type: "whatsapp",
      verified: true,
    });
    if (!emailOtp || !phoneOtp)
      return res.status(400).json({ message: "OTP verification required." });
    const existing = await User.findOne({
      $or: [{ email: businessEmail }, { phone }],
    });
    if (existing)
      return res.status(400).json({ message: "User already exists." });
    const hashed = await bcrypt.hash(password, 10);
    const enquiry = await Enquiry.findOneAndUpdate(
      { email:businessEmail },
      { status: "registered" },
      { new: true }
    );
    const user = await User.create({
      name: fullName,
      companyName,
      email:businessEmail,
      phone,
      password: hashed,
      role: "brand",
      industryType,
      location,
      termsAccepted,
      status: "approved",
    });
    await Otp.deleteMany({ $or: [{ email:businessEmail }, { phone }] });
    res.json({
      message: "Registration successful. Please login.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating brand", error: err.message });
  }
};

// Dedicated agency registration

exports.registerAgency = async (req, res) => {
  try {
    const {
      fullName,
      companyName,
      businessEmail,
      phone,
      password,
      confirmPassword,
      location,
      termsAccepted,
    } = req.body;
    console.log(req.body)
    if (
      !fullName ||
      !companyName ||
      !businessEmail ||
      !phone ||
      !password ||
      !confirmPassword ||
      !location
    )
      return res.status(400).json({ message: "Missing required fields." });
    if (!termsAccepted)
      return res.status(400).json({ message: "Terms must be accepted." });
    // validating the password 1 Caps 1numeric and 1 special character 
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }
    // validating the password 1 Caps 1numeric and 1 special character 
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      return res.status(400).json({
        message: "Password does not meet the criteria.",
        details: errors,
      });
    }
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match." });
    const emailOtp = await Otp.findOne({
      email: businessEmail,
      type: "email",
      verified: true,
    });
    const phoneOtp = await Otp.findOne({
      phone,
      type: "whatsapp",
      verified: true,
    });
    if (!emailOtp || !phoneOtp)
      return res.status(400).json({ message: "OTP verification required." });
    const existing = await User.findOne({
      $or: [{ email: businessEmail }, { phone }],
    });
    if (existing)
      return res.status(400).json({ message: "User already exists." });
    const hashed = await bcrypt.hash(password, 10);
    const enquiry = await Enquiry.findOneAndUpdate(
      { email:businessEmail },
      { status: "registered" },
      { new: true }
    );
    const user = await User.create({
      name: fullName,
      companyName,
      email: businessEmail,
      phone,
      password: hashed,
      role: "agency",
      location,
      termsAccepted,
      status: "approved",
    });
    await Otp.deleteMany({ $or: [{ email: businessEmail }, { phone }] });
    res.json({
      message: "Registration successful. Please login.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating agency", error: err.message });
  }
};

//forgot password (To send otp)

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });
    if (!isEmailValid(email)) {
      return res.status(400).json({ message: "Invalid email format. || invalid email id" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not exists enter valid email.not found." }); // need to check the message

    const otp = generateOtp();
    await Otp.deleteMany({ email, type: "reset" });
    await Otp.create({
      email,
      otp,
      type: "reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    console.log(otp);
    // await sendEmailOtp(email, otp);
    // For forgot password email
    await sendEmailOtp(user.email, otp, 'reset');
    // otpType=reset,registration  channel = email,whatsapp
      const sent = await sendOtpViaPabbly({
        email,
        otp,
        otpType:"reset",
        channel:"email"
      });
    res.json({ message: "Password reset OTP sent to your email." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error sending reset OTP", error: err.message });
  }
};
//forgot password (To verify otp and update password)

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    // validating the mail 
    if (!isEmailValid(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    // validating the otp
    if (!isValidOtp(otp)) {
      return res
        .status(400)
        .json({ message: "Invalid OTP format. It must be a 6-digit number." });
    }
    // vaidating the password 1 Caps 1numeric and 1 special character 
    // console.log(isValidPassword(password))
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }
    // validating the password 1 Caps 1numeric and 1 special character 
    const { isValid, errors } = validatePassword(newPassword);
    if (!isValid) {
      return res.status(400).json({
        message: "Password does not meet the criteria.",
        details: errors,
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    const record = await Otp.findOne({
      email,
      otp,
      type: "reset",
      expiresAt: { $gt: new Date() },
    });
    if (!record)
      return res.status(400).json({ message: "Invalid or expired OTP." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { $set: { password: hashed } });
    await Otp.deleteMany({ email, type: "reset" });
    res.json({
      message: "Password has been reset. Please login with your new password.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: err.message });
  }
};


