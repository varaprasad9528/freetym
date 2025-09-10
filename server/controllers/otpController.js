const Otp = require('../models/Otp');
const { sendOtpViaPabbly } = require('../utils/otpSender');
const sendEmailOtp = require('../utils/sendEmailOtp');
// const { sendOtpViaPabbly } = require('./otpSender');
// const =require('../utils/otpSender')
const sendWhatsappOtp = require('../utils/sendWhatsappOtp');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
const disposableEmailDomains = [
  '10minutemail.com',
  'tempmail.com',
  'mailinator.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
  'throwawaymail.com',
  'getnada.com',
  'moakt.com',
  'maildrop.cc',
  'dispostable.com',
  'fakeinbox.com',
  'emailondeck.com',
  'spambog.com',
  'mintemail.com',
  'temporarymail.com',
  'tmail.io',
  'sharklasers.com',
  'spamgourmet.com',
  'spam4.me',
];
const isBlockedEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
};
function isEmailValid(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
function isValidOtp(otp) {
  const otpRegex = /^\d{6}$/; 
  return otpRegex.test(otp);
}
function isValidPhone(phone) {
  const phoneRegex = /^(?:\+91)?[1-9]\d{9}$/;
  return phoneRegex.test(phone);
}
exports.sendEmailOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required.' });
  if (!isEmailValid(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (isBlockedEmail(email)) {
      return res.status(400).json({ message: 'Disposable email addresses are not allowed.' });
    }
  const otp = generateOtp();
  await Otp.deleteMany({ email, type: 'email' });
  await Otp.create({ email, otp, type: 'email', expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  // sendOtpViaPabbly
  // otpType=reset,registration  channel = email,whatsapp
  await sendEmailOtp(email, otp);
  // otpType=reset,registration  channel = email,whatsapp
  const sent = await sendOtpViaPabbly({
    email,
    phone,
    otp,
    otpType,
    channel:"email"
  });

  if (sent) {
    res.status(200).json({ message: 'OTP sent successfully', otp }); // Don't send OTP in prod!
  } else {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
  res.json({ message: 'OTP sent to email.' });
};

exports.sendWhatsappOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone required.' });
  if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits and not start with 0.' });
    }
  const otp = generateOtp();
  await Otp.deleteMany({ phone, type: 'whatsapp' });
  await Otp.create({ phone, otp, type: 'whatsapp', expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  // await sendWhatsappOtp(phone, otp);
  // otpType=reset,registration  channel = email,whatsapp
  const sent = await sendOtpViaPabbly({
    phone,
    otp,
    otpType:"verification",
    channel:"whatsapp"
  });
  console.log(otp)
  res.json({ message: 'OTP sent to WhatsApp.' });
};

exports.verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!isEmailValid(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
  if (!isValidOtp(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format. Must be a 6-digit number.' });
    }
  const record = await Otp.findOne({ email, otp, type: 'email', expiresAt: { $gt: new Date() } });
  if (!record) return res.status(400).json({ message: 'Invalid or expired OTP.' });
  record.verified = true;
  await record.save();
  res.json({ message: 'Email OTP verified.' });
};

exports.verifyWhatsappOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits and not start with 0.' });
    }
  if (!isValidOtp(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format. Must be a 6-digit number.' });
    }
  const record = await Otp.findOne({ phone, otp, type: 'whatsapp', expiresAt: { $gt: new Date() } });
  if (!record) return res.status(400).json({ message: 'Invalid or expired OTP.' });
  record.verified = true;
  await record.save();
  res.json({ message: 'WhatsApp OTP verified.' });
}; 