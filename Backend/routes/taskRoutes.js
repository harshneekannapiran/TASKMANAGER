const express = require('express');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth'); // ✅ Fixed

const router = express.Router();

// Protect all routes after this middleware
router.use(protect); // ✅ Now this works

router
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router
  .route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

router.route('/stats').get(taskController.getTaskStats);
router.route('/date/:date').get(taskController.getTasksByDate);

// Unread messages count
router.route('/messages/unread-count').get(taskController.getUnreadMessageCount);
router.route('/messages/unread').get(taskController.getUnreadMessages);
router.route('/messages/:messageId').delete(taskController.deleteMessage);

// Task messages
router.route('/:id/messages')
  .get(taskController.getTaskMessages)
  .post(taskController.createTaskMessage);

router.route('/:id/messages/read')
  .patch(taskController.markTaskMessagesRead);

module.exports = router;
