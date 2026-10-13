import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getDashboardMetrics);

export default router;
