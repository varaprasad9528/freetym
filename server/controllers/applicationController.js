const Application = require('../models/Application');
const Campaign = require('../models/Campaign');

exports.applyToCampaign = async (req, res) => {
  const exists = await Application.findOne({ influencer: req.user.userId, campaign: req.params.campaignId });
  if (exists) return res.status(400).json({ message: 'Already applied.' });
  const app = await Application.create({ influencer: req.user.userId, campaign: req.params.campaignId });
  await Campaign.findByIdAndUpdate(req.params.campaignId, { $push: { applications: app._id } });
  res.status(201).json(app);
};

exports.getMyApplications = async (req, res) => {
  const apps = await Application.find({ influencer: req.user.userId }).populate('campaign');
  res.json(apps);
};

exports.getCampaignApplications = async (req, res) => {
  const apps = await Application.find({ campaign: req.params.campaignId }).populate('influencer');
  res.json(apps);
};

exports.updateApplicationStatus = async (req, res) => {
  const { status } = req.body; // accepted/rejected
  const app = await Application.findByIdAndUpdate(req.params.applicationId, { status, decisionAt: new Date() }, { new: true });
  if (!app) return res.status(404).json({ message: 'Application not found.' });
  res.json(app);
};

exports.getAllApplications = async (req, res) => {
  const apps = await Application.find().populate('influencer campaign');
  res.json(apps);
}; 