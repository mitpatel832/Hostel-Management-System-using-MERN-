const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const Room = require('../models/Room');

// @desc    Register a new complaint (Student only)
// @route   POST /api/complaints
// @access  Private/Student
const createComplaint = asyncHandler(async (req, res) => {
  const { category, priority, subject, description, images } = req.body;

  // Find the student profile corresponding to the logged in user
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found. Only registered students can raise complaints.'
    });
  }

  const complaint = await Complaint.create({
    studentId: student._id,
    roomId: student.roomId || null,
    category,
    priority: priority || 'medium',
    subject,
    description,
    images: images || [],
    status: 'pending'
  });

  const populatedComplaint = await Complaint.findById(complaint._id)
    .populate({
      path: 'studentId',
      select: 'studentId department year',
      populate: { path: 'userId', select: 'fullName email phone' }
    })
    .populate('roomId', 'roomNumber block floor');

  res.status(201).json({
    success: true,
    message: 'Complaint registered successfully! Our team will inspect it shortly.',
    data: populatedComplaint
  });
});

// @desc    Get all complaints with advanced filters & pagination (Admin/Warden)
// @route   GET /api/complaints
// @access  Private/Admin/Warden
const getAllComplaints = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build dynamic filter
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  if (req.query.assignedTo) {
    filter.assignedTo = req.query.assignedTo;
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { subject: searchRegex },
      { description: searchRegex }
    ];
  }

  // Sort order
  let sort = { createdAt: -1 };
  if (req.query.sortBy) {
    const order = req.query.sortOrder === 'asc' ? 1 : -1;
    sort = { [req.query.sortBy]: order };
  }

  const totalComplaints = await Complaint.countDocuments(filter);
  const complaints = await Complaint.find(filter)
    .populate({
      path: 'studentId',
      select: 'studentId department year',
      populate: { path: 'userId', select: 'fullName email phone avatar' }
    })
    .populate('roomId', 'roomNumber block floor')
    .populate('assignedTo', 'fullName email phone role')
    .populate('resolution.resolvedBy', 'fullName email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: complaints.length,
    total: totalComplaints,
    pages: Math.ceil(totalComplaints / limit),
    currentPage: page,
    data: complaints
  });
});

// @desc    Get complaints submitted by the logged-in student
// @route   GET /api/complaints/my
// @access  Private/Student
const getMyComplaints = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found.'
    });
  }

  const complaints = await Complaint.find({ studentId: student._id })
    .populate('roomId', 'roomNumber block floor')
    .populate('assignedTo', 'fullName phone role')
    .populate('resolution.resolvedBy', 'fullName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints
  });
});

// @desc    Get single complaint details
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate({
      path: 'studentId',
      select: 'studentId department year permanentAddress guardianContact',
      populate: { path: 'userId', select: 'fullName email phone avatar' }
    })
    .populate('roomId', 'roomNumber block floor type')
    .populate('assignedTo', 'fullName email phone role')
    .populate('resolution.resolvedBy', 'fullName email role');

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint ticket not found'
    });
  }

  // Authorization check: student can only view their own complaint
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || complaint.studentId._id.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this complaint ticket.'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: complaint
  });
});

// @desc    Update complaint status & resolution details (Admin/Warden)
// @route   PUT /api/complaints/:id/status
// @access  Private/Admin/Warden
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint ticket not found'
    });
  }

  const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Choose from: ${validStatuses.join(', ')}`
    });
  }

  complaint.status = status;

  if (status === 'resolved' || status === 'closed') {
    complaint.resolution = {
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      remarks: remarks || 'Resolved by management'
    };
  } else if (remarks) {
    complaint.resolution = {
      ...complaint.resolution,
      remarks
    };
  }

  await complaint.save();

  const updated = await Complaint.findById(complaint._id)
    .populate('assignedTo', 'fullName email phone')
    .populate('resolution.resolvedBy', 'fullName email');

  res.status(200).json({
    success: true,
    message: `Complaint ticket status changed to '${status}'`,
    data: updated
  });
});

// @desc    Assign complaint to maintenance staff or warden
// @route   PUT /api/complaints/:id/assign
// @access  Private/Admin/Warden
const assignComplaint = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint ticket not found'
    });
  }

  complaint.assignedTo = assignedTo;
  if (complaint.status === 'pending') {
    complaint.status = 'in-progress';
  }

  await complaint.save();

  const updated = await Complaint.findById(complaint._id)
    .populate('assignedTo', 'fullName email phone role');

  res.status(200).json({
    success: true,
    message: 'Complaint assigned successfully and marked in-progress',
    data: updated
  });
});

// @desc    Submit feedback/rating after resolution (Student only)
// @route   POST /api/complaints/:id/feedback
// @access  Private/Student
const submitComplaintFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint ticket not found'
    });
  }

  const student = await Student.findOne({ userId: req.user._id });
  if (!student || complaint.studentId.toString() !== student._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only leave feedback on your own complaints.'
    });
  }

  if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
    return res.status(400).json({
      success: false,
      message: 'Feedback can only be submitted once the complaint is resolved or closed.'
    });
  }

  complaint.feedback = {
    rating: Number(rating),
    comment,
    submittedAt: new Date()
  };

  await complaint.save();

  res.status(200).json({
    success: true,
    message: 'Thank you for your feedback!',
    data: complaint.feedback
  });
});

// @desc    Delete complaint ticket
// @route   DELETE /api/complaints/:id
// @access  Private/Admin (or Student if status is pending)
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint ticket not found'
    });
  }

  // Student can only delete if it is still pending
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || complaint.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized.'
      });
    }
    if (complaint.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a complaint that is already in progress or resolved.'
      });
    }
  }

  await Complaint.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Complaint ticket deleted successfully'
  });
});

// @desc    Get complaint analytics and category breakdown
// @route   GET /api/complaints/stats/overview
// @access  Private/Admin/Warden
const getComplaintStats = asyncHandler(async (req, res) => {
  const totalComplaints = await Complaint.countDocuments();
  const pendingCount = await Complaint.countDocuments({ status: 'pending' });
  const inProgressCount = await Complaint.countDocuments({ status: 'in-progress' });
  const resolvedCount = await Complaint.countDocuments({ status: 'resolved' });
  const rejectedCount = await Complaint.countDocuments({ status: 'rejected' });
  const closedCount = await Complaint.countDocuments({ status: 'closed' });

  // Priority distribution
  const priorityStats = await Complaint.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  // Category distribution
  const categoryStats = await Complaint.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Average student satisfaction rating
  const ratingStats = await Complaint.aggregate([
    { $match: { 'feedback.rating': { $exists: true, $ne: null } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$feedback.rating' },
        totalFeedbacks: { $sum: 1 }
      }
    }
  ]);

  const resolutionRate = totalComplaints > 0
    ? Math.round(((resolvedCount + closedCount) / totalComplaints) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      summary: {
        total: totalComplaints,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
        closed: closedCount,
        resolutionRate: `${resolutionRate}%`
      },
      averageRating: ratingStats[0] ? Number(ratingStats[0].averageRating.toFixed(1)) : 5.0,
      totalFeedbacks: ratingStats[0] ? ratingStats[0].totalFeedbacks : 0,
      priorityDistribution: priorityStats,
      categoryBreakdown: categoryStats
    }
  });
});

module.exports = {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  submitComplaintFeedback,
  deleteComplaint,
  getComplaintStats
};
