const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    category: {
      type: String,
      enum: ['general', 'academic', 'events', 'maintenance', 'rules', 'emergency', 'holiday'],
      default: 'general'
    },
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent'],
      default: 'normal'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'wardens', 'specific-floor', 'specific-block'],
      default: 'all'
    },
    targetDetails: {
      floor: Number,
      block: String
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String
      }
    ],
    isPinned: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiryDate: {
      type: Date
    },
    views: {
      type: Number,
      default: 0
    },
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Virtual for read count
noticeSchema.virtual('readCount').get(function () {
  return this.readBy ? this.readBy.length : 0;
});

noticeSchema.set('toJSON', { virtuals: true });
noticeSchema.set('toObject', { virtuals: true });

// Indexes
noticeSchema.index({ category: 1, isActive: 1 });
noticeSchema.index({ isPinned: -1, createdAt: -1 });
noticeSchema.index({ expiryDate: 1 });
noticeSchema.index({ targetAudience: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
