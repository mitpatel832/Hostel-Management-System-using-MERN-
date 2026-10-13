const express = require('express');
const router = express.Router();
const {
  createRoom,
  getAllRooms,
  getRoomById,
  getAvailableRooms,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  getRoomStats
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrWarden } = require('../middleware/roleMiddleware');

// Publicly authenticated queries (both students and admins can view available rooms)
router.get('/available', protect, getAvailableRooms);
router.get('/stats/overview', protect, isAdminOrWarden, getRoomStats);

// Main Room CRUD routes
router.route('/')
  .post(protect, isAdminOrWarden, createRoom)
  .get(protect, getAllRooms);

router.route('/:id')
  .get(protect, getRoomById)
  .put(protect, isAdminOrWarden, updateRoom)
  .delete(protect, isAdmin, deleteRoom);

router.put('/:id/status', protect, isAdminOrWarden, updateRoomStatus);

module.exports = router;
