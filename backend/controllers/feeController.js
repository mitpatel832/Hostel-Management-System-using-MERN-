const asyncHandler = require('express-async-handler');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

// Helper to generate a unique digital receipt number (e.g. RCP-202502-8492)
const generateReceiptNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RCP-${dateStr}-${randomSuffix}`;
};

// @desc    Create a new fee invoice for a student (Admin/Warden only)
// @route   POST /api/fees
// @access  Private/Admin/Warden
const createFee = asyncHandler(async (req, res) => {
  const {
    studentId,
    feeType,
    amount,
    dueDate,
    month,
    year,
    remarks
  } = req.body;

  // Validate student existence
  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found.'
    });
  }

  // Prevent duplicate invoices for the same type, month, and year for a student
  if (month && year) {
    const existingFee = await Fee.findOne({
      studentId,
      feeType,
      month,
      year
    });
    if (existingFee) {
      return res.status(400).json({
        success: false,
        message: `An invoice for ${feeType} (${month} ${year}) already exists for this student.`
      });
    }
  }

  const fee = await Fee.create({
    studentId,
    feeType,
    amount,
    dueDate,
    month,
    year: year || new Date().getFullYear(),
    remarks,
    status: 'pending'
  });

  const populatedFee = await Fee.findById(fee._id).populate({
    path: 'studentId',
    select: 'studentId department year',
    populate: { path: 'userId', select: 'fullName email phone' }
  });

  res.status(201).json({
    success: true,
    message: 'Fee invoice created successfully!',
    data: populatedFee
  });
});

// @desc    Get all fees with filtering, search & pagination (Admin/Warden)
// @route   GET /api/fees
// @access  Private/Admin/Warden
const getAllFees = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.feeType) {
    filter.feeType = req.query.feeType;
  }

  if (req.query.month) {
    filter.month = req.query.month;
  }

  if (req.query.year) {
    filter.year = parseInt(req.query.year);
  }

  if (req.query.studentId) {
    filter.studentId = req.query.studentId;
  }

  // Sort options
  let sort = { dueDate: 1, createdAt: -1 };
  if (req.query.sortBy) {
    const order = req.query.sortOrder === 'asc' ? 1 : -1;
    sort = { [req.query.sortBy]: order };
  }

  const totalFees = await Fee.countDocuments(filter);
  const fees = await Fee.find(filter)
    .populate({
      path: 'studentId',
      select: 'studentId department year roomId',
      populate: [
        { path: 'userId', select: 'fullName email phone' },
        { path: 'roomId', select: 'roomNumber block' }
      ]
    })
    .populate('verifiedBy', 'fullName email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: fees.length,
    total: totalFees,
    pages: Math.ceil(totalFees / limit),
    currentPage: page,
    data: fees
  });
});

// @desc    Get fee history and dues for logged-in student
// @route   GET /api/fees/my
// @access  Private/Student
const getMyFees = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found.'
    });
  }

  const fees = await Fee.find({ studentId: student._id })
    .populate('verifiedBy', 'fullName')
    .sort({ createdAt: -1 });

  // Calculate student balance overview
  let totalDues = 0;
  let totalPaid = 0;
  let overdueCount = 0;

  fees.forEach(f => {
    const payable = f.amount + (f.fine?.amount || 0);
    if (f.status === 'paid') {
      totalPaid += payable;
    } else if (f.status === 'pending' || f.status === 'overdue' || f.status === 'partial') {
      totalDues += payable;
      if (new Date() > new Date(f.dueDate)) overdueCount++;
    }
  });

  res.status(200).json({
    success: true,
    summary: {
      totalPaid,
      pendingDues: totalDues,
      overdueInvoices: overdueCount,
      totalInvoices: fees.length
    },
    data: fees
  });
});

// @desc    Get single fee invoice & receipt details
// @route   GET /api/fees/:id
// @access  Private
const getFeeById = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id)
    .populate({
      path: 'studentId',
      select: 'studentId department year permanentAddress guardianContact',
      populate: [
        { path: 'userId', select: 'fullName email phone avatar' },
        { path: 'roomId', select: 'roomNumber block floor' }
      ]
    })
    .populate('verifiedBy', 'fullName email phone role');

  if (!fee) {
    return res.status(404).json({
      success: false,
      message: 'Fee invoice not found.'
    });
  }

  // Security check: student can only view their own invoice
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || fee.studentId._id.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to fee invoice.'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: fee
  });
});

// @desc    Record or process fee payment (Student / Admin / Warden)
// @route   PUT /api/fees/:id/pay
// @access  Private
const recordPayment = asyncHandler(async (req, res) => {
  const { paymentMethod, transactionId, remarks } = req.body;
  const fee = await Fee.findById(req.params.id);

  if (!fee) {
    return res.status(404).json({
      success: false,
      message: 'Fee invoice not found.'
    });
  }

  if (fee.status === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'This fee invoice has already been paid.',
      receiptNumber: fee.receiptNumber
    });
  }

  // If a student is paying, ensure it is their own invoice
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || fee.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay for your own dues.'
      });
    }
  }

  fee.status = 'paid';
  fee.paidDate = new Date();
  fee.paymentMethod = paymentMethod || 'upi';
  fee.transactionId = transactionId || `TXN-${Date.now()}`;
  fee.receiptNumber = generateReceiptNumber();
  if (remarks) fee.remarks = remarks;

  // If admin/warden is marking payment, set verifier
  if (req.user.role === 'admin' || req.user.role === 'warden') {
    fee.verifiedBy = req.user._id;
  }

  await fee.save();

  const updatedFee = await Fee.findById(fee._id)
    .populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'fullName email phone' }
    })
    .populate('verifiedBy', 'fullName email');

  res.status(200).json({
    success: true,
    message: 'Payment recorded successfully! Digital receipt generated.',
    receipt: {
      receiptNumber: updatedFee.receiptNumber,
      transactionId: updatedFee.transactionId,
      paidAmount: updatedFee.amount + (updatedFee.fine?.amount || 0),
      paymentMethod: updatedFee.paymentMethod,
      paidDate: updatedFee.paidDate
    },
    data: updatedFee
  });
});

// @desc    Apply fine to fee invoice for overdue payment (Admin/Warden)
// @route   PUT /api/fees/:id/fine
// @access  Private/Admin/Warden
const applyFine = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  const fee = await Fee.findById(req.params.id);

  if (!fee) {
    return res.status(404).json({
      success: false,
      message: 'Fee invoice not found.'
    });
  }

  if (fee.status === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot apply fine to an already settled invoice.'
    });
  }

  fee.fine = {
    amount: Number(amount) || 0,
    reason: reason || 'Late payment penalty'
  };

  await fee.save();

  res.status(200).json({
    success: true,
    message: `Fine of ₹${amount} applied successfully.`,
    data: fee
  });
});

// @desc    Waive off fee or fine (Admin only)
// @route   PUT /api/fees/:id/waive
// @access  Private/Admin
const waiveFee = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const fee = await Fee.findById(req.params.id);

  if (!fee) {
    return res.status(404).json({
      success: false,
      message: 'Fee invoice not found.'
    });
  }

  fee.status = 'waived';
  fee.remarks = reason ? `Waived: ${reason}` : 'Waived by administrator';
  await fee.save();

  res.status(200).json({
    success: true,
    message: 'Fee invoice marked as waived.',
    data: fee
  });
});

// @desc    Delete fee invoice (Admin only)
// @route   DELETE /api/fees/:id
// @access  Private/Admin
const deleteFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id);

  if (!fee) {
    return res.status(404).json({
      success: false,
      message: 'Fee invoice not found.'
    });
  }

  if (fee.status === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete a settled and verified payment record.'
    });
  }

  await Fee.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Fee invoice deleted successfully.'
  });
});

// @desc    Get financial analytics, monthly collection & revenue overview
// @route   GET /api/fees/stats/overview
// @access  Private/Admin/Warden
const getFeeStats = asyncHandler(async (req, res) => {
  const totalInvoices = await Fee.countDocuments();
  const paidInvoices = await Fee.countDocuments({ status: 'paid' });
  const pendingInvoices = await Fee.countDocuments({ status: 'pending' });
  const overdueInvoices = await Fee.countDocuments({ status: 'overdue' });
  const waivedInvoices = await Fee.countDocuments({ status: 'waived' });

  // Revenue totals aggregation
  const revenueAggregation = await Fee.aggregate([
    {
      $group: {
        _id: '$status',
        totalBaseAmount: { $sum: '$amount' },
        totalFineAmount: { $sum: { $ifNull: ['$fine.amount', 0] } },
        count: { $sum: 1 }
      }
    }
  ]);

  let totalCollected = 0;
  let totalPendingDues = 0;

  revenueAggregation.forEach(item => {
    const sum = item.totalBaseAmount + item.totalFineAmount;
    if (item._id === 'paid') totalCollected += sum;
    if (item._id === 'pending' || item._id === 'overdue') totalPendingDues += sum;
  });

  // Breakdown by fee types
  const feeTypeBreakdown = await Fee.aggregate([
    {
      $group: {
        _id: '$feeType',
        totalRevenue: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
        },
        pendingAmount: {
          $sum: { $cond: [{ $in: ['$status', ['pending', 'overdue']] }, '$amount', 0] }
        },
        totalCount: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  // Payment method distribution for paid receipts
  const paymentMethods = await Fee.aggregate([
    { $match: { status: 'paid', paymentMethod: { $ne: null } } },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      invoices: {
        total: totalInvoices,
        paid: paidInvoices,
        pending: pendingInvoices,
        overdue: overdueInvoices,
        waived: waivedInvoices
      },
      revenue: {
        totalCollected,
        totalPendingDues,
        collectionRate: (totalCollected + totalPendingDues) > 0
          ? `${Math.round((totalCollected / (totalCollected + totalPendingDues)) * 100)}%`
          : '100%'
      },
      feeTypeBreakdown,
      paymentMethods
    }
  });
});

module.exports = {
  createFee,
  getAllFees,
  getMyFees,
  getFeeById,
  recordPayment,
  applyFine,
  waiveFee,
  deleteFee,
  getFeeStats
};
