const mongoose = require('mongoose');

const demoRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['brand', 'influencer', 'other'], 
    required: true 
  },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'contacted', 'completed'], 
    default: 'pending' 
  },
  adminNotes: { type: String },
  contactedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('DemoRequest', demoRequestSchema); 