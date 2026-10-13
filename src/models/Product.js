import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryName: { type: String, default: '' },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  subcategoryName: { type: String, default: '' },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  brandName: { type: String, default: '' },
  price: { type: Number, required: true, default: 0 },
  mrp: { type: Number, default: 0 },
  originalPrice: { type: Number, default: 0 },
  unit: { type: String, default: 'piece' },
  description: { type: String, default: 'Verified supermarket product available in-store.' },
  image: { type: String, default: '' },
  images: [{ type: String }],
  deliveryPrice: { type: Number, default: null },
  isBestOffer: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  stockQuantity: { type: Number, default: 100 },
  inStock: { type: Boolean, default: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
}, { timestamps: true });

ProductSchema.pre('save', function () {
  if (this.isModified('isActive') && !this.isModified('status')) {
    this.status = this.isActive ? 'ACTIVE' : 'INACTIVE';
  } else if (this.isModified('status') && !this.isModified('isActive')) {
    this.isActive = this.status === 'ACTIVE';
  }
  if (!this.image && this.images && this.images.length > 0) {
    this.image = this.images[0];
  }
});

export const Product = mongoose.model('Product', ProductSchema);
export default Product;
