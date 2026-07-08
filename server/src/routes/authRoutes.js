const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, verifyEmail, resendVerification } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);

module.exports = router;
