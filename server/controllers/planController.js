const Plan = require('../models/Plan');

exports.createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ message: 'Error creating plan', error: err.message });
  }
};

exports.getPlans = async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
};

exports.getPlanById = async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found.' });
  res.json(plan);
};

exports.updatePlan = async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) return res.status(404).json({ message: 'Plan not found.' });
  res.json(plan);
};

exports.deletePlan = async (req, res) => {
  const plan = await Plan.findByIdAndDelete(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found.' });
  res.json({ message: 'Plan deleted.' });
}; 