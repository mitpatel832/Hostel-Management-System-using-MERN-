const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    fatherName: {
      type: String,
      required: [true, 'Father name is required'],
      trim: true
    },
    motherName: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required']
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Academic year is required'],
      min: 1,
      max: 5
    },
    semester: {
      type: Number,
      min: 1,
      max: 10
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10
    },
    permanentAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    guardianContact: {
      name: String,
      phone: String,
      relation: String,
      email: String
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null
    },
    admissionDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'suspended'],
      default: 'active'
    },
    documents: {
      aadharCard: String,
      marksheet: String,
      idProof: String,
      medicalCertificate: String
    }
  },
  {
    timestamps: true
  }
);

// Virtual for full student info
studentSchema.virtual('fullInfo').get(function () {
  return `${this.studentId} - ${this.department} (Year ${this.year})`;
});

// Indexes
studentSchema.index({ department: 1, year: 1 });
studentSchema.index({ roomId: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', studentSchema);
