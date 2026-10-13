import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'HIGH_ACTIVITY', 'NEW'],
    default: 'ACTIVE',
  },
  orderCount: { type: Number, default: 0 },
  totalSpending: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  registrationDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const Customer = mongoose.model('Customer', CustomerSchema);
export default Customer;
