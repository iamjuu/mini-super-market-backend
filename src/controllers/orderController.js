import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Customer from '../models/Customer.js';
import { emitEvent } from '../config/socket.js';
import { logActivity } from '../middleware/activityLogger.js';

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { clientAmount, clientDeliveryFee, clientItems } = req.body;
    const total = (Number(clientAmount) || 0) + (Number(clientDeliveryFee) || 0);

    // Mock Razorpay gateway order format for instant local run
    const fakeOrderId = `order_rzp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    return res.status(200).json({
      success: true,
      message: 'Payment order initiated',
      data: {
        id: fakeOrderId,
        amount: Math.round(total * 100), // in paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const checkout = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const {
      paymentMethod = 'RAZORPAY',
      deliveryAddress,
      notes,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      clientItems = [],
      clientTotal = 0,
      clientDeliveryFee = 0,
      clientDiscount = 0,
    } = req.body;

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ userId });
    }

    // Use cart items if available, or clientItems fallback
    const itemsSource = cart && cart.items && cart.items.length > 0 ? cart.items : clientItems;

    if (!itemsSource || itemsSource.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add items before checking out.',
      });
    }

    const orderItems = itemsSource.map((it) => ({
      productId: String(it.productId || it._id || it.id),
      name: it.name,
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
      image: it.image || '',
      category: it.category || 'General',
      deliveryPrice: Number(it.deliveryPrice) || 30,
    }));

    const subtotal = orderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const deliveryFee = cart ? cart.deliveryFee : Number(clientDeliveryFee) || 30;
    const discount = cart ? cart.discount : Number(clientDiscount) || 0;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const totalAmount = Math.max(0, subtotal + deliveryFee + tax - discount);

    const platformCommission = Math.round(subtotal * 0.1); // 10% platform fee
    const shopSettlement = subtotal - platformCommission;

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const order = await Order.create({
      orderNumber,
      userId: userId || null,
      customerName: req.user?.name || deliveryAddress?.name || 'Customer',
      customerEmail: req.user?.email || '',
      customerPhone: req.user?.phone || deliveryAddress?.phone || '',
      shopName: 'Al Salhiya Marketplace',
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      discount,
      totalAmount,
      platformCommission,
      shopSettlement,
      paymentMethod,
      paymentStatus: 'PAID',
      razorpayOrderId: razorpayOrderId || `rzp_mock_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
      razorpaySignature: razorpaySignature || '',
      deliveryAddress: deliveryAddress || (req.user?.addresses?.[0] || {}),
      notes: notes || '',
      status: 'PLACED',
      placedAt: new Date(),
    });

    // Clear cart if user is logged in
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      cart.deliveryFee = 0;
      cart.discount = 0;
      cart.totalAmount = 0;
      await cart.save();
    }

    // Update customer stats
    if (userId) {
      await Customer.findOneAndUpdate(
        { userId },
        {
          $inc: { orderCount: 1, totalSpending: totalAmount },
          $set: { status: 'ACTIVE' },
        },
        { upsert: true }
      );
    }

    // Real-time broadcast
    emitEvent('order:created', order);

    await logActivity(req, {
      action: 'ORDER_PLACED',
      resourceType: 'Order',
      resourceId: order._id,
      payload: { orderNumber: order.orderNumber, totalAmount: order.totalAmount },
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).sort({ placedAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const { tab = 'pending', search, page = 1, limit = 7 } = req.query;
    const query = {};

    if (tab === 'pending') {
      query.status = { $in: ['PLACED', 'CONFIRMED', 'PREPARING'] };
    } else if (tab === 'in-progress') {
      query.status = { $in: ['READY_FOR_PICKUP', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] };
    } else if (tab === 'completed') {
      query.status = { $in: ['DELIVERED', 'CANCELLED', 'DISPUTED'] };
    } else if (tab !== 'all') {
      query.status = tab.toUpperCase();
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { shopName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageSize = parseInt(limit, 10) || 7;
    const currentPage = parseInt(page, 10) || 1;
    const skip = (currentPage - 1) * pageSize;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ placedAt: -1 }).skip(skip).limit(pageSize),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: currentPage,
          pages: Math.ceil(total / pageSize) || 1,
          limit: pageSize,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, deliveryPartnerName, deliveryPartnerPhone, deliveryDurationMinutes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (status) order.status = status.toUpperCase();
    if (deliveryPartnerName !== undefined) order.deliveryPartnerName = deliveryPartnerName;
    if (deliveryPartnerPhone !== undefined) order.deliveryPartnerPhone = deliveryPartnerPhone;
    if (deliveryDurationMinutes !== undefined) order.deliveryDurationMinutes = Number(deliveryDurationMinutes);

    await order.save();

    emitEvent('order:updated', order);

    await logActivity(req, {
      action: 'ORDER_STATUS_UPDATED',
      resourceType: 'Order',
      resourceId: order._id,
      payload: { orderNumber: order.orderNumber, status: order.status },
    });

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  createRazorpayOrder,
  checkout,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus,
};
