import express from 'express';
import {
  getShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
} from '../controllers/shopController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getShops);
router.get('/:id', getShopById);
router.post('/', optionalAuth, createShop);
router.patch('/:id', optionalAuth, updateShop);
router.put('/:id', optionalAuth, updateShop);
router.delete('/:id', optionalAuth, deleteShop);

export default router;
