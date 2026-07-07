const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch goals' });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, type, deadline, status, progress } = req.body;

    const goal = await prisma.goal.create({
      data: {
        title,
        type: type || 'Daily',
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'Pending',
        progress: progress ? parseInt(progress) : 0,
        userId
      }
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create goal' });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, type, deadline, status, progress } = req.body;

    const existing = await prisma.goal.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Not found' });
    }

    const goal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: {
        title: title !== undefined ? title : existing.title,
        type: type !== undefined ? type : existing.type,
        deadline: deadline !== undefined ? new Date(deadline) : existing.deadline,
        status: status !== undefined ? status : existing.status,
        progress: progress !== undefined ? parseInt(progress) : existing.progress,
      }
    });

    if (status === 'Completed' && existing.status !== 'Completed') {
      await awardXP(userId, 20);
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update goal' });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.goal.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Not found' });
    }

    await prisma.goal.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete' });
  }
};
