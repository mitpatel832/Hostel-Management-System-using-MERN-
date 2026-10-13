const asyncHandler = require('express-async-handler');
const Room = require('../models/Room');
const Student = require('../models/Student');

// Default capacities per room type
const TYPE_CAPACITY_MAP = {
  single: 1,
  double: 2,
  triple: 3,
  quad: 4
};

// @desc    Create a new room (Admin/Warden only)
// @route   POST /api/rooms
// @access  Private/Admin/Warden
const createRoom = asyncHandler(async (req, res) => {
  const {
    roomNumber,
    floor,
    block,
    type,
    capacity,
    rentPerMonth,
    amenities,
    condition,
    notes
  } = req.body;

  // Check if room number already exists
  const existingRoom = await Room.findOne({ roomNumber: roomNumber.toUpperCase() });
  if (existingRoom) {
    return res.status(400).json({
      success: false,
      message: `Room ${roomNumber.toUpperCase()} already exists in Block ${existingRoom.block}.`
    });
  }

  // Determine capacity: use explicit capacity or fallback to type default
  const finalCapacity = capacity || TYPE_CAPACITY_MAP[type] || 2;

  const room = await Room.create({
    roomNumber: roomNumber.toUpperCase(),
    floor,
    block: block.toUpperCase(),
    type,
    capacity: finalCapacity,
    rentPerMonth,
    amenities: amenities || {},
    condition: condition || 'good',
    notes
  });

  res.status(201).json({
    success: true,
    message: `Room ${room.roomNumber} created successfully in Block ${room.block}!`,
    data: room
  });
});

// @desc    Get all rooms with advanced filtering, searching & pagination
// @route   GET /api/rooms
// @access  Private
const getAllRooms = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Build dynamic filter
  const filter = {};

  if (req.query.search) {
    filter.roomNumber = new RegExp(req.query.search, 'i');
  }

  if (req.query.block) {
    filter.block = req.query.block.toUpperCase();
  }

  if (req.query.floor !== undefined && req.query.floor !== '') {
    filter.floor = parseInt(req.query.floor);
  }

  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.condition) {
    filter.condition = req.query.condition;
  }

  // Filter by boolean amenities
  if (req.query.hasAC === 'true') filter['amenities.hasAC'] = true;
  if (req.query.hasAttachedBathroom === 'true') filter['amenities.hasAttachedBathroom'] = true;
  if (req.query.hasBalcony === 'true') filter['amenities.hasBalcony'] = true;

  // Price range filters
  if (req.query.minRent || req.query.maxRent) {
    filter.rentPerMonth = {};
    if (req.query.minRent) filter.rentPerMonth.$gte = Number(req.query.minRent);
    if (req.query.maxRent) filter.rentPerMonth.$lte = Number(req.query.maxRent);
  }

  // Sort options
  let sort = { block: 1, floor: 1, roomNumber: 1 };
  if (req.query.sortBy) {
    const order = req.query.sortOrder === 'desc' ? -1 : 1;
    sort = { [req.query.sortBy]: order };
  }

  const totalRooms = await Room.countDocuments(filter);
  const rooms = await Room.find(filter)
    .populate({
      path: 'occupants',
      select: 'studentId department year gender',
      populate: { path: 'userId', select: 'fullName email phone avatar' }
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: rooms.length,
    total: totalRooms,
    pages: Math.ceil(totalRooms / limit),
    currentPage: page,
    data: rooms
  });
});

// @desc    Get single room details with full occupant profiles
// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate({
    path: 'occupants',
    select: 'studentId department year gender bloodGroup permanentAddress guardianContact',
    populate: { path: 'userId', select: 'fullName email phone avatar' }
  });

  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  res.status(200).json({
    success: true,
    data: room
  });
});

// @desc    Get only available rooms with vacant beds (optimized for allocation dropdowns)
// @route   GET /api/rooms/available
// @access  Private
const getAvailableRooms = asyncHandler(async (req, res) => {
  const filter = {
    status: 'available',
    $expr: { $lt: ['$currentOccupancy', '$capacity'] }
  };

  if (req.query.block) filter.block = req.query.block.toUpperCase();
  if (req.query.type) filter.type = req.query.type;

  const rooms = await Room.find(filter)
    .select('roomNumber block floor type capacity currentOccupancy rentPerMonth amenities')
    .sort({ block: 1, roomNumber: 1 });

  res.status(200).json({
    success: true,
    count: rooms.length,
    data: rooms
  });
});

// @desc    Update room details (Admin/Warden only)
// @route   PUT /api/rooms/:id
// @access  Private/Admin/Warden
const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  // Prevent reducing capacity below current occupancy
  if (req.body.capacity !== undefined) {
    if (req.body.capacity < room.currentOccupancy) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce capacity to ${req.body.capacity}. Room currently has ${room.currentOccupancy} occupant(s). Vacate students first.`
      });
    }
    room.capacity = req.body.capacity;
  }

  const allowedUpdates = [
    'floor', 'block', 'type', 'rentPerMonth',
    'amenities', 'condition', 'status', 'notes', 'lastInspectionDate'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      room[field] = req.body[field];
    }
  });

  // Re-evaluate status automatically based on occupancy vs capacity
  if (room.currentOccupancy >= room.capacity) {
    room.status = 'full';
  } else if (room.status !== 'maintenance' && room.status !== 'reserved') {
    room.status = 'available';
  }

  const updatedRoom = await room.save();

  res.status(200).json({
    success: true,
    message: `Room ${updatedRoom.roomNumber} updated successfully`,
    data: updatedRoom
  });
});

// @desc    Change room maintenance/operational status (Admin/Warden only)
// @route   PUT /api/rooms/:id/status
// @access  Private/Admin/Warden
const updateRoomStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  if (!['available', 'maintenance', 'reserved'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Status can only be set to available, maintenance, or reserved.'
    });
  }

  // If moving to maintenance, warn if occupied
  if (status === 'maintenance' && room.currentOccupancy > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot put Room ${room.roomNumber} into maintenance while it has ${room.currentOccupancy} active student(s). Reallocate students first.`
    });
  }

  room.status = status;
  if (notes) room.notes = notes;
  await room.save();

  res.status(200).json({
    success: true,
    message: `Room ${room.roomNumber} status changed to '${status}'`,
    data: room
  });
});

// @desc    Delete a room (Admin only)
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  // Prevent deleting room with active occupants
  if (room.currentOccupancy > 0 || room.occupants.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete Room ${room.roomNumber}. It currently has ${room.currentOccupancy} student(s) allocated. Vacate or reallocate them first.`
    });
  }

  const roomNumber = room.roomNumber;
  await Room.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: `Room ${roomNumber} deleted successfully`
  });
});

// @desc    Get comprehensive room statistics & analytics
// @route   GET /api/rooms/stats/overview
// @access  Private/Admin/Warden
const getRoomStats = asyncHandler(async (req, res) => {
  const totalRooms = await Room.countDocuments();
  const availableRooms = await Room.countDocuments({ status: 'available' });
  const fullRooms = await Room.countDocuments({ status: 'full' });
  const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });
  const reservedRooms = await Room.countDocuments({ status: 'reserved' });

  // Capacity calculations via aggregation
  const capacityStats = await Room.aggregate([
    {
      $group: {
        _id: null,
        totalCapacity: { $sum: '$capacity' },
        totalOccupied: { $sum: '$currentOccupancy' },
        totalExpectedRevenue: { $sum: '$rentPerMonth' },
        averageRent: { $avg: '$rentPerMonth' }
      }
    }
  ]);

  // Block-wise breakdown
  const blockStats = await Room.aggregate([
    {
      $group: {
        _id: '$block',
        totalRooms: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        currentOccupancy: { $sum: '$currentOccupancy' },
        availableBeds: { $sum: { $subtract: ['$capacity', '$currentOccupancy'] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Room type breakdown
  const typeStats = await Room.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        currentOccupancy: { $sum: '$currentOccupancy' }
      }
    }
  ]);

  const summary = capacityStats[0] || {
    totalCapacity: 0,
    totalOccupied: 0,
    totalExpectedRevenue: 0,
    averageRent: 0
  };

  const occupancyRate = summary.totalCapacity > 0
    ? Math.round((summary.totalOccupied / summary.totalCapacity) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      rooms: {
        total: totalRooms,
        available: availableRooms,
        full: fullRooms,
        maintenance: maintenanceRooms,
        reserved: reservedRooms
      },
      beds: {
        totalCapacity: summary.totalCapacity,
        totalOccupied: summary.totalOccupied,
        totalVacant: summary.totalCapacity - summary.totalOccupied,
        occupancyRate: `${occupancyRate}%`
      },
      financials: {
        monthlyRevenuePotential: summary.totalExpectedRevenue,
        averageRoomRent: Math.round(summary.averageRent || 0)
      },
      blockBreakdown: blockStats,
      typeBreakdown: typeStats
    }
  });
});

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  getAvailableRooms,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  getRoomStats
};
