import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getActivityLogs);

export default router;
