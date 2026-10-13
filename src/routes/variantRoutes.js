import express from 'express';
import {
  updateVariant,
  deleteVariant,
} from '../controllers/variantController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.patch('/:id', optionalAuth, updateVariant);
router.put('/:id', optionalAuth, updateVariant);
router.delete('/:id', optionalAuth, deleteVariant);

export default router;
