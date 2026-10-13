const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const User = require('../models/User');
const Room = require('../models/Room');

// @desc    Create a new student record (Admin/Warden only)
// @route   POST /api/students
// @access  Private/Admin/Warden
const createStudent = asyncHandler(async (req, res) => {
  const {
    userId, studentId, fatherName, motherName, dateOfBirth,
    gender, bloodGroup, department, year, semester, cgpa,
    permanentAddress, guardianContact, roomId, admissionDate, status
  } = req.body;

  // Check if userId exists in User model
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found. Please register the user first.'
    });
  }

  // Check if student record already exists for this user
  const existingStudent = await Student.findOne({ userId });
  if (existingStudent) {
    return res.status(400).json({
      success: false,
      message: 'Student record already exists for this user.'
    });
  }

  // Check if studentId is unique
  const existingStudentId = await Student.findOne({ studentId });
  if (existingStudentId) {
    return res.status(400).json({
      success: false,
      message: 'This Student ID is already assigned.'
    });
  }

  // If roomId provided, validate room availability
  if (roomId) {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }
    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is full. Capacity: ${room.capacity}/${room.currentOccupancy}`
      });
    }
  }

  // Create student
  const student = await Student.create({
    userId,
    studentId,
    fatherName,
    motherName,
    dateOfBirth,
    gender,
    bloodGroup,
    department,
    year,
    semester,
    cgpa,
    permanentAddress,
    guardianContact,
    roomId: roomId || null,
    admissionDate: admissionDate || Date.now(),
    status: status || 'active'
  });

  // If room assigned, update room occupancy
  if (roomId) {
    const room = await Room.findById(roomId);
    room.occupants.push(student._id);
    room.currentOccupancy += 1;
    await room.save();
  }

  // Populate user info and room info
  const populatedStudent = await Student.findById(student._id)
    .populate('userId', 'fullName email phone role avatar')
    .populate('roomId', 'roomNumber floor block type capacity');

  res.status(201).json({
    success: true,
    message: 'Student record created successfully!',
    data: populatedStudent
  });
});

// @desc    Get all students with search, filter, pagination
// @route   GET /api/students
// @access  Private/Admin/Warden
const getAllStudents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter query
  const filter = {};

  // Search by name or student ID
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    // We need to search in User model for name, so we'll handle this differently
    filter.$or = [
      { studentId: searchRegex },
      { department: searchRegex },
      { fatherName: searchRegex }
    ];
  }

  // Filter by department
  if (req.query.department) {
    filter.department = req.query.department;
  }

  // Filter by year
  if (req.query.year) {
    filter.year = parseInt(req.query.year);
  }

  // Filter by gender
  if (req.query.gender) {
    filter.gender = req.query.gender;
  }

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by block
  if (req.query.block) {
    // This requires room population, handled after query
  }

  // Sort options
  const sortOptions = {};
  if (req.query.sortBy) {
    const sortField = req.query.sortBy;
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    sortOptions[sortField] = sortOrder;
  } else {
    sortOptions.createdAt = -1;
  }

  const totalStudents = await Student.countDocuments(filter);
  const students = await Student.find(filter)
    .populate('userId', 'fullName email phone role avatar isActive')
    .populate('roomId', 'roomNumber floor block type')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  // Calculate statistics
  const stats = {
    total: totalStudents,
    active: await Student.countDocuments({ status: 'active' }),
    inactive: await Student.countDocuments({ status: 'inactive' }),
    graduated: await Student.countDocuments({ status: 'graduated' }),
    male: await Student.countDocuments({ gender: 'Male' }),
    female: await Student.countDocuments({ gender: 'Female' })
  };

  res.status(200).json({
    success: true,
    count: students.length,
    total: totalStudents,
    pages: Math.ceil(totalStudents / limit),
    currentPage: page,
    stats,
    data: students
  });
});

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('userId', 'fullName email phone role avatar isActive lastLogin')
    .populate('roomId', 'roomNumber floor block type capacity currentOccupancy amenities')
    .populate({
      path: 'roomId',
      populate: {
        path: 'occupants',
        select: 'studentId',
        populate: { path: 'userId', select: 'fullName' }
      }
    });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Students can only view their own profile unless admin/warden
  if (
    req.user.role === 'student' &&
    student.userId._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'You can only view your own profile.'
    });
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Get student by user ID (for logged-in student)
// @route   GET /api/students/me
// @access  Private
const getMyStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id })
    .populate('userId', 'fullName email phone role avatar')
    .populate('roomId', 'roomNumber floor block type amenities');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found. Contact admin.'
    });
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Update student record
// @route   PUT /api/students/:id
// @access  Private/Admin/Warden
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Fields that can be updated
  const allowedFields = [
    'fatherName', 'motherName', 'dateOfBirth', 'gender',
    'bloodGroup', 'department', 'year', 'semester', 'cgpa',
    'permanentAddress', 'guardianContact', 'status', 'documents'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      student[field] = req.body[field];
    }
  });

  const updatedStudent = await student.save();
  const populatedStudent = await Student.findById(updatedStudent._id)
    .populate('userId', 'fullName email phone role avatar')
    .populate('roomId', 'roomNumber floor block type');

  res.status(200).json({
    success: true,
    message: 'Student record updated successfully',
    data: populatedStudent
  });
});

// @desc    Allocate room to student
// @route   PUT /api/students/:id/allocate-room
// @access  Private/Admin/Warden
const allocateRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  if (room.currentOccupancy >= room.capacity) {
    return res.status(400).json({
      success: false,
      message: `Room ${room.roomNumber} is full (${room.currentOccupancy}/${room.capacity})`
    });
  }

  // If student already has a room, remove from old room
  if (student.roomId) {
    const oldRoom = await Room.findById(student.roomId);
    if (oldRoom) {
      oldRoom.occupants = oldRoom.occupants.filter(
        id => id.toString() !== student._id.toString()
      );
      oldRoom.currentOccupancy = Math.max(0, oldRoom.currentOccupancy - 1);
      await oldRoom.save();
    }
  }

  // Assign new room
  student.roomId = roomId;
  await student.save();

  room.occupants.push(student._id);
  room.currentOccupancy += 1;
  await room.save();

  const populatedStudent = await Student.findById(student._id)
    .populate('userId', 'fullName email')
    .populate('roomId', 'roomNumber floor block type capacity');

  res.status(200).json({
    success: true,
    message: `Student allocated to Room ${room.roomNumber} successfully`,
    data: populatedStudent
  });
});

// @desc    Remove student from room
// @route   PUT /api/students/:id/vacate-room
// @access  Private/Admin/Warden
const vacateRoom = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  if (!student.roomId) {
    return res.status(400).json({
      success: false,
      message: 'Student is not allocated to any room'
    });
  }

  const room = await Room.findById(student.roomId);
  if (room) {
    room.occupants = room.occupants.filter(
      id => id.toString() !== student._id.toString()
    );
    room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
    await room.save();
  }

  student.roomId = null;
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Student vacated from room successfully',
    data: { studentId: student.studentId, roomId: null }
  });
});

// @desc    Delete student record
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Remove from room if allocated
  if (student.roomId) {
    const room = await Room.findById(student.roomId);
    if (room) {
      room.occupants = room.occupants.filter(
        id => id.toString() !== student._id.toString()
      );
      room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
      await room.save();
    }
  }

  const studentName = student.studentId;
  await Student.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: `Student ${studentName} record deleted successfully`
  });
});

// @desc    Get department-wise student count
// @route   GET /api/students/stats/departments
// @access  Private/Admin/Warden
const getDepartmentStats = asyncHandler(async (req, res) => {
  const stats = await Student.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  getMyStudentProfile,
  updateStudent,
  allocateRoom,
  vacateRoom,
  deleteStudent,
  getDepartmentStats
};
