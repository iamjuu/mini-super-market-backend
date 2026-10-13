import mongoose from 'mongoose';

const DeliveryPartnerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  vehicleType: { type: String, default: 'Bike' },
  vehicleNumber: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  kycStatus: {
    type: String,
    enum: ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'],
    default: 'VERIFIED',
  },
  rating: { type: Number, default: 4.9 },
  totalDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  currentLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
}, { timestamps: true });

export const DeliveryPartner = mongoose.model('DeliveryPartner', DeliveryPartnerSchema);
export default DeliveryPartner;
