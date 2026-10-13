const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'hostelhive_super_secret_jwt_key_2024',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc Register user
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, phone } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: `User with email '${cleanEmail}' already exists.`
    });
  }

  const user = await User.create({
    fullName,
    email: cleanEmail,
    password,
    role: role || 'student',
    phone
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    }
  });
});

// @desc Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: `No account found with email '${cleanEmail}'. Please check spelling or register.`
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Contact warden office.'
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password. Please try again.'
    });
  }

  user.lastLogin = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: `Welcome back, ${user.fullName}!`,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
      token: generateToken(user._id, user.role)
    }
  });
});

// @desc Get user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json({ success: true, data: user });
});

// @desc Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.fullName = req.body.fullName || user.fullName;
  user.phone = req.body.phone || user.phone;
  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id, updatedUser.role)
    }
  });
});

// @desc Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: { token: generateToken(user._id, user.role) }
  });
});

// @desc Get all users (Warden / Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc Toggle active status
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
    data: user
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus
};
