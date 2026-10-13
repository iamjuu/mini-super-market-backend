import express from 'express';
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/subcategoryController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSubcategories);
router.post('/', optionalAuth, createSubcategory);
router.patch('/:id', optionalAuth, updateSubcategory);
router.put('/:id', optionalAuth, updateSubcategory);
router.delete('/:id', optionalAuth, deleteSubcategory);

export default router;
