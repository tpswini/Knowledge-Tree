require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'knowledge_tree_super_secret_key';
console.log('JWT_SECRET used:', JWT_SECRET);

const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '15m' });
console.log('Generated Token:', token);

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Decoded:', decoded);
} catch (error) {
  console.error('Error verifying:', error);
}
