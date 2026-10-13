import Offer from '../models/Offer.js';
import { logActivity } from '../middleware/activityLogger.js';
import { processSingleImage } from '../config/cloudinary.js';

export const getOffers = async (req, res, next) => {
  try {
    const { status, activeOnly } = req.query;
    const query = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    } else if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    const offers = await Offer.find(query).sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (err) {
    next(err);
  }
};

export const createOffer = async (req, res, next) => {
  try {
    const { title, description, actualPrice, offerPrice, image, tagBadge, isActive, status } = req.body;
    if (!title || offerPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Offer title and offer price are required.',
      });
    }

    const offerCount = await Offer.countDocuments();
    const processedImage = await processSingleImage(image, 'shamil_marketplace/offers');

    const offer = await Offer.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      actualPrice: actualPrice !== undefined ? Number(actualPrice) : Number(offerPrice),
      offerPrice: Number(offerPrice),
      image: processedImage || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80',
      tagBadge: tagBadge || '⭐ Deal of the Day',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      status: status || (isActive !== false ? 'ACTIVE' : 'INACTIVE'),
      order: offerCount + 1,
    });

    await logActivity(req, {
      action: 'OFFER_CREATED',
      resourceType: 'Offer',
      resourceId: offer._id,
      payload: { title: offer.title, offerPrice: offer.offerPrice },
    });

    return res.status(201).json({
      success: true,
      message: 'Offer banner created successfully',
      data: offer,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    const { title, description, actualPrice, offerPrice, image, tagBadge, isActive, status, order } = req.body;

    if (title) offer.title = title.trim();
    if (description !== undefined) offer.description = description.trim();
    if (actualPrice !== undefined) offer.actualPrice = Number(actualPrice);
    if (offerPrice !== undefined) offer.offerPrice = Number(offerPrice);
    if (image !== undefined) {
      offer.image = await processSingleImage(image, 'shamil_marketplace/offers');
    }
    if (tagBadge !== undefined) offer.tagBadge = tagBadge;
    if (order !== undefined) offer.order = Number(order);
    if (isActive !== undefined) {
      offer.isActive = Boolean(isActive);
      offer.status = offer.isActive ? 'ACTIVE' : 'INACTIVE';
    }
    if (status) {
      offer.status = status.toUpperCase();
      offer.isActive = offer.status === 'ACTIVE';
    }

    await offer.save();

    await logActivity(req, {
      action: 'OFFER_UPDATED',
      resourceType: 'Offer',
      resourceId: offer._id,
      payload: { title: offer.title, isActive: offer.isActive },
    });

    return res.status(200).json({
      success: true,
      message: 'Offer banner updated successfully',
      data: offer,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    await logActivity(req, {
      action: 'OFFER_DELETED',
      resourceType: 'Offer',
      resourceId: id,
      payload: { title: offer.title },
    });

    return res.status(200).json({
      success: true,
      message: 'Offer banner removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { getOffers, createOffer, updateOffer, deleteOffer };
