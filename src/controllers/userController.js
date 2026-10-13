import User from '../models/User.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isUser: user.isUser,
        addresses: user.addresses || [],
        walletBalance: user.walletBalance,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile details saved successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { street, city, state, pincode, landmark, lat, lng, isDefault, tag } = req.body;

    if (!street) {
      return res.status(400).json({
        success: false,
        message: 'Street address is required',
      });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      street: street.trim(),
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      landmark: landmark || '',
      lat: lat !== undefined ? Number(lat) : null,
      lng: lng !== undefined ? Number(lng) : null,
      isDefault: Boolean(isDefault || user.addresses.length === 0),
      tag: tag || 'Home',
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const addr = user.addresses.id(id);
    if (!addr) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    const { street, city, state, pincode, landmark, lat, lng, isDefault, tag } = req.body;

    if (street) addr.street = street.trim();
    if (city !== undefined) addr.city = city;
    if (state !== undefined) addr.state = state;
    if (pincode !== undefined) addr.pincode = pincode;
    if (landmark !== undefined) addr.landmark = landmark;
    if (lat !== undefined) addr.lat = Number(lat);
    if (lng !== undefined) addr.lng = Number(lng);
    if (tag !== undefined) addr.tag = tag;

    if (isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = a._id.toString() === id;
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.addresses = user.addresses.filter((a) => a._id.toString() !== id);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address removed successfully',
      data: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === id;
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Default address updated',
      data: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
