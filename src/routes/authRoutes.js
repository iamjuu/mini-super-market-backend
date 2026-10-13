import express from 'express';
import {
  login,
  verifyOtp,
  resendOtp,
  register,
  getMe,
  logout,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/register', register);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);

export default router;
