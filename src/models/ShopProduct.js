import mongoose from 'mongoose';

const ShopProductSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
  sellingPrice: { type: Number, required: true },
  stock: { type: Number, default: 50 },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

export const ShopProduct = mongoose.model('ShopProduct', ShopProductSchema);
export default ShopProduct;
