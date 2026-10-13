import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/userController.js';
import {
  getUserOrders,
  createRazorpayOrder,
  checkout,
} from '../controllers/orderController.js';
import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// User Profile
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// User Addresses
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/addresses/:id/default', setDefaultAddress);

// User Orders
router.get('/orders', getUserOrders);
router.post('/orders/razorpay-order', createRazorpayOrder);
router.post('/orders/checkout', checkout);

// User Cart
router.get('/cart', getCart);
router.post('/cart/items', addItem);
router.put('/cart/items/:id', updateItemQuantity);
router.delete('/cart/items/:id', removeItem);
router.delete('/cart', clearCart);

export default router;
