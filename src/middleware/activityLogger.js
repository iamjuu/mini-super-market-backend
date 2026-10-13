import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (req, { action, resourceType, resourceId, payload = {} }) => {
  try {
    const actorId = req.user?._id || null;
    const actorName = req.user?.name || 'System';
    const actorRole = req.user?.role || 'SYSTEM';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    await ActivityLog.create({
      action,
      actorId,
      actorName,
      actorRole,
      resourceType,
      resourceId: resourceId ? String(resourceId) : '',
      payload,
      ipAddress,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Failed to log activity audit:', err.message);
  }
};

export default logActivity;
