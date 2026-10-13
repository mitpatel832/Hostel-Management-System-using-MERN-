const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
  getMyStudentProfile,
  updateStudent,
  allocateRoom,
  vacateRoom,
  deleteStudent,
  getDepartmentStats
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isWarden, isAdminOrWarden, isStudent } = require('../middleware/roleMiddleware');

// Student can view own profile
router.get('/me', protect, getMyStudentProfile);

// Admin/Warden routes
router.post('/', protect, isAdminOrWarden, createStudent);
router.get('/', protect, isAdminOrWarden, getAllStudents);
router.get('/stats/departments', protect, isAdminOrWarden, getDepartmentStats);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, isAdminOrWarden, updateStudent);
router.put('/:id/allocate-room', protect, isAdminOrWarden, allocateRoom);
router.put('/:id/vacate-room', protect, isAdminOrWarden, vacateRoom);
router.delete('/:id', protect, isAdmin, deleteStudent);

module.exports = router;
