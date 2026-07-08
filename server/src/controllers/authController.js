const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { checkAndAwardAchievements } = require('../utils/achievementService');
const { awardXP } = require('../utils/xpService');
const { sendPasswordResetEmail } = require('../utils/emailService');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'knowledge_tree_super_secret_key';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '1d',
  });
};


exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Daily Login & Streak Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newStreak = user.learningStreak || 0;
    let xpToAward = 0;
    
    if (!user.lastActiveDate) {
      newStreak = 1;
      xpToAward += 5; // First time login bonus
    } else {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
        xpToAward += 5; // Daily login
      } else if (diffDays > 1) {
        newStreak = 1;
        xpToAward += 5; // Reset streak, but get daily login
      }
    }

    if (newStreak > 0 && newStreak % 7 === 0 && newStreak !== user.learningStreak) {
      xpToAward += 100; // 7-day streak bonus
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        learningStreak: newStreak,
        lastActiveDate: new Date()
      }
    });

    if (xpToAward > 0) {
      const { awardXP } = require('../utils/xpService');
      await awardXP(user.id, xpToAward);
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, level: user.level, xp: user.xp, learningStreak: user.learningStreak } });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return res.status(200).json({ message: 'If an account with that email exists, we have sent a reset link.' });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
    
    // Get the client URL from env or use default localhost
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Send the email
    const result = await sendPasswordResetEmail(email, resetToken, clientUrl);
    
    if (!result.success) {
      return res.status(500).json({ message: `Failed to send reset email: ${result.error}` });
    }

    res.status(200).json({ message: 'If an account with that email exists, we have sent a reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    console.error('Token received:', req.body.token);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Internal server error or invalid token' });
  }
};
