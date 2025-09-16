const Task = require('../models/Task');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const Message = require('../models/Message');

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @access  Private
exports.getAllTasks = catchAsync(async (req, res, next) => {
  // Filter tasks by the logged-in user
  const features = new APIFeatures(
    Task.find({
      $and: [
        { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] },
        { $or: [{ team: { $exists: false } }, { team: null }] },
      ],
    }),
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
    $and: [
      { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] },
      { $or: [{ team: { $exists: false } }, { team: null }] },
    ],
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
      $and: [
        { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] },
        { $or: [{ team: { $exists: false } }, { team: null }] },
      ],
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
    $or: [{ team: { $exists: false } }, { team: null }],
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

// -----------------------
// Task Messages
// -----------------------

// @desc    Get messages for a task (only participants: creator or assignee)
// @route   GET /api/v1/tasks/:id/messages
// @access  Private
exports.getTaskMessages = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new AppError('No task found with that ID', 404));

  const isParticipant = [String(task.createdBy), String(task.assignedTo)].includes(String(req.user.id));
  if (!isParticipant) return next(new AppError('Forbidden', 403));

  const messages = await Message.find({ task: req.params.id })
    .sort({ createdAt: 1 })
    .populate('sender', 'name email')
    .populate('receiver', 'name email');

  res.status(200).json({ status: 'success', results: messages.length, data: { messages } });
});

// @desc    Create a message for a task (only participants)
// @route   POST /api/v1/tasks/:id/messages
// @access  Private
exports.createTaskMessage = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new AppError('No task found with that ID', 404));

  const isParticipant = [String(task.createdBy), String(task.assignedTo)].includes(String(req.user.id));
  if (!isParticipant) return next(new AppError('Forbidden', 403));

  const receiverId = String(task.createdBy) === String(req.user.id) ? task.assignedTo : task.createdBy;
  if (!receiverId) return next(new AppError('Task has no counterpart to message', 400));

  const message = await Message.create({
    task: task._id,
    sender: req.user.id,
    receiver: receiverId,
    text: req.body.text,
  });

  res.status(201).json({ status: 'success', data: { message } });
});

// @desc    Mark messages as read in a task conversation
// @route   PATCH /api/v1/tasks/:id/messages/read
// @access  Private
exports.markTaskMessagesRead = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new AppError('No task found with that ID', 404));

  const isParticipant = [String(task.createdBy), String(task.assignedTo)].includes(String(req.user.id));
  if (!isParticipant) return next(new AppError('Forbidden', 403));

  await Message.updateMany({ task: task._id, receiver: req.user.id, isRead: false }, { isRead: true });
  res.status(200).json({ status: 'success' });
});

// @desc    Get unread message count for current user
// @route   GET /api/v1/tasks/messages/unread-count
// @access  Private
exports.getUnreadMessageCount = catchAsync(async (req, res, next) => {
  const count = await Message.countDocuments({ receiver: req.user.id, isRead: false });
  res.status(200).json({ status: 'success', data: { count } });
});

// @desc    Get latest unread messages for current user
// @route   GET /api/v1/tasks/messages/unread
// @access  Private
exports.getUnreadMessages = catchAsync(async (req, res, next) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const messages = await Message.find({ receiver: req.user.id, isRead: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name email')
    .populate('task', 'title')

  res.status(200).json({ status: 'success', results: messages.length, data: { messages } })
});

// @desc    Delete a message (sender or receiver can delete)
// @route   DELETE /api/v1/tasks/messages/:messageId
// @access  Private
exports.deleteMessage = catchAsync(async (req, res, next) => {
  const msg = await Message.findById(req.params.messageId)
  if (!msg) return next(new AppError('Message not found', 404))
  const isParty = [String(msg.sender), String(msg.receiver)].includes(String(req.user.id))
  if (!isParty) return next(new AppError('Forbidden', 403))
  await Message.deleteOne({ _id: msg._id })
  res.status(204).json({ status: 'success', data: null })
});