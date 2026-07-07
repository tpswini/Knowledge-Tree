const achievementService = require('../utils/achievementService');

exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievements = await achievementService.getUserAchievements(userId);
    res.status(200).json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Server error fetching achievements' });
  }
};
