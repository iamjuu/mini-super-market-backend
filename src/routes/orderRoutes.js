import express from 'express';
import {
  createRazorpayOrder,
  checkout,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// User checkout & order endpoints
router.post('/razorpay-order', authenticate, createRazorpayOrder);
router.post('/checkout', authenticate, checkout);
router.get('/my-orders', authenticate, getUserOrders);

// Admin & operations telemetry
router.get('/', optionalAuth, getAdminOrders);
router.patch('/:id/status', optionalAuth, updateOrderStatus);
router.patch('/:id', optionalAuth, updateOrderStatus);
router.put('/:id', optionalAuth, updateOrderStatus);

export default router;
