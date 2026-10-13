import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  actualPrice: { type: Number, default: 0 },
  offerPrice: { type: Number, required: true },
  image: { type: String, default: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80' },
  tagBadge: { type: String, default: '⭐ Deal of the Day' },
  isActive: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  order: { type: Number, default: 0 },
}, { timestamps: true });

OfferSchema.pre('save', function () {
  if (this.isModified('isActive') && !this.isModified('status')) {
    this.status = this.isActive ? 'ACTIVE' : 'INACTIVE';
  } else if (this.isModified('status') && !this.isModified('isActive')) {
    this.isActive = this.status === 'ACTIVE';
  }
});

export const Offer = mongoose.model('Offer', OfferSchema);
export default Offer;
