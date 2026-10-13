import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerEmail: { type: String, default: '' },
  category: { type: String, default: 'General Grocery' },
  phone: { type: String, default: '' },
  openingTime: { type: String, default: '07:00 AM' },
  closingTime: { type: String, default: '10:00 PM' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'TEMPORARILY_CLOSED'],
    default: 'ACTIVE',
  },
  rating: { type: Number, default: 4.8 },
  totalSales: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  displayPassword: { type: String, default: '' },
}, { timestamps: true });

export const Shop = mongoose.model('Shop', ShopSchema);
export default Shop;
