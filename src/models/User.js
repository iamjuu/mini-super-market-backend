import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  landmark: { type: String, default: '' },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  isDefault: { type: Boolean, default: false },
  tag: { type: String, default: 'Home' }, // Home, Work, Other
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '', trim: true },
  role: {
    type: String,
    enum: ['MASTER_ADMIN', 'ADMIN', 'SHOP_OWNER', 'DELIVERY_PARTNER', 'CUSTOMER'],
    default: 'CUSTOMER',
  },
  isUser: {
    type: String,
    enum: ['master', 'admin', 'shop_owner', 'delivery_boy', 'user'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE',
  },
  permissions: [{ type: String }],
  otp: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  displayPassword: { type: String, default: null }, // plaintext display for auto-provisioned merchant accounts
  addresses: [AddressSchema],
  walletBalance: { type: Number, default: 0 },
}, { timestamps: true });

// Pre-save password hashing
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON transform (omit password and OTP)
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiresAt;
  return obj;
};

export const User = mongoose.model('User', UserSchema);
export default User;
