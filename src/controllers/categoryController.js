import Category from '../models/Category.js';
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

export const getCategories = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const categories = await Category.find(query).sort({ order: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, image, deliveryPrice, isActive, status } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    let slug = slugify(name);
    let count = 1;
    while (await Category.findOne({ slug })) {
      slug = `${slugify(name)}-${count++}`;
    }

    const uploadedImage = await processSingleImage(image, 'shamil_marketplace/categories');

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      icon: icon || 'Boxes',
      image: uploadedImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      deliveryPrice: Number(deliveryPrice) || 30,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      status: status || (isActive !== false ? 'ACTIVE' : 'INACTIVE'),
    });

    await logActivity(req, {
      action: 'CATEGORY_CREATED',
      resourceType: 'Category',
      resourceId: category._id,
      payload: { name: category.name, slug: category.slug },
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon, image, deliveryPrice, isActive, status } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (name && name.trim() !== category.name) {
      category.name = name.trim();
      let newSlug = slugify(name);
      let count = 1;
      while (await Category.findOne({ slug: newSlug, _id: { $ne: id } })) {
        newSlug = `${slugify(name)}-${count++}`;
      }
      category.slug = newSlug;
    }

    if (description !== undefined) category.description = description.trim();
    if (icon) category.icon = icon;
    if (image !== undefined) {
      category.image = await processSingleImage(image, 'shamil_marketplace/categories');
    }
    if (deliveryPrice !== undefined) category.deliveryPrice = Number(deliveryPrice);
    if (isActive !== undefined) {
      category.isActive = Boolean(isActive);
      category.status = category.isActive ? 'ACTIVE' : 'INACTIVE';
    }
    if (status) {
      category.status = status.toUpperCase();
      category.isActive = category.status === 'ACTIVE';
    }

    await category.save();

    await logActivity(req, {
      action: 'CATEGORY_UPDATED',
      resourceType: 'Category',
      resourceId: category._id,
      payload: { name: category.name, status: category.status },
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await logActivity(req, {
      action: 'CATEGORY_DELETED',
      resourceType: 'Category',
      resourceId: id,
      payload: { name: category.name },
    });

    return res.status(200).json({
      success: true,
      message: 'Category removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
