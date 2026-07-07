const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Level Thresholds
// Level 1: 0
// Level 2: 100
// Level 3: 250
// Level 4: 500
// Level 5: 900
// Beyond 5, we can use a formula or extend the array.
const LEVEL_THRESHOLDS = [0, 0, 100, 250, 500, 900, 1400, 2000, 2750, 3650, 4700];

/**
 * Calculates the appropriate level for a given amount of XP.
 */
const calculateLevel = (xp) => {
  let level = 1;
  for (let i = 2; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i;
    } else {
      break;
    }
  }
  // If they exceed our hardcoded array, just use a generic formula for higher levels
  if (level === LEVEL_THRESHOLDS.length - 1 && xp >= LEVEL_THRESHOLDS[level]) {
    while (xp >= getThresholdForLevel(level + 1)) {
      level++;
    }
  }
  return level;
};

const getThresholdForLevel = (level) => {
  if (level < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[level];
  }
  // Rough scaling for levels > 10
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + ((level - 10) * 1500);
};

/**
 * Awards XP to a user and updates their level if necessary.
 * @param {string} userId - The user's ID
 * @param {number} amount - The amount of XP to award
 */
const awardXP = async (userId, amount) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const newXp = user.xp + amount;
    const newLevel = calculateLevel(newXp);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel
      }
    });

    // We could emit a websocket event here if we wanted real-time "Level Up!" toasts, 
    // but for now updating the DB is sufficient.

    return updatedUser;
  } catch (error) {
    console.error('Failed to award XP:', error);
    return null;
  }
};

module.exports = {
  awardXP,
  calculateLevel,
  getThresholdForLevel,
  LEVEL_THRESHOLDS
};
