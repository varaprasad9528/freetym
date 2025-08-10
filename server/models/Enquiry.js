const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true, required: true },
  phone: { type: String, trim: true },
  role: {
    type: String,
    enum: ['influencer', 'brand', 'agency'],
    default: 'influencer'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'converted', 'not_interested', 'registered'],
    default: 'new'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enquiry', enquirySchema);
