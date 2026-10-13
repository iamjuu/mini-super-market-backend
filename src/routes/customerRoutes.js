import express from 'express';
import {
  getCustomers,
  getCustomerById,
} from '../controllers/customerController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getCustomers);
router.get('/:id', optionalAuth, getCustomerById);

export default router;
