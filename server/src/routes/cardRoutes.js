const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  createCard, 
  getCards, 
  updateCard, 
  deleteCard, 
  toggleFavorite, 
  toggleArchive, 
  duplicateCard 
} = require('../controllers/cardController');

const router = express.Router();

router.route('/')
  .post(protect, createCard)
  .get(protect, getCards);

router.route('/:id')
  .put(protect, updateCard)
  .delete(protect, deleteCard);

router.put('/:id/favorite', protect, toggleFavorite);
router.put('/:id/archive', protect, toggleArchive);
router.post('/:id/duplicate', protect, duplicateCard);

module.exports = router;
