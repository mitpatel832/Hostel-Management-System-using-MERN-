const express = require('express');
const router = express.Router();
const {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  togglePinNotice,
  archiveNotice,
  deleteNotice,
  getNoticeStats
} = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrWarden } = require('../middleware/roleMiddleware');

// Analytics
router.get('/stats/overview', protect, isAdminOrWarden, getNoticeStats);

// Core CRUD
router.route('/')
  .post(protect, isAdminOrWarden, createNotice)
  .get(protect, getAllNotices);

router.route('/:id')
  .get(protect, getNoticeById)
  .put(protect, isAdminOrWarden, updateNotice)
  .delete(protect, isAdmin, deleteNotice);

// Quick actions
router.put('/:id/pin', protect, isAdminOrWarden, togglePinNotice);
router.put('/:id/archive', protect, isAdminOrWarden, archiveNotice);

module.exports = router;
