import express from 'express';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBrands);
router.post('/', optionalAuth, createBrand);
router.patch('/:id', optionalAuth, updateBrand);
router.put('/:id', optionalAuth, updateBrand);
router.delete('/:id', optionalAuth, deleteBrand);

export default router;
