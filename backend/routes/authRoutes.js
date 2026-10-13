const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { isWarden } = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, isWarden, getAllUsers);
router.put('/users/:id/toggle-status', protect, isWarden, toggleUserStatus);

module.exports = router;
