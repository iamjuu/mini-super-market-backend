import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  image: { type: String, default: '' },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'piece' },
  category: { type: String, default: 'General' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  deliveryPrice: { type: Number, default: 30 },
}, { timestamps: true });

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
  subtotal: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

// Dynamic delivery fee calculation matching CartContext.jsx logic
CartSchema.methods.recalculate = function () {
  this.subtotal = this.items.reduce((acc, it) => acc + (it.price * it.quantity), 0);

  if (!this.items || this.items.length === 0) {
    this.deliveryFee = 0;
  } else {
    const categoryFees = new Map();
    for (const item of this.items) {
      const catKey = (item.categoryId || item.category || 'General').toString();
      const fee = typeof item.deliveryPrice === 'number' && item.deliveryPrice >= 0
        ? item.deliveryPrice
        : 30;
      if (!categoryFees.has(catKey) || categoryFees.get(catKey) < fee) {
        categoryFees.set(catKey, fee);
      }
    }
    let totalDelivery = 0;
    for (const fee of categoryFees.values()) {
      totalDelivery += fee;
    }
    this.deliveryFee = totalDelivery;
  }

  this.totalAmount = Math.max(0, this.subtotal + this.deliveryFee - (this.discount || 0));
  return this;
};

export const Cart = mongoose.model('Cart', CartSchema);
export default Cart;
