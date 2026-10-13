import Subcategory from '../models/Subcategory.js';
import { logActivity } from '../middleware/activityLogger.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const getSubcategories = async (req, res, next) => {
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

    const subcategories = await Subcategory.find(query)
      .populate('categoryId', 'name slug deliveryPrice image')
      .populate('allowedUnitIds', 'name symbol')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: subcategories,
    });
  } catch (err) {
    next(err);
  }
};

export const createSubcategory = async (req, res, next) => {
  try {
    const { name, categoryId, description, allowedUnitIds, image, isActive, status } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory name and parent category are required.',
      });
    }

    let slug = slugify(name);
    let count = 1;
    while (await Subcategory.findOne({ slug })) {
      slug = `${slugify(name)}-${count++}`;
    }

    const subcategory = await Subcategory.create({
      name: name.trim(),
      slug,
      categoryId,
      description: description ? description.trim() : '',
      allowedUnitIds: Array.isArray(allowedUnitIds) ? allowedUnitIds : [],
      image: image || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      status: status || (isActive !== false ? 'ACTIVE' : 'INACTIVE'),
    });

    await subcategory.populate([
      { path: 'categoryId', select: 'name slug' },
      { path: 'allowedUnitIds', select: 'name symbol' },
    ]);

    await logActivity(req, {
      action: 'SUBCATEGORY_CREATED',
      resourceType: 'Subcategory',
      resourceId: subcategory._id,
      payload: { name: subcategory.name, categoryId },
    });

    return res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSubcategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, categoryId, description, allowedUnitIds, image, isActive, status } = req.body;

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    if (name && name.trim() !== subcategory.name) {
      subcategory.name = name.trim();
      let newSlug = slugify(name);
      let count = 1;
      while (await Subcategory.findOne({ slug: newSlug, _id: { $ne: id } })) {
        newSlug = `${slugify(name)}-${count++}`;
      }
      subcategory.slug = newSlug;
    }

    if (categoryId) subcategory.categoryId = categoryId;
    if (description !== undefined) subcategory.description = description.trim();
    if (allowedUnitIds !== undefined) subcategory.allowedUnitIds = allowedUnitIds;
    if (image !== undefined) subcategory.image = image;
    if (isActive !== undefined) {
      subcategory.isActive = Boolean(isActive);
      subcategory.status = subcategory.isActive ? 'ACTIVE' : 'INACTIVE';
    }
    if (status) {
      subcategory.status = status.toUpperCase();
      subcategory.isActive = subcategory.status === 'ACTIVE';
    }

    await subcategory.save();
    await subcategory.populate([
      { path: 'categoryId', select: 'name slug' },
      { path: 'allowedUnitIds', select: 'name symbol' },
    ]);

    await logActivity(req, {
      action: 'SUBCATEGORY_UPDATED',
      resourceType: 'Subcategory',
      resourceId: subcategory._id,
      payload: { name: subcategory.name, status: subcategory.status },
    });

    return res.status(200).json({
      success: true,
      message: 'Subcategory updated successfully',
      data: subcategory,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSubcategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subcategory = await Subcategory.findByIdAndDelete(id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    await logActivity(req, {
      action: 'SUBCATEGORY_DELETED',
      resourceType: 'Subcategory',
      resourceId: id,
      payload: { name: subcategory.name },
    });

    return res.status(200).json({
      success: true,
      message: 'Subcategory removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory };
