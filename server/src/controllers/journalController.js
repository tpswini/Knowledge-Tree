const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { awardXP } = require('../utils/xpService');

exports.getJournals = async (req, res) => {
  try {
    const userId = req.user.id;
    const journals = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    res.json(journals);
  } catch (error) {
    console.error('Get journals error:', error);
    res.status(500).json({ message: 'Failed to fetch journals' });
  }
};

exports.createJournal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { whatILearned, biggestChallenge, questions, tomorrowsGoal, mood, date } = req.body;

    const journal = await prisma.journalEntry.create({
      data: {
        whatILearned: whatILearned || '',
        biggestChallenge: biggestChallenge || '',
        questions: questions || '',
        tomorrowsGoal: tomorrowsGoal || '',
        mood: mood || 'Neutral',
        date: date ? new Date(date) : undefined,
        userId
      }
    });

    // Award +8 XP for writing a journal
    await awardXP(userId, 8);

    res.status(201).json(journal);
  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({ message: 'Failed to create journal' });
  }
};

exports.updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.journalEntry.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Not found' });
    }

    const journal = await prisma.journalEntry.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update journal' });
  }
};

exports.deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.journalEntry.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Not found' });
    }

    await prisma.journalEntry.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete' });
  }
};
