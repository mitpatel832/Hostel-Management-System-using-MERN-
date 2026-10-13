const express = require('express');
const router = express.Router();
const {
  createFee,
  getAllFees,
  getMyFees,
  getFeeById,
  recordPayment,
  applyFine,
  waiveFee,
  deleteFee,
  getFeeStats
} = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrWarden, isStudent } = require('../middleware/roleMiddleware');

// Analytics overview
router.get('/stats/overview', protect, isAdminOrWarden, getFeeStats);

// Student fee dues & history
router.get('/my', protect, isStudent, getMyFees);

// Core CRUD & Invoicing
router.route('/')
  .post(protect, isAdminOrWarden, createFee)
  .get(protect, isAdminOrWarden, getAllFees);

router.route('/:id')
  .get(protect, getFeeById)
  .delete(protect, isAdmin, deleteFee);

// Payment processing & modifications
router.put('/:id/pay', protect, recordPayment);
router.put('/:id/fine', protect, isAdminOrWarden, applyFine);
router.put('/:id/waive', protect, isAdmin, waiveFee);

module.exports = router;
