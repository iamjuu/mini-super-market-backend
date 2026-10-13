import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Boxes' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80' },
  deliveryPrice: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  order: { type: Number, default: 0 },
}, { timestamps: true });

CategorySchema.pre('save', function () {
  if (this.isModified('isActive') && !this.isModified('status')) {
    this.status = this.isActive ? 'ACTIVE' : 'INACTIVE';
  } else if (this.isModified('status') && !this.isModified('isActive')) {
    this.isActive = this.status === 'ACTIVE';
  }
});

export const Category = mongoose.model('Category', CategorySchema);
export default Category;
