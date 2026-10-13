import express from 'express';
import {
  getAppearance,
  updateAppearance,
  getSettings,
  updateSettings,
  getFeatureFlags,
  updateFeatureFlags,
} from '../controllers/platformController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/appearance', getAppearance);
router.patch('/appearance', optionalAuth, updateAppearance);
router.put('/appearance', optionalAuth, updateAppearance);

router.get('/settings', getSettings);
router.patch('/settings', optionalAuth, updateSettings);
router.put('/settings', optionalAuth, updateSettings);

router.get('/features', getFeatureFlags);
router.patch('/features', optionalAuth, updateFeatureFlags);
router.put('/features', optionalAuth, updateFeatureFlags);

export default router;
