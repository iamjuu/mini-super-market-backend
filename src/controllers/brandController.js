import Brand from '../models/Brand.js';
import { logActivity } from '../middleware/activityLogger.js';
import { processSingleImage } from '../config/cloudinary.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const getBrands = async (req, res, next) => {
  try {
    const { categoryId, search, status } = req.query;
    const query = {};

    if (categoryId && categoryId !== 'ALL') {
      query.categoryId = categoryId;
    }
    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const brands = await Brand.find(query)
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (err) {
    next(err);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const { name, categoryId, logo, description, isActive, status } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required.',
      });
    }

    let slug = slugify(name);
    let count = 1;
    while (await Brand.findOne({ slug })) {
      slug = `${slugify(name)}-${count++}`;
    }

    const processedLogo = await processSingleImage(logo, 'shamil_marketplace/brands');

    const brand = await Brand.create({
      name: name.trim(),
      slug,
      categoryId: categoryId || null,
      logo: processedLogo || '',
      description: description ? description.trim() : '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      status: status || (isActive !== false ? 'ACTIVE' : 'INACTIVE'),
    });

    await brand.populate('categoryId', 'name slug');

    await logActivity(req, {
      action: 'BRAND_CREATED',
      resourceType: 'Brand',
      resourceId: brand._id,
      payload: { name: brand.name },
    });

    return res.status(201).json({
      success: true,
      message: 'Brand registered successfully',
      data: brand,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, categoryId, logo, description, isActive, status } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    if (name && name.trim() !== brand.name) {
      brand.name = name.trim();
      let newSlug = slugify(name);
      let count = 1;
      while (await Brand.findOne({ slug: newSlug, _id: { $ne: id } })) {
        newSlug = `${slugify(name)}-${count++}`;
      }
      brand.slug = newSlug;
    }

    if (categoryId !== undefined) brand.categoryId = categoryId;
    if (logo !== undefined) {
      brand.logo = await processSingleImage(logo, 'shamil_marketplace/brands');
    }
    if (description !== undefined) brand.description = description.trim();
    if (isActive !== undefined) {
      brand.isActive = Boolean(isActive);
      brand.status = brand.isActive ? 'ACTIVE' : 'INACTIVE';
    }
    if (status) {
      brand.status = status.toUpperCase();
      brand.isActive = brand.status === 'ACTIVE';
    }

    await brand.save();
    await brand.populate('categoryId', 'name slug');

    await logActivity(req, {
      action: 'BRAND_UPDATED',
      resourceType: 'Brand',
      resourceId: brand._id,
      payload: { name: brand.name, status: brand.status },
    });

    return res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    await logActivity(req, {
      action: 'BRAND_DELETED',
      resourceType: 'Brand',
      resourceId: id,
      payload: { name: brand.name },
    });

    return res.status(200).json({
      success: true,
      message: 'Brand removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { getBrands, createBrand, updateBrand, deleteBrand };
