import express from 'express';
import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from '../controllers/unitController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getUnits);
router.post('/', optionalAuth, createUnit);
router.patch('/:id', optionalAuth, updateUnit);
router.put('/:id', optionalAuth, updateUnit);
router.delete('/:id', optionalAuth, deleteUnit);

export default router;
