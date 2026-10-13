const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getWardenDashboardStats,
  getStudentDashboardStats,
  getQuickStats,
  getRecentActivities
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { isAdminOrWarden, isStudent } = require('../middleware/roleMiddleware');

router.get('/admin', protect, isAdminOrWarden, getAdminDashboardStats);
router.get('/warden', protect, isAdminOrWarden, getWardenDashboardStats);
router.get('/stats', protect, isAdminOrWarden, getWardenDashboardStats);
router.get('/student', protect, isStudent, getStudentDashboardStats);
router.get('/quick-stats', protect, getQuickStats);
router.get('/recent-activities', protect, isAdminOrWarden, getRecentActivities);

module.exports = router;

