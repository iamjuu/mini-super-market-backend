import Shop from '../models/Shop.js';
import User from '../models/User.js';
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

const toPascalCase = (str) => {
  return str
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

export const getShops = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { ownerEmail: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const shops = await Shop.find(query)
      .populate('owner', 'name email phone status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: shops,
    });
  } catch (err) {
    next(err);
  }
};

export const getShopById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'name email phone');
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (err) {
    next(err);
  }
};

export const createShop = async (req, res, next) => {
  try {
    const {
      name,
      category,
      phone,
      openingTime,
      closingTime,
      address,
      street,
      city,
      state,
      pincode,
      lat,
      lng,
      image,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Shop name is required.',
      });
    }

    let slug = slugify(name);
    let count = 1;
    while (await Shop.findOne({ slug })) {
      slug = `${slugify(name)}-${count++}`;
    }

    // Deterministic credential provisioning as per main.md specification
    const merchantEmail = `${slug}@marketplace.com`;
    const pascalName = toPascalCase(name) || 'Merchant';
    const initialPassword = `${pascalName}@2026`;

    // Create or find user
    let user = await User.findOne({ email: merchantEmail });
    if (!user) {
      user = await User.create({
        name: `${name.trim()} Owner`,
        email: merchantEmail,
        password: initialPassword,
        phone: phone || '',
        role: 'SHOP_OWNER',
        isUser: 'shop_owner',
        status: 'ACTIVE',
        displayPassword: initialPassword,
      });
    }

    const resolvedAddress = {
      street: street || address?.street || '',
      city: city || address?.city || '',
      state: state || address?.state || '',
      pincode: pincode || address?.pincode || '',
      lat: lat !== undefined ? Number(lat) : (address?.lat !== undefined ? Number(address.lat) : null),
      lng: lng !== undefined ? Number(lng) : (address?.lng !== undefined ? Number(address.lng) : null),
    };

    const shop = await Shop.create({
      name: name.trim(),
      slug,
      owner: user._id,
      ownerEmail: merchantEmail,
      category: category || 'General Grocery',
      phone: phone || '',
      openingTime: openingTime || '07:00 AM',
      closingTime: closingTime || '10:00 PM',
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      address: resolvedAddress,
      displayPassword: initialPassword,
      status: 'ACTIVE',
    });

    await logActivity(req, {
      action: 'SHOP_PROVISIONED',
      resourceType: 'Shop',
      resourceId: shop._id,
      payload: { name: shop.name, merchantEmail, slug },
    });

    return res.status(201).json({
      success: true,
      message: 'Shop provisioned successfully with deterministic owner credentials',
      data: {
        ...shop.toObject(),
        credentials: {
          email: merchantEmail,
          password: initialPassword,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    const {
      name,
      category,
      phone,
      openingTime,
      closingTime,
      address,
      image,
      status,
      rating,
    } = req.body;

    if (name && name.trim() !== shop.name) {
      shop.name = name.trim();
    }
    if (category) shop.category = category;
    if (phone !== undefined) shop.phone = phone;
    if (openingTime) shop.openingTime = openingTime;
    if (closingTime) shop.closingTime = closingTime;
    if (image !== undefined) shop.image = image;
    if (status) shop.status = status.toUpperCase();
    if (rating !== undefined) shop.rating = Number(rating);
    if (address) {
      shop.address = {
        ...shop.address,
        ...address,
      };
    }

    await shop.save();

    await logActivity(req, {
      action: 'SHOP_UPDATED',
      resourceType: 'Shop',
      resourceId: shop._id,
      payload: { name: shop.name, status: shop.status },
    });

    return res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      data: shop,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findByIdAndDelete(id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    await logActivity(req, {
      action: 'SHOP_DELETED',
      resourceType: 'Shop',
      resourceId: id,
      payload: { name: shop.name },
    });

    return res.status(200).json({
      success: true,
      message: 'Shop removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { getShops, getShopById, createShop, updateShop, deleteShop };
