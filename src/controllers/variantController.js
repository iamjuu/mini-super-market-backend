import ProductVariant from '../models/ProductVariant.js';
import Product from '../models/Product.js';
import { logActivity } from '../middleware/activityLogger.js';

export const getVariantsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variants = await ProductVariant.find({ productId })
      .populate('unitId', 'name symbol')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: variants,
    });
  } catch (err) {
    next(err);
  }
};

export const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { unitId, quantity, sku, price, mrp, isActive, status } = req.body;

    if (!unitId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Unit and quantity are required for product variant.',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const variant = await ProductVariant.create({
      productId,
      unitId,
      quantity: Number(quantity),
      sku: sku ? sku.trim() : `${product.slug}-${quantity}`.toUpperCase(),
      price: price !== undefined ? Number(price) : product.price,
      mrp: mrp !== undefined ? Number(mrp) : product.mrp,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      status: status || (isActive !== false ? 'ACTIVE' : 'INACTIVE'),
    });

    await variant.populate('unitId', 'name symbol');

    await logActivity(req, {
      action: 'VARIANT_CREATED',
      resourceType: 'ProductVariant',
      resourceId: variant._id,
      payload: { productId, sku: variant.sku, quantity: variant.quantity },
    });

    return res.status(201).json({
      success: true,
      message: 'Product variant created successfully',
      data: variant,
    });
  } catch (err) {
    next(err);
  }
};

export const updateVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const variant = await ProductVariant.findById(id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found',
      });
    }

    const { unitId, quantity, sku, price, mrp, isActive, status } = req.body;

    if (unitId) variant.unitId = unitId;
    if (quantity !== undefined) variant.quantity = Number(quantity);
    if (sku !== undefined) variant.sku = sku.trim();
    if (price !== undefined) variant.price = Number(price);
    if (mrp !== undefined) variant.mrp = Number(mrp);
    if (isActive !== undefined) {
      variant.isActive = Boolean(isActive);
      variant.status = variant.isActive ? 'ACTIVE' : 'INACTIVE';
    }
    if (status) {
      variant.status = status.toUpperCase();
      variant.isActive = variant.status === 'ACTIVE';
    }

    await variant.save();
    await variant.populate('unitId', 'name symbol');

    await logActivity(req, {
      action: 'VARIANT_UPDATED',
      resourceType: 'ProductVariant',
      resourceId: variant._id,
      payload: { sku: variant.sku, isActive: variant.isActive },
    });

    return res.status(200).json({
      success: true,
      message: 'Variant updated successfully',
      data: variant,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const variant = await ProductVariant.findByIdAndDelete(id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found',
      });
    }

    await logActivity(req, {
      action: 'VARIANT_DELETED',
      resourceType: 'ProductVariant',
      resourceId: id,
      payload: { sku: variant.sku },
    });

    return res.status(200).json({
      success: true,
      message: 'Variant removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { getVariantsByProduct, createVariant, updateVariant, deleteVariant };
