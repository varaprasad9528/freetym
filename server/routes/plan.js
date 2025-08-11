const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const planController = require('../controllers/planController');

router.post('/', auth(['admin']), planController.createPlan);
router.get('/', auth(['admin']), planController.getPlans);
router.get('/:id', auth(['admin']), planController.getPlanById);
router.put('/:id', auth(['admin']), planController.updatePlan);
router.delete('/:id', auth(['admin']), planController.deletePlan);

module.exports = router; 