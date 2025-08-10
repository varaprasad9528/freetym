const User = require('../models/User');
const DemoRequest = require('../models/DemoRequest');
const transporter = require('../config/mailer');
// const logger = require('../utils/logger');
// const transporter = require('../utils/transporter');
const dotenv = require('dotenv');
dotenv.config();
// Public search endpoint
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
function isValidPhone(phone) {
  const phoneRegex = /^(?:\+91)?[1-9]\d{9}$/;
  return phoneRegex.test(phone);
}

exports.searchInfluencers = async (req, res) => {
  try {
    const { platform, query, limit = 5 } = req.query;
    
    // Build filter
    const filter = { 
      role: 'influencer', 
      status: 'approved' 
    };
    
    if (platform) {
      filter.platform = platform;
    }
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { instagram: { $regex: query, $options: 'i' } },
        { youtube: { $regex: query, $options: 'i' } }
      ];
    }
    
    const influencers = await User.find(filter)
      .select('name instagram youtube followers subscribers category platform location')
      .limit(parseInt(limit))
      .sort({ followers: -1 });
    
    const formattedResults = influencers.map(influencer => ({
      name: influencer.name,
      handle: influencer.instagram || influencer.youtube,
      followerCount: influencer.followers || influencer.subscribers,
      categories: influencer.category ? [influencer.category] : [],
      thumbnail: null, // Will be populated when social media integration is complete
      platform: influencer.platform,
      location: influencer.location
    }));
    
    res.json({
      success: true,
      data: formattedResults,
      count: formattedResults.length
    });
    
  } catch (error) {
    // logger.error('Public search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching influencers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


exports.submitDemoRequest = async (req, res) => {
  try {
    const { name, email, phone, company, role, message } = req.body;

  
    if (!name || !email || !phone ) {
      if(!name){
      return res.status(400).json({ success: false, message: 'Name is required' });
      }
      if(!email){
      return res.status(400).json({ success: false, message: 'Email is required' });
      }
      if(!phone){
      return res.status(400).json({ success: false, message: 'phone number is required' });
      }
    }
    if (isBlockedEmail(email)) {
      return res.status(400).json({ message: 'Disposable email addresses are not allowed.' });
    }
    if (!isEmailValid(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (!isValidPhone(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number. Must be 10 digits." });
    }
    const demoRequest = new DemoRequest({ name, email, phone, company, role, message });
    await demoRequest.save();
    console.log(demoRequest)
    
    const adminEmail = process.env.ADMIN_EMAIL  || "varaprasad.v@nybinfotech.com" 
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `New Demo Request from ${name}`,
      html: `
        <h2>New Demo Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Message:</strong><br>${message}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      `
    };
    try {
      await transporter.sendMail(mailOptions);
      // logger && logger.info(`Demo request email sent to admin from ${email}`);
    } catch (err) {
      // logger && logger.error('Error sending email:', err);
    }

    return res.status(201).json({
      success: true,
      message: 'Demo request submitted successfully. We will contact you soon!',
      data: {
        id: demoRequest._id,
        submittedAt: demoRequest.createdAt
      }
    });

  } catch (error) {
    // logger && logger.error('Demo request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting demo request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
