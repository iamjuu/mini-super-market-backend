import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Brand from '../models/Brand.js';
import { logActivity } from '../middleware/activityLogger.js';
import { processIncomingImages } from '../config/cloudinary.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      categoryId,
      subcategoryId,
      brandId,
      shopId,
      status,
      search,
      isBestOffer,
      limit,
      page = 1,
    } = req.query;

    const query = {};

    if (categoryId && categoryId !== 'ALL') query.categoryId = categoryId;
    if (subcategoryId && subcategoryId !== 'ALL') query.subcategoryId = subcategoryId;
    if (brandId && brandId !== 'ALL') query.brandId = brandId;
    if (shopId) query.shopId = shopId;
    if (status && status !== 'ALL') query.status = status.toUpperCase();
    if (isBestOffer === 'true' || isBestOffer === true) query.isBestOffer = true;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } },
        { subcategoryName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageSize = limit ? parseInt(limit, 10) : 0;
    const skip = pageSize ? (parseInt(page, 10) - 1) * pageSize : 0;

    let productQuery = Product.find(query)
      .populate('categoryId', 'name slug deliveryPrice image')
      .populate('subcategoryId', 'name slug allowedUnitIds')
      .populate('brandId', 'name slug logo')
      .populate('shopId', 'name slug')
      .sort({ createdAt: -1 });

    if (pageSize) {
      productQuery = productQuery.skip(skip).limit(pageSize);
    }

    const [products, total] = await Promise.all([
      productQuery.exec(),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: pageSize
        ? {
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / pageSize) || 1,
            limit: pageSize,
          }
        : undefined,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product;

    // Check if id is valid mongo ObjectId or slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.populate([
      { path: 'categoryId', select: 'name slug deliveryPrice image' },
      { path: 'subcategoryId', select: 'name slug allowedUnitIds' },
      { path: 'brandId', select: 'name slug logo' },
      { path: 'shopId', select: 'name slug' },
    ]);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      categoryId,
      subcategoryId,
      brandId,
      price,
      mrp,
      unit,
      description,
      image,
      images,
      deliveryPrice,
      isBestOffer,
      isActive,
      status,
      stockQuantity,
      shopId,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required.',
      });
    }

    let slug = slugify(name);
    let count = 1;
    while (await Product.findOne({ slug })) {
      slug = `${slugify(name)}-${count++}`;
    }

    let catName = '';
    let subcatName = '';
    let bName = '';

    if (categoryId) {
      const cat = await Category.findById(categoryId);
      if (cat) catName = cat.name;
    }
    if (subcategoryId) {
      const subcat = await Subcategory.findById(subcategoryId);
      if (subcat) subcatName = subcat.name;
    }
    if (brandId) {
      const b = await Brand.findById(brandId);
      if (b) bName = b.name;
    }

    const rawImageList = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
    const imageList = await processIncomingImages(rawImageList, 'shamil_marketplace/products');

    const product = await Product.create({
      name: name.trim(),
      slug,
      categoryId: categoryId || null,
      categoryName: catName,
      subcategoryId: subcategoryId || null,
      subcategoryName: subcatName,
      brandId: brandId || null,
      brandName: bName,
      price: Number(price) || 0,
      mrp: mrp !== undefined ? Number(mrp) : Number(price),
      originalPrice: mrp !== undefined ? Number(mrp) : Number(price) * 1.25,
      unit: unit || 'piece',
      description: description ? description.trim() : 'Verified supermarket product available in-store.',
      image: imageList[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      images: imageList,
      deliveryPrice: deliveryPrice !== null && deliveryPrice !== undefined ? Number(deliveryPrice) : null,
      isBestOffer: Boolean(isBestOffer),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      status: status || (isActive !== false ? 'ACTIVE' : 'INACTIVE'),
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 100,
      inStock: stockQuantity !== 0,
      shopId: shopId || null,
    });

    await product.populate([
      { path: 'categoryId', select: 'name slug deliveryPrice image' },
      { path: 'subcategoryId', select: 'name slug' },
      { path: 'brandId', select: 'name slug' },
    ]);

    await logActivity(req, {
      action: 'PRODUCT_CREATED',
      resourceType: 'Product',
      resourceId: product._id,
      payload: { name: product.name, price: product.price },
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const {
      name,
      categoryId,
      subcategoryId,
      brandId,
      price,
      mrp,
      unit,
      description,
      image,
      images,
      deliveryPrice,
      isBestOffer,
      isActive,
      status,
      stockQuantity,
      shopId,
    } = req.body;

    if (name && name.trim() !== product.name) {
      product.name = name.trim();
      let newSlug = slugify(name);
      let count = 1;
      while (await Product.findOne({ slug: newSlug, _id: { $ne: id } })) {
        newSlug = `${slugify(name)}-${count++}`;
      }
      product.slug = newSlug;
    }

    if (categoryId !== undefined) {
      product.categoryId = categoryId || null;
      if (categoryId) {
        const cat = await Category.findById(categoryId);
        if (cat) product.categoryName = cat.name;
      } else {
        product.categoryName = '';
      }
    }

    if (subcategoryId !== undefined) {
      product.subcategoryId = subcategoryId || null;
      if (subcategoryId) {
        const subcat = await Subcategory.findById(subcategoryId);
        if (subcat) product.subcategoryName = subcat.name;
      } else {
        product.subcategoryName = '';
      }
    }

    if (brandId !== undefined) {
      product.brandId = brandId || null;
      if (brandId) {
        const b = await Brand.findById(brandId);
        if (b) product.brandName = b.name;
      } else {
        product.brandName = '';
      }
    }

    if (price !== undefined) product.price = Number(price);
    if (mrp !== undefined) {
      product.mrp = Number(mrp);
      product.originalPrice = Number(mrp);
    }
    if (unit !== undefined) product.unit = unit;
    if (description !== undefined) product.description = description.trim();
    if (images !== undefined && Array.isArray(images)) {
      const processedImages = await processIncomingImages(images, 'shamil_marketplace/products');
      product.images = processedImages;
      if (processedImages.length > 0) product.image = processedImages[0];
    } else if (image !== undefined) {
      const processedSingle = await processIncomingImages([image], 'shamil_marketplace/products');
      product.image = processedSingle[0] || image;
    }

    if (deliveryPrice !== undefined) {
      product.deliveryPrice = deliveryPrice !== null ? Number(deliveryPrice) : null;
    }
    if (isBestOffer !== undefined) product.isBestOffer = Boolean(isBestOffer);
    if (isActive !== undefined) {
      product.isActive = Boolean(isActive);
      product.status = product.isActive ? 'ACTIVE' : 'INACTIVE';
    }
    if (status) {
      product.status = status.toUpperCase();
      product.isActive = product.status === 'ACTIVE';
    }
    if (stockQuantity !== undefined) {
      product.stockQuantity = Number(stockQuantity);
      product.inStock = product.stockQuantity > 0;
    }
    if (shopId !== undefined) product.shopId = shopId || null;

    await product.save();
    await product.populate([
      { path: 'categoryId', select: 'name slug deliveryPrice image' },
      { path: 'subcategoryId', select: 'name slug' },
      { path: 'brandId', select: 'name slug' },
    ]);

    await logActivity(req, {
      action: 'PRODUCT_UPDATED',
      resourceType: 'Product',
      resourceId: product._id,
      payload: { name: product.name, price: product.price, isBestOffer: product.isBestOffer },
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Also remove associated variants
    await ProductVariant.deleteMany({ productId: id });

    await logActivity(req, {
      action: 'PRODUCT_DELETED',
      resourceType: 'Product',
      resourceId: id,
      payload: { name: product.name },
    });

    return res.status(200).json({
      success: true,
      message: 'Product and variants deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
