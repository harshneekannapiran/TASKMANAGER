const Task = require('../models/Task');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @access  Private
exports.getAllTasks = catchAsync(async (req, res, next) => {
  // Filter tasks by the logged-in user
  const features = new APIFeatures(
    Task.find({ $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tasks = await features.query;

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

// @desc    Get a single task
// @route   GET /api/v1/tasks/:id
// @access  Private
exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOne({
    _id: req.params.id,
    $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }],
  });

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

// @desc    Create a task
// @route   POST /api/v1/tasks
// @access  Private
exports.createTask = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user.id;

  const task = await Task.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      task,
    },
  });
});

// @desc    Update a task
// @route   PATCH /api/v1/tasks/:id
// @access  Private
exports.updateTask = catchAsync(async (req, res, next) => {
  // Always update updatedAt
  req.body.updatedAt = Date.now();
  
  // If task is being marked as completed, set completionTime
  if (req.body.status === 'completed') {
    req.body.completionTime = Date.now();
  }
  
  const task = await Task.findOneAndUpdate(
    {
      _id: req.params.id,
      $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }],
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user.id,
  });

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// @desc    Get task statistics
// @route   GET /api/v1/tasks/stats
// @access  Private
exports.getTaskStats = catchAsync(async (req, res, next) => {
  const stats = await Task.aggregate([
    {
      $match: {
        $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }],
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// @desc    Get tasks by date
// @route   GET /api/v1/tasks/date/:date
// @access  Private
exports.getTasksByDate = catchAsync(async (req, res, next) => {
  const date = new Date(req.params.date);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const tasks = await Task.find({
    $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }],
    dueDate: {
      $gte: date,
      $lt: nextDay,
    },
  });

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
    },
  });
});