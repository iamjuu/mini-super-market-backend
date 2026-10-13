import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', optionalAuth, createCategory);
router.patch('/:id', optionalAuth, updateCategory);
router.put('/:id', optionalAuth, updateCategory);
router.delete('/:id', optionalAuth, deleteCategory);

export default router;
