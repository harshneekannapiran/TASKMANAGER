const express = require('express');
const User = require('../models/User'); // <-- Add this line
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth'); // ✅ Use this

const router = express.Router(); // ✅ Declare router before using it

// Protect all routes after this middleware
router.use(protect); // ✅ use protect directly, not authController.protect

// Add this route to get all users (for assignee dropdown)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('name email');
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

router
  .route('/me')
  .get(userController.getUserProfile)
  .patch(userController.updateUserProfile)
  .delete(userController.deleteUserAccount);

module.exports = router;
