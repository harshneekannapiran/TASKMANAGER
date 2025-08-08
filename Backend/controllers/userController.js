const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get user profile
// @route   GET /api/v1/users/me
// @access  Private
exports.getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc    Update user profile
// @route   PATCH /api/v1/users/me
// @access  Private
exports.updateUserProfile = catchAsync(async (req, res, next) => {
  // Filter out unwanted fields
  const filteredBody = {};
  if (req.body.name) filteredBody.name = req.body.name;
  if (req.body.email) filteredBody.email = req.body.email;
  if (req.body.avatar) filteredBody.avatar = req.body.avatar;

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc    Delete user account
// @route   DELETE /api/v1/users/me
// @access  Private
exports.deleteUserAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});