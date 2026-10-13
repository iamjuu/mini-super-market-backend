import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, default: '' },
  category: { type: String, default: 'General' },
  deliveryPrice: { type: Number, default: 30 },
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, default: 'Guest Customer' },
  customerEmail: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
  shopName: { type: String, default: 'Al Salhiya Main Store' },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  platformCommission: { type: Number, default: 0 },
  shopSettlement: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['RAZORPAY', 'COD', 'WALLET'],
    default: 'RAZORPAY',
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'REFUNDED', 'FAILED'],
    default: 'PAID',
  },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  deliveryAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    landmark: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deliveryPartnerName: { type: String, default: '' },
  deliveryPartnerPhone: { type: String, default: '' },
  deliveryDurationMinutes: { type: Number, default: null },
  status: {
    type: String,
    enum: [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'ASSIGNED',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'DISPUTED',
    ],
    default: 'PLACED',
  },
  notes: { type: String, default: '' },
  placedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Order = mongoose.model('Order', OrderSchema);
export default Order;
