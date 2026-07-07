const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getJournals, createJournal, updateJournal, deleteJournal } = require('../controllers/journalController');

const router = express.Router();

router.route('/')
  .get(protect, getJournals)
  .post(protect, createJournal);

router.route('/:id')
  .put(protect, updateJournal)
  .delete(protect, deleteJournal);

module.exports = router;
