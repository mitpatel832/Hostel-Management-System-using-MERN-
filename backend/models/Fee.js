const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required']
    },
    feeType: {
      type: String,
      enum: [
        'hostel-rent',
        'mess-fee',
        'electricity',
        'water',
        'maintenance',
        'security-deposit',
        'laundry',
        'wifi',
        'other'
      ],
      required: [true, 'Fee type is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    paidDate: {
      type: Date,
      default: null
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'net-banking', 'card', 'cheque', 'scholarship', null],
      default: null
    },
    transactionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    receiptNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'waived'],
      default: 'pending'
    },
    month: {
      type: String,
      enum: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    },
    year: {
      type: Number,
      min: 2020,
      max: 2035
    },
    fine: {
      amount: { type: Number, default: 0 },
      reason: String
    },
    remarks: {
      type: String,
      maxlength: 500
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Virtual for total payable
feeSchema.virtual('totalPayable').get(function () {
  return this.amount + (this.fine ? this.fine.amount : 0);
});

// Virtual for is overdue
feeSchema.virtual('isOverdue').get(function () {
  return this.status === 'pending' && new Date() > new Date(this.dueDate);
});

feeSchema.set('toJSON', { virtuals: true });
feeSchema.set('toObject', { virtuals: true });

// Pre-save hook to auto-set overdue
feeSchema.pre('save', function (next) {
  if (this.status === 'pending' && new Date() > new Date(this.dueDate)) {
    this.status = 'overdue';
  }
  next();
});

// Indexes
feeSchema.index({ studentId: 1, feeType: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ dueDate: 1 });
feeSchema.index({ month: 1, year: 1 });

module.exports = mongoose.model('Fee', feeSchema);
