import express from 'express';
import {
  getNotifications,
  createNotification,
  deleteNotification,
} from '../controllers/notificationController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getNotifications);
router.post('/', optionalAuth, createNotification);
router.delete('/:id', optionalAuth, deleteNotification);

export default router;
