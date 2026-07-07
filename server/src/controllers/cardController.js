const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { awardXP } = require('../utils/xpService');

exports.createCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, explanation, source, category, tags, difficulty, timeSpent, mood, attachments, content } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const card = await prisma.knowledgeCard.create({
      data: {
        title,
        explanation,
        source,
        category,
        tags,
        difficulty,
        timeSpent: timeSpent ? parseInt(timeSpent) : null,
        mood,
        attachments,
        content,
        userId
      }
    });

    // Award +10 XP for creating a card
    await awardXP(userId, 10);

    res.status(201).json(card);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ message: 'Failed to create card' });
  }
};

exports.getCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const cards = await prisma.knowledgeCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(cards);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ message: 'Failed to fetch cards' });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Verify ownership
    const existing = await prisma.knowledgeCard.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Card not found or unauthorized' });
    }

    if (updateData.timeSpent) updateData.timeSpent = parseInt(updateData.timeSpent);

    const card = await prisma.knowledgeCard.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(card);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ message: 'Failed to update card' });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.knowledgeCard.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Card not found or unauthorized' });
    }

    await prisma.knowledgeCard.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Card deleted' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ message: 'Failed to delete card' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.knowledgeCard.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== userId) return res.status(404).json({ message: 'Not found' });

    const card = await prisma.knowledgeCard.update({
      where: { id: parseInt(id) },
      data: { isFavorite: !existing.isFavorite }
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle favorite' });
  }
};

exports.toggleArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.knowledgeCard.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== userId) return res.status(404).json({ message: 'Not found' });

    const card = await prisma.knowledgeCard.update({
      where: { id: parseInt(id) },
      data: { isArchived: !existing.isArchived }
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle archive' });
  }
};

exports.duplicateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.knowledgeCard.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== userId) return res.status(404).json({ message: 'Not found' });

    const newCard = await prisma.knowledgeCard.create({
      data: {
        title: `${existing.title} (Copy)`,
        explanation: existing.explanation,
        source: existing.source,
        category: existing.category,
        tags: existing.tags,
        difficulty: existing.difficulty,
        timeSpent: existing.timeSpent,
        mood: existing.mood,
        attachments: existing.attachments,
        content: existing.content,
        userId
      }
    });
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ message: 'Failed to duplicate card' });
  }
};
