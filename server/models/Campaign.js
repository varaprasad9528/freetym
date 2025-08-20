const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brandName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  budget: { type: Number },
  targetAudience: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  
  influencers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['applied', 'approved', 'rejected', 'completed'],
      default: 'applied'
    },
    phases: {
      planning: { 
        tasks: [{ type: String }], 
        completed: { type: Boolean, default: false } 
      },
      ongoing: { 
        startDate: { type: Date },
        endDate: { type: Date }
      },
      completed: { 
        deliverables: [{ type: String }],
        completedAt: { type: Date }
      }
    },
    appliedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    completedAt: { type: Date }
  }],
  
  requirements: {
    industries: [{ type: String }],  
    minFollowers: { type: Number },
    maxFollowers: { type: Number },
    
    
    socialMedia: {
      platforms: [ {type: String}],
      region: { type: String },  
    },
    
    deliverables: [{ type: String }]
  }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;
