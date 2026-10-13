const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Student = require('../models/Student');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Fee = require('../models/Fee');
const Notice = require('../models/Notice');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔄 MongoDB Connected for Seeding...');

    await User.deleteMany();
    await Student.deleteMany();
    await Room.deleteMany();
    await Complaint.deleteMany();
    await Fee.deleteMany();
    await Notice.deleteMany();
    console.log('🧹 Cleaned existing database collections.');

    // Create Primary Warden Account
    const wardenUser = await User.create({
      fullName: 'Prof. Ramesh Verma',
      email: 'warden@hostelhive.com',
      password: 'warden123',
      role: 'warden',
      phone: '9876543211',
      isActive: true
    });

    console.log('✅ Warden staff administrator account created (warden@hostelhive.com / warden123).');

    // Create Student Users
    const studentDataList = [
      { name: 'Rahul Sharma', email: 'rahul@student.com', phone: '9123456780', sid: 'CS2024001', dept: 'Computer Science', year: 3, gender: 'Male', blood: 'B+', father: 'Rajesh Sharma', mother: 'Sunita Sharma', city: 'Jaipur', state: 'Rajasthan' },
      { name: 'Priya Patel', email: 'priya@student.com', phone: '9123456781', sid: 'EC2024002', dept: 'Electronics & Comm', year: 2, gender: 'Female', blood: 'O+', father: 'Kishore Patel', mother: 'Meena Patel', city: 'Ahmedabad', state: 'Gujarat' },
      { name: 'Amit Kumar', email: 'amit@student.com', phone: '9123456782', sid: 'ME2024003', dept: 'Mechanical Engg', year: 4, gender: 'Male', blood: 'A+', father: 'Sanjay Kumar', mother: 'Rekha Kumar', city: 'Patna', state: 'Bihar' },
      { name: 'Ananya Roy', email: 'ananya@student.com', phone: '9123456783', sid: 'CS2024004', dept: 'Computer Science', year: 1, gender: 'Female', blood: 'AB+', father: 'Debashis Roy', mother: 'Mousumi Roy', city: 'Kolkata', state: 'West Bengal' },
      { name: 'Vikram Singh', email: 'vikram@student.com', phone: '9123456784', sid: 'CE2024005', dept: 'Civil Engg', year: 3, gender: 'Male', blood: 'O-', father: 'Harish Singh', mother: 'Pushpa Singh', city: 'Lucknow', state: 'Uttar Pradesh' },
      { name: 'Sneha Deshmukh', email: 'sneha@student.com', phone: '9123456785', sid: 'IT2024006', dept: 'Information Tech', year: 2, gender: 'Female', blood: 'A-', father: 'Anil Deshmukh', mother: 'Aarti Deshmukh', city: 'Pune', state: 'Maharashtra' },
      { name: 'Rohan Gupta', email: 'rohan@student.com', phone: '9123456786', sid: 'CS2024007', dept: 'Computer Science', year: 3, gender: 'Male', blood: 'B+', father: 'Prakash Gupta', mother: 'Sudha Gupta', city: 'Delhi', state: 'Delhi' },
      { name: 'Neha Reddy', email: 'neha@student.com', phone: '9123456787', sid: 'EE2024008', dept: 'Electrical Engg', year: 1, gender: 'Female', blood: 'O+', father: 'Venkatesh Reddy', mother: 'Laxmi Reddy', city: 'Hyderabad', state: 'Telangana' },
      { name: 'Karan Malhotra', email: 'karan@student.com', phone: '9123456788', sid: 'ME2024009', dept: 'Mechanical Engg', year: 2, gender: 'Male', blood: 'B-', father: 'Deepak Malhotra', mother: 'Kavita Malhotra', city: 'Chandigarh', state: 'Punjab' },
      { name: 'Divya Iyer', email: 'divya@student.com', phone: '9123456789', sid: 'BT2024010', dept: 'Biotechnology', year: 4, gender: 'Female', blood: 'AB-', father: 'Srinivasan Iyer', mother: 'Radha Iyer', city: 'Chennai', state: 'Tamil Nadu' }
    ];

    const createdUsers = [];
    for (const s of studentDataList) {
      const user = await User.create({
        fullName: s.name,
        email: s.email,
        password: 'student123',
        role: 'student',
        phone: s.phone,
        isActive: true
      });
      createdUsers.push({ user, raw: s });
    }
    console.log(`✅ Created ${createdUsers.length} Student User Accounts.`);

    // Rooms
    const roomConfigs = [
      { roomNumber: 'A-101', floor: 1, block: 'A', type: 'double', capacity: 2, rentPerMonth: 6500, amenities: { hasAC: true, hasAttachedBathroom: true, hasBalcony: true, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'excellent' },
      { roomNumber: 'A-102', floor: 1, block: 'A', type: 'double', capacity: 2, rentPerMonth: 6500, amenities: { hasAC: true, hasAttachedBathroom: true, hasBalcony: false, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'good' },
      { roomNumber: 'A-103', floor: 1, block: 'A', type: 'single', capacity: 1, rentPerMonth: 9000, amenities: { hasAC: true, hasAttachedBathroom: true, hasBalcony: true, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'excellent' },
      { roomNumber: 'A-201', floor: 2, block: 'A', type: 'triple', capacity: 3, rentPerMonth: 4500, amenities: { hasAC: false, hasAttachedBathroom: true, hasBalcony: true, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'good' },
      { roomNumber: 'A-202', floor: 2, block: 'A', type: 'double', capacity: 2, rentPerMonth: 6000, amenities: { hasAC: false, hasAttachedBathroom: true, hasBalcony: false, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'good' },
      
      { roomNumber: 'B-101', floor: 1, block: 'B', type: 'double', capacity: 2, rentPerMonth: 6500, amenities: { hasAC: true, hasAttachedBathroom: true, hasBalcony: true, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'excellent' },
      { roomNumber: 'B-102', floor: 1, block: 'B', type: 'double', capacity: 2, rentPerMonth: 6500, amenities: { hasAC: true, hasAttachedBathroom: true, hasBalcony: false, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'good' },
      { roomNumber: 'B-201', floor: 2, block: 'B', type: 'single', capacity: 1, rentPerMonth: 9500, amenities: { hasAC: true, hasAttachedBathroom: true, hasBalcony: true, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'excellent' },
      { roomNumber: 'B-202', floor: 2, block: 'B', type: 'quad', capacity: 4, rentPerMonth: 3800, amenities: { hasAC: false, hasAttachedBathroom: true, hasBalcony: false, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'fair' },
      
      { roomNumber: 'C-101', floor: 1, block: 'C', type: 'double', capacity: 2, rentPerMonth: 5500, amenities: { hasAC: false, hasAttachedBathroom: true, hasBalcony: false, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'good' },
      { roomNumber: 'C-102', floor: 1, block: 'C', type: 'double', capacity: 2, rentPerMonth: 5500, amenities: { hasAC: false, hasAttachedBathroom: true, hasBalcony: false, hasStudyTable: true, hasWardrobe: true, hasWiFi: true }, condition: 'needs-repair', status: 'maintenance' }
    ];

    const createdRooms = await Room.insertMany(roomConfigs);
    const roomA101 = createdRooms.find(r => r.roomNumber === 'A-101');
    const roomA102 = createdRooms.find(r => r.roomNumber === 'A-102');
    const roomA103 = createdRooms.find(r => r.roomNumber === 'A-103');
    const roomB101 = createdRooms.find(r => r.roomNumber === 'B-101');
    const roomB102 = createdRooms.find(r => r.roomNumber === 'B-102');
    const roomB201 = createdRooms.find(r => r.roomNumber === 'B-201');

    const createdStudents = [];
    for (let i = 0; i < createdUsers.length; i++) {
      const { user, raw } = createdUsers[i];
      let assignedRoom = null;

      if (i === 0 || i === 6) assignedRoom = roomA101;
      else if (i === 1 || i === 5) assignedRoom = roomB101;
      else if (i === 2) assignedRoom = roomA102;
      else if (i === 3) assignedRoom = roomB102;
      else if (i === 4) assignedRoom = roomA103;
      else if (i === 7) assignedRoom = roomB201;

      const student = await Student.create({
        userId: user._id,
        studentId: raw.sid,
        fatherName: raw.father,
        motherName: raw.mother,
        dateOfBirth: new Date(2002, (i * 2) % 12, (i * 3 + 1) % 28 + 1),
        gender: raw.gender,
        bloodGroup: raw.blood,
        department: raw.dept,
        year: raw.year,
        semester: raw.year * 2 - 1,
        cgpa: (7.5 + (i * 0.25)).toFixed(2),
        permanentAddress: { street: `${100 + i * 15} Main Boulevard`, city: raw.city, state: raw.state, pincode: `3000${i + 10}`, country: 'India' },
        guardianContact: { name: raw.father, phone: raw.phone, relation: 'Father' },
        roomId: assignedRoom ? assignedRoom._id : null,
        status: 'active'
      });

      if (assignedRoom) {
        assignedRoom.occupants.push(student._id);
        assignedRoom.currentOccupancy += 1;
        if (assignedRoom.currentOccupancy >= assignedRoom.capacity) assignedRoom.status = 'full';
        await assignedRoom.save();
      }

      createdStudents.push(student);
    }

    // Complaints
    const complaintConfigs = [
      { studentIndex: 0, category: 'plumbing', priority: 'high', subject: 'Washroom tap continuous leakage', description: 'Tap in bathroom 101 has a loose seal causing continuous dripping noise and water wastage.', status: 'resolved', resolutionRemarks: 'Plumbing washer replaced by maintenance staff.' },
      { studentIndex: 1, category: 'wifi-internet', priority: 'medium', subject: 'WiFi signal weak in room B-101 corner', description: 'The router on 1st floor B Block drops speed intermittently during evening study hours.', status: 'in-progress', assignedTo: wardenUser._id },
      { studentIndex: 2, category: 'electrical', priority: 'urgent', subject: 'Main tube light flickering in A-102', description: 'The study tubelight is flickering and causing eye strain. Needs immediate starter replacement.', status: 'pending' },
      { studentIndex: 3, category: 'furniture', priority: 'low', subject: 'Study chair wheel stuck', description: 'One castor wheel of the revolving study chair is jammed with dust.', status: 'resolved', resolutionRemarks: 'Wheel lubricated and replaced.' }
    ];

    for (const c of complaintConfigs) {
      const student = createdStudents[c.studentIndex];
      await Complaint.create({
        studentId: student._id,
        roomId: student.roomId,
        category: c.category,
        priority: c.priority,
        subject: c.subject,
        description: c.description,
        status: c.status,
        assignedTo: c.assignedTo || (c.status !== 'pending' ? wardenUser._id : null),
        resolution: c.status === 'resolved' ? { resolvedBy: wardenUser._id, resolvedAt: new Date(), remarks: c.resolutionRemarks } : undefined,
        feedback: c.status === 'resolved' ? { rating: 5, comment: 'Quick resolution. Thank you!', submittedAt: new Date() } : undefined
      });
    }

    // Fees
    const feeConfigs = [
      { studentIndex: 0, feeType: 'hostel-rent', amount: 6500, month: 'January', year: 2025, status: 'paid', paymentMethod: 'upi', txn: 'UPI-IND-7392810' },
      { studentIndex: 0, feeType: 'hostel-rent', amount: 6500, month: 'February', year: 2025, status: 'paid', paymentMethod: 'upi', txn: 'UPI-IND-8492019' },
      { studentIndex: 0, feeType: 'hostel-rent', amount: 6500, month: 'March', year: 2025, status: 'pending' },
      { studentIndex: 1, feeType: 'hostel-rent', amount: 6500, month: 'February', year: 2025, status: 'paid', paymentMethod: 'net-banking', txn: 'HDFC-NET-948201' }
    ];

    for (let i = 0; i < feeConfigs.length; i++) {
      const f = feeConfigs[i];
      const student = createdStudents[f.studentIndex];
      const dueDate = new Date(2025, f.month === 'January' ? 0 : f.month === 'February' ? 1 : 2, 28);

      await Fee.create({
        studentId: student._id,
        feeType: f.feeType,
        amount: f.amount,
        dueDate,
        paidDate: f.status === 'paid' ? new Date(2025, dueDate.getMonth(), 10) : null,
        paymentMethod: f.paymentMethod || null,
        transactionId: f.txn || null,
        receiptNumber: f.status === 'paid' ? `RCP-20250${dueDate.getMonth() + 1}-${1000 + i}` : null,
        status: f.status,
        month: f.month,
        year: f.year,
        verifiedBy: f.status === 'paid' ? wardenUser._id : null
      });
    }

    // Notices
    const noticeConfigs = [
      { title: '📢 Hostel Annual Cultural Night & Dinner', content: 'Fest Euphoria 2025 scheduled for 25th March.', category: 'events', priority: 'important', targetAudience: 'all', isPinned: true },
      { title: '⚠️ Water Tank Cleaning Schedule (Block A & B)', content: 'Sanitization Saturday from 9 AM to 1 PM.', category: 'maintenance', priority: 'urgent', targetAudience: 'all', isPinned: true }
    ];

    for (const n of noticeConfigs) {
      await Notice.create({ ...n, author: wardenUser._id, isActive: true, views: 25 });
    }

    console.log('\n======================================================');
    console.log('🎉 HOSTELHIVE 2-ROLE DATABASE SEEDED!');
    console.log('======================================================');
    console.log('👤 Warden Login:  warden@hostelhive.com | Pass: warden123');
    console.log('👤 Student Login: rahul@student.com     | Pass: student123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeder Failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
