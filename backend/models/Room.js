const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: 0,
      max: 20
    },
    block: {
      type: String,
      required: [true, 'Block name is required'],
      enum: ['A', 'B', 'C', 'D', 'E'],
      uppercase: true
    },
    type: {
      type: String,
      enum: ['single', 'double', 'triple', 'quad'],
      required: [true, 'Room type is required'],
      default: 'double'
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: 1,
      max: 6
    },
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    currentOccupancy: {
      type: Number,
      default: 0
    },
    rentPerMonth: {
      type: Number,
      required: [true, 'Rent is required'],
      min: 0
    },
    amenities: {
      hasAC: { type: Boolean, default: false },
      hasAttachedBathroom: { type: Boolean, default: true },
      hasBalcony: { type: Boolean, default: false },
      hasStudyTable: { type: Boolean, default: true },
      hasWardrobe: { type: Boolean, default: true },
      hasWiFi: { type: Boolean, default: true }
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs-repair'],
      default: 'good'
    },
    status: {
      type: String,
      enum: ['available', 'full', 'maintenance', 'reserved'],
      default: 'available'
    },
    lastInspectionDate: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

// Virtual for availability
roomSchema.virtual('availableBeds').get(function () {
  return this.capacity - this.currentOccupancy;
});

// Virtual for occupancy percentage
roomSchema.virtual('occupancyPercentage').get(function () {
  return this.capacity > 0 ? Math.round((this.currentOccupancy / this.capacity) * 100) : 0;
});

// Ensure virtuals are included in JSON
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

// Pre-save hook to auto-update status
roomSchema.pre('save', function (next) {
  if (this.currentOccupancy >= this.capacity) {
    this.status = 'full';
  } else if (this.status !== 'maintenance' && this.status !== 'reserved') {
    this.status = 'available';
  }
  next();
});

// Indexes
roomSchema.index({ block: 1, floor: 1, roomNumber: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ type: 1 });

module.exports = mongoose.model('Room', roomSchema);
