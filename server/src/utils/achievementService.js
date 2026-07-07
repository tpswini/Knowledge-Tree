const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { id: 'first_card', title: 'First Knowledge Card', description: 'Create your very first Knowledge Card.', icon: 'Seedling' },
  { id: '10_cards', title: 'Novice Learner', description: 'Create 10 Knowledge Cards.', icon: 'Sprout' },
  { id: '100_cards', title: 'Scholar', description: 'Create 100 Knowledge Cards.', icon: 'TreePine' },
  { id: '7_day_streak', title: 'Consistency', description: 'Maintain a 7-Day learning streak.', icon: 'Flame' },
  { id: '30_day_streak', title: 'Unstoppable', description: 'Maintain a 30-Day learning streak.', icon: 'Zap' },
  { id: '100_study_hours', title: 'Deep Thinker', description: 'Accumulate 100 Study Hours.', icon: 'Hourglass' },
  { id: 'first_goal', title: 'Goal Setter', description: 'Complete your first learning goal.', icon: 'Target' },
  { id: '5_goals', title: 'Goal Crusher', description: 'Complete 5 learning goals.', icon: 'Target' },
  { id: 'first_journal', title: 'Reflective', description: 'Write your first Daily Journal entry.', icon: 'Book' },
  { id: '5_journals', title: 'Journalist', description: 'Write 5 Daily Journal entries.', icon: 'BookOpen' }
];

exports.getUserAchievements = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      cards: true,
      goals: true,
      journals: true
    }
  });

  if (!user) return [];

  const unlockedIds = new Set();
  
  const totalCards = user.cards.length;
  const completedGoals = user.goals.filter(g => g.status === 'Completed').length;
  const totalJournals = user.journals.length;

  // Card Milestones
  if (totalCards >= 1) unlockedIds.add('first_card');
  if (totalCards >= 10) unlockedIds.add('10_cards');
  if (totalCards >= 100) unlockedIds.add('100_cards');

  // Streak Milestones
  if (user.learningStreak >= 7) unlockedIds.add('7_day_streak');
  if (user.learningStreak >= 30) unlockedIds.add('30_day_streak');

  // Study Hours 
  const cardMinutes = user.cards.reduce((acc, c) => acc + (c.timeSpent || 0), 0);
  const totalStudyHours = (user.studyHours || 0) + (cardMinutes / 60);
  if (totalStudyHours >= 100) unlockedIds.add('100_study_hours');

  // Goal Milestones
  if (completedGoals >= 1) unlockedIds.add('first_goal');
  if (completedGoals >= 5) unlockedIds.add('5_goals');

  // Journal Milestones
  if (totalJournals >= 1) unlockedIds.add('first_journal');
  if (totalJournals >= 5) unlockedIds.add('5_journals');

  // Format response
  const results = ACHIEVEMENTS.map(ach => ({
    ...ach,
    unlocked: unlockedIds.has(ach.id)
  }));

  return results;
};
