require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'knowledge_tree_super_secret_key';

async function testReset() {
  try {
    // 1. Find a user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found in DB');
      return;
    }
    console.log('Testing with user:', user.email);

    // 2. Generate a reset token just like forgotPassword does
    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
    console.log('Generated token:', resetToken);

    // 3. Make the API call to reset password
    console.log('Calling API to reset password...');
    const res = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword: 'newPassword123' })
    });
    
    const data = await res.json();
    console.log('API Response status:', res.status);
    console.log('API Response data:', data);

  } catch (error) {
    console.error('Test script error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testReset();
