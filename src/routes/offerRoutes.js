import express from 'express';
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/offerController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getOffers);
router.post('/', optionalAuth, createOffer);
router.patch('/:id', optionalAuth, updateOffer);
router.put('/:id', optionalAuth, updateOffer);
router.delete('/:id', optionalAuth, deleteOffer);

export default router;
