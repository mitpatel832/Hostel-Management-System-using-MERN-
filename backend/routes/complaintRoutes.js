const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  submitComplaintFeedback,
  deleteComplaint,
  getComplaintStats
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { isAdminOrWarden, isStudent } = require('../middleware/roleMiddleware');

// Analytics overview
router.get('/stats/overview', protect, isAdminOrWarden, getComplaintStats);

// Student specific routes
router.get('/my', protect, isStudent, getMyComplaints);
router.post('/:id/feedback', protect, isStudent, submitComplaintFeedback);

// Core CRUD routes
router.route('/')
  .post(protect, isStudent, createComplaint)
  .get(protect, isAdminOrWarden, getAllComplaints);

router.route('/:id')
  .get(protect, getComplaintById)
  .delete(protect, deleteComplaint);

// Admin / Warden workflows
router.put('/:id/status', protect, isAdminOrWarden, updateComplaintStatus);
router.put('/:id/assign', protect, isAdminOrWarden, assignComplaint);

module.exports = router;
