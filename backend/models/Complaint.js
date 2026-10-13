const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required']
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    category: {
      type: String,
      enum: [
        'plumbing',
        'electrical',
        'furniture',
        'cleaning',
        'security',
        'mess-food',
        'wifi-internet',
        'noise',
        'room-change',
        'other'
      ],
      required: [true, 'Complaint category is required']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [150, 'Subject cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    images: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'rejected', 'closed'],
      default: 'pending'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolution: {
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      resolvedAt: Date,
      remarks: String
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      submittedAt: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
complaintSchema.index({ studentId: 1, status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
