import PlatformSetting from '../models/PlatformSetting.js';
import { logActivity } from '../middleware/activityLogger.js';

const DEFAULT_APPEARANCE = {
  platformName: 'Al Salhiya',
  tagline: 'Premium Quality Foods & Products — عالية الجودة',
  logoUrl: '/al-salhiya-logo.jpg',
  primaryThemeColor: '#18308c',
  secondaryThemeColor: '#ff7824',
  accentGold: '#ffba18',
  primaryHover: '#18308ce6',
  primaryLight: '#18308c1a',
};

const DEFAULT_SETTINGS = {
  openingTime: '07:00 AM',
  closingTime: '10:00 PM',
  timezone: 'Asia/Kolkata',
  acceptOrdersGlobally: true,
  baseDeliveryFee: 30,
  freeDeliveryThreshold: 499,
  commissionPercentage: 10,
};

const DEFAULT_FEATURE_FLAGS = {
  customer_wallet: true,
  live_gps_broadcasting: true,
  razorpay_gateway: true,
  continuous_audio_alarm: true,
  doorstep_otp_required: true,
  alternative_procurement: true,
  shop_owner_portal: true,
};

export const getAppearance = async (req, res, next) => {
  try {
    let setting = await PlatformSetting.findOne({ key: 'appearance' });
    if (!setting) {
      setting = await PlatformSetting.create({ key: 'appearance', data: DEFAULT_APPEARANCE });
    }
    return res.status(200).json({
      success: true,
      data: setting.data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAppearance = async (req, res, next) => {
  try {
    const newConfig = req.body;
    let setting = await PlatformSetting.findOne({ key: 'appearance' });
    if (!setting) {
      setting = new PlatformSetting({ key: 'appearance', data: DEFAULT_APPEARANCE });
    }

    setting.data = {
      ...setting.data,
      ...newConfig,
    };
    setting.markModified('data');
    await setting.save();

    await logActivity(req, {
      action: 'APPEARANCE_UPDATED',
      resourceType: 'PlatformSetting',
      resourceId: 'appearance',
      payload: setting.data,
    });

    return res.status(200).json({
      success: true,
      message: 'Appearance configuration updated successfully',
      data: setting.data,
    });
  } catch (err) {
    next(err);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    let setting = await PlatformSetting.findOne({ key: 'settings' });
    if (!setting) {
      setting = await PlatformSetting.create({ key: 'settings', data: DEFAULT_SETTINGS });
    }
    return res.status(200).json({
      success: true,
      data: setting.data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const newConfig = req.body;
    let setting = await PlatformSetting.findOne({ key: 'settings' });
    if (!setting) {
      setting = new PlatformSetting({ key: 'settings', data: DEFAULT_SETTINGS });
    }

    setting.data = {
      ...setting.data,
      ...newConfig,
    };
    setting.markModified('data');
    await setting.save();

    await logActivity(req, {
      action: 'MARKETPLACE_SETTINGS_UPDATED',
      resourceType: 'PlatformSetting',
      resourceId: 'settings',
      payload: setting.data,
    });

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: setting.data,
    });
  } catch (err) {
    next(err);
  }
};

export const getFeatureFlags = async (req, res, next) => {
  try {
    let setting = await PlatformSetting.findOne({ key: 'features' });
    if (!setting) {
      setting = await PlatformSetting.create({ key: 'features', data: DEFAULT_FEATURE_FLAGS });
    }
    return res.status(200).json({
      success: true,
      data: setting.data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateFeatureFlags = async (req, res, next) => {
  try {
    const newFlags = req.body;
    let setting = await PlatformSetting.findOne({ key: 'features' });
    if (!setting) {
      setting = new PlatformSetting({ key: 'features', data: DEFAULT_FEATURE_FLAGS });
    }

    setting.data = {
      ...setting.data,
      ...newFlags,
    };
    setting.markModified('data');
    await setting.save();

    await logActivity(req, {
      action: 'FEATURE_FLAGS_UPDATED',
      resourceType: 'PlatformSetting',
      resourceId: 'features',
      payload: setting.data,
    });

    return res.status(200).json({
      success: true,
      message: 'Feature flags updated successfully',
      data: setting.data,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getAppearance,
  updateAppearance,
  getSettings,
  updateSettings,
  getFeatureFlags,
  updateFeatureFlags,
};
