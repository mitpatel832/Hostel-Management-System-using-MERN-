const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Fee = require('../models/Fee');
const Notice = require('../models/Notice');

// @desc    Get complete Master Dashboard statistics for Admin/Warden
// @route   GET /api/dashboard/admin
// @access  Private/Admin/Warden
const getAdminDashboardStats = asyncHandler(async (req, res) => {
  // 1. Parallel counts for ultra-fast performance
  const [
    totalStudents,
    activeStudents,
    totalRooms,
    availableRooms,
    fullRooms,
    maintenanceRooms,
    pendingComplaints,
    inProgressComplaints,
    resolvedComplaints,
    activeNotices
  ] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ status: 'active' }),
    Room.countDocuments(),
    Room.countDocuments({ status: 'available' }),
    Room.countDocuments({ status: 'full' }),
    Room.countDocuments({ status: 'maintenance' }),
    Complaint.countDocuments({ status: 'pending' }),
    Complaint.countDocuments({ status: 'in-progress' }),
    Complaint.countDocuments({ status: 'resolved' }),
    Notice.countDocuments({ isActive: true })
  ]);

  // 2. Bed capacity & Occupancy calculation
  const roomCapacityAgg = await Room.aggregate([
    {
      $group: {
        _id: null,
        totalCapacity: { $sum: '$capacity' },
        totalOccupied: { $sum: '$currentOccupancy' },
        expectedMonthlyRent: { $sum: '$rentPerMonth' }
      }
    }
  ]);
  const capData = roomCapacityAgg[0] || { totalCapacity: 0, totalOccupied: 0, expectedMonthlyRent: 0 };
  const occupancyPercentage = capData.totalCapacity > 0
    ? Math.round((capData.totalOccupied / capData.totalCapacity) * 100)
    : 0;

  // 3. Financial Revenue Aggregation
  const feeRevenueAgg = await Fee.aggregate([
    {
      $group: {
        _id: '$status',
        totalAmount: { $sum: '$amount' },
        totalFine: { $sum: { $ifNull: ['$fine.amount', 0] } },
        count: { $sum: 1 }
      }
    }
  ]);

  let totalCollected = 0;
  let totalPendingDues = 0;
  let totalOverdue = 0;

  feeRevenueAgg.forEach(f => {
    const sum = f.totalAmount + f.totalFine;
    if (f._id === 'paid') totalCollected += sum;
    if (f._id === 'pending') totalPendingDues += sum;
    if (f._id === 'overdue') {
      totalPendingDues += sum;
      totalOverdue += sum;
    }
  });

  // 4. Block-wise Room Distribution
  const blockDistribution = await Room.aggregate([
    {
      $group: {
        _id: '$block',
        rooms: { $sum: 1 },
        capacity: { $sum: '$capacity' },
        occupied: { $sum: '$currentOccupancy' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 5. Recent Complaints (Last 5)
  const recentComplaints = await Complaint.find()
    .populate({
      path: 'studentId',
      select: 'studentId',
      populate: { path: 'userId', select: 'fullName avatar' }
    })
    .populate('roomId', 'roomNumber block')
    .sort({ createdAt: -1 })
    .limit(5);

  // 6. Recent Payments (Last 5)
  const recentPayments = await Fee.find({ status: 'paid' })
    .populate({
      path: 'studentId',
      select: 'studentId',
      populate: { path: 'userId', select: 'fullName' }
    })
    .sort({ paidDate: -1 })
    .limit(5);

  // 7. Recent Notices (Last 4)
  const recentNotices = await Notice.find({ isActive: true })
    .populate('author', 'fullName role')
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(4);

  // 8. Department distribution for students
  const departmentBreakdown = await Student.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 6 }
  ]);

  // Compute top-level summary counts for Warden console
  const openTicketsCount = pendingComplaints + inProgressComplaints;
  const pendingFeesCount = feeRevenueAgg
    .filter(f => f._id === 'pending' || f._id === 'overdue')
    .reduce((acc, curr) => acc + curr.count, 0);

  res.status(200).json({
    success: true,
    data: {
      totalResidents: totalStudents,
      totalCapacity: capData.totalCapacity,
      occupiedBeds: capData.totalOccupied,
      availableBeds: Math.max(0, capData.totalCapacity - capData.totalOccupied),
      occupancyPercentage,
      openTicketsCount,
      pendingFeesCount,
      totalPendingAmount: totalPendingDues,
      recentNoticesCount: activeNotices,
      metrics: {
        students: { total: totalStudents, active: activeStudents },
        rooms: {
          total: totalRooms,
          available: availableRooms,
          full: fullRooms,
          maintenance: maintenanceRooms,
          totalBeds: capData.totalCapacity,
          occupiedBeds: capData.totalOccupied,
          vacantBeds: Math.max(0, capData.totalCapacity - capData.totalOccupied),
          occupancyRate: `${occupancyPercentage}%`
        },
        complaints: {
          pending: pendingComplaints,
          inProgress: inProgressComplaints,
          resolved: resolvedComplaints,
          total: pendingComplaints + inProgressComplaints + resolvedComplaints
        },
        financials: {
          totalCollected,
          totalPendingDues,
          totalOverdue,
          expectedMonthlyRent: capData.expectedMonthlyRent
        },
        notices: { active: activeNotices }
      },
      blockDistribution,
      departmentBreakdown,
      recentComplaints,
      recentPayments,
      recentNotices
    }
  });
});

// @desc    Get Warden Dashboard Statistics
// @route   GET /api/dashboard/warden, GET /api/dashboard/stats
// @access  Private/Admin/Warden
const getWardenDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalResidents,
    roomCapacityAgg,
    openTicketsCount,
    pendingFeesAgg,
    recentNoticesCount
  ] = await Promise.all([
    Student.countDocuments(),
    Room.aggregate([
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity' },
          occupiedBeds: { $sum: '$currentOccupancy' }
        }
      }
    ]),
    Complaint.countDocuments({ status: { $in: ['pending', 'in-progress'] } }),
    Fee.aggregate([
      {
        $match: { status: { $in: ['pending', 'overdue'] } }
      },
      {
        $group: {
          _id: null,
          pendingFeesCount: { $sum: 1 },
          totalPendingAmount: { $sum: { $add: ['$amount', { $ifNull: ['$fine.amount', 0] }] } }
        }
      }
    ]),
    Notice.countDocuments({ isActive: true })
  ]);

  const capData = roomCapacityAgg[0] || { totalCapacity: 0, occupiedBeds: 0 };
  const totalCapacity = capData.totalCapacity || 0;
  const occupiedBeds = capData.occupiedBeds || 0;
  const availableBeds = Math.max(0, totalCapacity - occupiedBeds);
  const occupancyPercentage = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;

  const feeData = pendingFeesAgg[0] || { pendingFeesCount: 0, totalPendingAmount: 0 };

  res.status(200).json({
    success: true,
    data: {
      totalResidents,
      totalCapacity,
      occupiedBeds,
      availableBeds,
      occupancyPercentage,
      openTicketsCount,
      pendingFeesCount: feeData.pendingFeesCount || 0,
      totalPendingAmount: feeData.totalPendingAmount || 0,
      recentNoticesCount
    }
  });
});

// @desc    Get Personalized Dashboard for logged-in Student
// @route   GET /api/dashboard/student
// @access  Private/Student
const getStudentDashboardStats = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id })
    .populate('userId', 'fullName email phone avatar')
    .populate({
      path: 'roomId',
      populate: {
        path: 'occupants',
        select: 'studentId department year',
        populate: { path: 'userId', select: 'fullName email avatar phone' }
      }
    });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found.'
    });
  }

  // Fetch student's complaints summary
  const [complaints, fees, notices] = await Promise.all([
    Complaint.find({ studentId: student._id }).sort({ createdAt: -1 }),
    Fee.find({ studentId: student._id }).sort({ dueDate: 1 }),
    Notice.find({
      isActive: true,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        { targetAudience: 'specific-block', 'targetDetails.block': student.roomId?.block }
      ]
    })
      .populate('author', 'fullName role')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5)
  ]);

  // Calculate Fee Summary
  let totalPaid = 0;
  let pendingDues = 0;
  let overdueCount = 0;

  fees.forEach(f => {
    const total = f.amount + (f.fine?.amount || 0);
    if (f.status === 'paid') totalPaid += total;
    if (f.status === 'pending' || f.status === 'overdue') {
      pendingDues += total;
      if (new Date() > new Date(f.dueDate)) overdueCount++;
    }
  });

  // Calculate Complaint Summary
  const complaintSummary = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length
  };

  // Filter out self from roommates list
  const roommates = student.roomId?.occupants
    ? student.roomId.occupants.filter(o => o._id.toString() !== student._id.toString())
    : [];

  res.status(200).json({
    success: true,
    data: {
      profile: student,
      roomDetails: student.roomId ? {
        _id: student.roomId._id,
        roomNumber: student.roomId.roomNumber,
        block: student.roomId.block,
        floor: student.roomId.floor,
        type: student.roomId.type,
        amenities: student.roomId.amenities,
        rentPerMonth: student.roomId.rentPerMonth,
        capacity: student.roomId.capacity,
        currentOccupancy: student.roomId.currentOccupancy,
        roommates
      } : null,
      financialSummary: {
        totalPaid,
        pendingDues,
        overdueCount,
        recentInvoices: fees.slice(0, 4)
      },
      complaintSummary: {
        ...complaintSummary,
        recentTickets: complaints.slice(0, 4)
      },
      notices
    }
  });
});

// @desc    Get Quick Stats for top Navbar / header widgets
// @route   GET /api/dashboard/quick-stats
// @access  Private
const getQuickStats = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    const pendingDuesCount = await Fee.countDocuments({
      studentId: student?._id,
      status: { $in: ['pending', 'overdue'] }
    });
    const pendingTicketsCount = await Complaint.countDocuments({
      studentId: student?._id,
      status: { $in: ['pending', 'in-progress'] }
    });
    const unreadNoticesCount = await Notice.countDocuments({
      isActive: true,
      'readBy.userId': { $ne: req.user._id }
    });

    return res.status(200).json({
      success: true,
      data: {
        pendingDuesCount,
        pendingTicketsCount,
        unreadNoticesCount
      }
    });
  }

  // Admin / Warden quick counters
  const [pendingComplaints, pendingFees, availableBedsAgg] = await Promise.all([
    Complaint.countDocuments({ status: 'pending' }),
    Fee.countDocuments({ status: { $in: ['pending', 'overdue'] } }),
    Room.aggregate([
      {
        $group: {
          _id: null,
          vacant: { $sum: { $subtract: ['$capacity', '$currentOccupancy'] } }
        }
      }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      pendingComplaints,
      pendingFees,
      vacantBeds: availableBedsAgg[0]?.vacant || 0
    }
  });
});

// @desc    Get unified timeline of recent system activities
// @route   GET /api/dashboard/recent-activities
// @access  Private/Admin/Warden
const getRecentActivities = asyncHandler(async (req, res) => {
  const [latestStudents, latestComplaints, latestPayments, latestNotices] = await Promise.all([
    Student.find().populate('userId', 'fullName').sort({ createdAt: -1 }).limit(3),
    Complaint.find().populate({ path: 'studentId', populate: { path: 'userId', select: 'fullName' } }).sort({ createdAt: -1 }).limit(3),
    Fee.find({ status: 'paid' }).populate({ path: 'studentId', populate: { path: 'userId', select: 'fullName' } }).sort({ paidDate: -1 }).limit(3),
    Notice.find().sort({ createdAt: -1 }).limit(3)
  ]);

  const activities = [];

  latestStudents.forEach(s => {
    activities.push({
      type: 'student_registered',
      title: `New Student Admitted: ${s.userId?.fullName || s.studentId}`,
      subtitle: `${s.department} (Year ${s.year})`,
      timestamp: s.createdAt,
      icon: 'user-plus'
    });
  });

  latestComplaints.forEach(c => {
    activities.push({
      type: 'complaint_raised',
      title: `Complaint Filed: ${c.subject}`,
      subtitle: `By ${c.studentId?.userId?.fullName || 'Student'} • Priority: ${c.priority}`,
      timestamp: c.createdAt,
      icon: 'alert-circle'
    });
  });

  latestPayments.forEach(p => {
    activities.push({
      type: 'payment_received',
      title: `Payment Received: ₹${p.amount + (p.fine?.amount || 0)}`,
      subtitle: `${p.feeType} paid via ${p.paymentMethod?.toUpperCase()} (${p.receiptNumber})`,
      timestamp: p.paidDate || p.updatedAt,
      icon: 'dollar-sign'
    });
  });

  latestNotices.forEach(n => {
    activities.push({
      type: 'notice_posted',
      title: `Notice Broadcasted: ${n.title}`,
      subtitle: `Target: ${n.targetAudience} • Priority: ${n.priority}`,
      timestamp: n.createdAt,
      icon: 'bell'
    });
  });

  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.status(200).json({
    success: true,
    data: activities.slice(0, 10)
  });
});

module.exports = {
  getAdminDashboardStats,
  getWardenDashboardStats,
  getStudentDashboardStats,
  getQuickStats,
  getRecentActivities
};

