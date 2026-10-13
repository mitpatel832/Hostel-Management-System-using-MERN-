const asyncHandler = require('express-async-handler');
const Notice = require('../models/Notice');
const Student = require('../models/Student');

// @desc    Create a new notice/announcement (Admin/Warden only)
// @route   POST /api/notices
// @access  Private/Admin/Warden
const createNotice = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    category,
    priority,
    targetAudience,
    targetDetails,
    attachments,
    isPinned,
    expiryDate
  } = req.body;

  const notice = await Notice.create({
    title,
    content,
    category: category || 'general',
    priority: priority || 'normal',
    author: req.user._id,
    targetAudience: targetAudience || 'all',
    targetDetails: targetDetails || {},
    attachments: attachments || [],
    isPinned: isPinned || false,
    expiryDate: expiryDate || null,
    isActive: true
  });

  const populatedNotice = await Notice.findById(notice._id)
    .populate('author', 'fullName email role avatar');

  res.status(201).json({
    success: true,
    message: 'Notice published successfully!',
    data: populatedNotice
  });
});

// @desc    Get all active notices with filtering & pagination (Admin/Warden sees all, Student sees targeted)
// @route   GET /api/notices
// @access  Private
const getAllNotices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  // Auto-expire notices past their expiry date
  await Notice.updateMany(
    { expiryDate: { $ne: null, $lt: new Date() }, isActive: true },
    { $set: { isActive: false } }
  );

  // Students only see notices targeted to them
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('roomId', 'block floor');

    if (student && student.roomId) {
      filter.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        {
          targetAudience: 'specific-block',
          'targetDetails.block': student.roomId.block
        },
        {
          targetAudience: 'specific-floor',
          'targetDetails.floor': student.roomId.floor
        }
      ];
    } else {
      filter.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'students' }
      ];
    }
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    });
  }

  // Pinned notices always appear first, then by date
  const sort = { isPinned: -1, priority: -1, createdAt: -1 };

  const totalNotices = await Notice.countDocuments(filter);
  const notices = await Notice.find(filter)
    .populate('author', 'fullName email role avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: notices.length,
    total: totalNotices,
    pages: Math.ceil(totalNotices / limit),
    currentPage: page,
    data: notices
  });
});

// @desc    Get single notice details and mark as read
// @route   GET /api/notices/:id
// @access  Private
const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id)
    .populate('author', 'fullName email role avatar')
    .populate('readBy.userId', 'fullName email');

  if (!notice) {
    return res.status(404).json({
      success: false,
      message: 'Notice not found.'
    });
  }

  // Auto-mark as read for the current user
  const alreadyRead = notice.readBy.some(
    r => r.userId && r.userId._id && r.userId._id.toString() === req.user._id.toString()
  );

  if (!alreadyRead) {
    notice.readBy.push({
      userId: req.user._id,
      readAt: new Date()
    });
    notice.views += 1;
    await notice.save();
  }

  res.status(200).json({
    success: true,
    data: notice
  });
});

// @desc    Update notice content (Admin/Warden, author only)
// @route   PUT /api/notices/:id
// @access  Private/Admin/Warden
const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return res.status(404).json({
      success: false,
      message: 'Notice not found.'
    });
  }

  // Only the original author or an admin can edit
  if (
    notice.author.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Only the author or admin can edit this notice.'
    });
  }

  const allowedFields = [
    'title', 'content', 'category', 'priority',
    'targetAudience', 'targetDetails', 'attachments',
    'isPinned', 'expiryDate', 'isActive'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      notice[field] = req.body[field];
    }
  });

  const updatedNotice = await notice.save();
  const populated = await Notice.findById(updatedNotice._id)
    .populate('author', 'fullName email role avatar');

  res.status(200).json({
    success: true,
    message: 'Notice updated successfully.',
    data: populated
  });
});

// @desc    Pin or unpin a notice (Admin/Warden only)
// @route   PUT /api/notices/:id/pin
// @access  Private/Admin/Warden
const togglePinNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return res.status(404).json({
      success: false,
      message: 'Notice not found.'
    });
  }

  notice.isPinned = !notice.isPinned;
  await notice.save();

  res.status(200).json({
    success: true,
    message: `Notice ${notice.isPinned ? 'pinned' : 'unpinned'} successfully.`,
    data: { _id: notice._id, title: notice.title, isPinned: notice.isPinned }
  });
});

// @desc    Archive (soft-delete) a notice (Admin/Warden only)
// @route   PUT /api/notices/:id/archive
// @access  Private/Admin/Warden
const archiveNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return res.status(404).json({
      success: false,
      message: 'Notice not found.'
    });
  }

  notice.isActive = false;
  await notice.save();

  res.status(200).json({
    success: true,
    message: 'Notice archived and removed from the active board.',
    data: { _id: notice._id, title: notice.title, isActive: false }
  });
});

// @desc    Permanently delete a notice (Admin only)
// @route   DELETE /api/notices/:id
// @access  Private/Admin
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return res.status(404).json({
      success: false,
      message: 'Notice not found.'
    });
  }

  const noticeTitle = notice.title;
  await Notice.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: `Notice "${noticeTitle}" permanently deleted.`
  });
});

// @desc    Get notice board analytics & engagement stats
// @route   GET /api/notices/stats/overview
// @access  Private/Admin/Warden
const getNoticeStats = asyncHandler(async (req, res) => {
  const totalNotices = await Notice.countDocuments();
  const activeNotices = await Notice.countDocuments({ isActive: true });
  const archivedNotices = await Notice.countDocuments({ isActive: false });
  const pinnedNotices = await Notice.countDocuments({ isPinned: true, isActive: true });

  // Category distribution
  const categoryStats = await Notice.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Priority distribution
  const priorityStats = await Notice.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  // Most viewed notices (top 5)
  const topViewed = await Notice.find({ isActive: true })
    .select('title category priority views')
    .sort({ views: -1 })
    .limit(5);

  // Average views per notice
  const avgViewsAgg = await Notice.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        averageViews: { $avg: '$views' },
        totalViews: { $sum: '$views' }
      }
    }
  ]);

  const avgStats = avgViewsAgg[0] || { averageViews: 0, totalViews: 0 };

  res.status(200).json({
    success: true,
    data: {
      summary: {
        total: totalNotices,
        active: activeNotices,
        archived: archivedNotices,
        pinned: pinnedNotices
      },
      engagement: {
        totalViews: avgStats.totalViews,
        averageViewsPerNotice: Math.round(avgStats.averageViews || 0)
      },
      categoryBreakdown: categoryStats,
      priorityBreakdown: priorityStats,
      topViewedNotices: topViewed
    }
  });
});

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  togglePinNotice,
  archiveNotice,
  deleteNotice,
  getNoticeStats
};
