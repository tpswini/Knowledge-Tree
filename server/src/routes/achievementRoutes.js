const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, achievementController.getAchievements);

module.exports = router;
