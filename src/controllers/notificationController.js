import Notification from '../models/Notification.js';
import { emitEvent } from '../config/socket.js';
import { logActivity } from '../middleware/activityLogger.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { search, audience, type, page = 1, limit = 7 } = req.query;
    const query = {};

    if (audience && audience !== 'ALL') query.targetAudience = audience.toUpperCase();
    if (type && type !== 'ALL') query.type = type.toUpperCase();

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const pageSize = parseInt(limit, 10) || 7;
    const currentPage = parseInt(page, 10) || 1;
    const skip = (currentPage - 1) * pageSize;

    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Notification.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page: currentPage,
          pages: Math.ceil(total / pageSize) || 1,
          limit: pageSize,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { title, message, targetAudience, type, priority, channels, totalRecipients } = req.body;
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required.',
      });
    }

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      targetAudience: targetAudience || 'ALL',
      type: type || 'ANNOUNCEMENT',
      priority: priority || 'MEDIUM',
      channels: Array.isArray(channels) ? channels : ['IN_APP', 'PUSH'],
      totalRecipients: Number(totalRecipients) || 5000,
    });

    // Real-time broadcast to users
    emitEvent('notification:broadcast', notification);

    await logActivity(req, {
      action: 'NOTIFICATION_BROADCAST',
      resourceType: 'Notification',
      resourceId: notification._id,
      payload: { title: notification.title, audience: notification.targetAudience },
    });

    return res.status(201).json({
      success: true,
      message: 'Broadcast dispatched successfully',
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByIdAndDelete(id);
    if (!notif) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await logActivity(req, {
      action: 'NOTIFICATION_DELETED',
      resourceType: 'Notification',
      resourceId: id,
      payload: { title: notif.title },
    });

    return res.status(200).json({
      success: true,
      message: 'Notification removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { getNotifications, createNotification, deleteNotification };
