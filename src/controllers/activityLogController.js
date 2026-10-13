import ActivityLog from '../models/ActivityLog.js';

export const getActivityLogs = async (req, res, next) => {
  try {
    const { search, action, actorRole, page = 1, limit = 7 } = req.query;
    const query = {};

    if (action) query.action = { $regex: action, $options: 'i' };
    if (actorRole) query.actorRole = actorRole.toUpperCase();

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { actorName: { $regex: search, $options: 'i' } },
        { resourceType: { $regex: search, $options: 'i' } },
        { resourceId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageSize = parseInt(limit, 10) || 7;
    const currentPage = parseInt(page, 10) || 1;
    const skip = (currentPage - 1) * pageSize;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(pageSize),
      ActivityLog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        logs,
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

export default { getActivityLogs };
