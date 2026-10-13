import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  logo: { type: String, default: '' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
}, { timestamps: true });

BrandSchema.pre('save', function () {
  if (this.isModified('isActive') && !this.isModified('status')) {
    this.status = this.isActive ? 'ACTIVE' : 'INACTIVE';
  } else if (this.isModified('status') && !this.isModified('isActive')) {
    this.isActive = this.status === 'ACTIVE';
  }
});

export const Brand = mongoose.model('Brand', BrandSchema);
export default Brand;
