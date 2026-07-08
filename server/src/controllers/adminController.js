const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'knowledge_tree_super_secret_key';

exports.adminLogin = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (id === 'Admin' && password === 'Admin@123') {
      const token = jwt.sign({ id: 'admin', isAdmin: true }, JWT_SECRET, { expiresIn: '1d' });
      return res.status(200).json({
        message: 'Admin logged in successfully',
        token,
        user: { id: 'admin', name: 'Administrator', isAdmin: true }
      });
    }

    return res.status(401).json({ message: 'Invalid Admin credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        xp: true,
        learningStreak: true,
        studyHours: true,
        lastActiveDate: true,
        createdAt: true,
        _count: {
          select: {
            cards: true,
            journals: true,
            goals: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cards: {
            orderBy: { createdAt: 'desc' }
        },
        journals: {
            orderBy: { date: 'desc' }
        },
        goals: {
            orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Since onDelete: Cascade is configured in the schema,
    // deleting the user will also delete their cards, journals, and goals.
    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
