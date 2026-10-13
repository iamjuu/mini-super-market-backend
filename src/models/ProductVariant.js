import mongoose from 'mongoose';

const ProductVariantSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  quantity: { type: Number, required: true },
  sku: { type: String, default: '' },
  price: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
}, { timestamps: true });

ProductVariantSchema.pre('save', function () {
  if (this.isModified('isActive') && !this.isModified('status')) {
    this.status = this.isActive ? 'ACTIVE' : 'INACTIVE';
  } else if (this.isModified('status') && !this.isModified('isActive')) {
    this.isActive = this.status === 'ACTIVE';
  }
});

export const ProductVariant = mongoose.model('ProductVariant', ProductVariantSchema);
export default ProductVariant;
