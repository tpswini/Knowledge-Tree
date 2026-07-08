const express = require('express');
const { adminLogin, getAllUsers, getUserDetails, deleteUser } = require('../controllers/adminController');
const { adminProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/users', adminProtect, getAllUsers);
router.get('/users/:id', adminProtect, getUserDetails);
router.delete('/users/:id', adminProtect, deleteUser);

module.exports = router;
