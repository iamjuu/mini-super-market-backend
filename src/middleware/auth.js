import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'shamil_marketplace_super_secret_jwt_key_2026';

export const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      isUser: user.isUser,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication token missing or invalid',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Account no longer exists',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_INACTIVE',
        message: `Account is currently ${user.status.toLowerCase()}`,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Session has expired or is invalid. Please log in again.',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.status === 'ACTIVE') {
        req.user = user;
      }
    }
  } catch (_) {
    // Ignore invalid token in optional auth
  }
  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for this operation',
      });
    }

    const userRole = req.user.role;
    const isUserType = req.user.isUser;

    const hasAccess = roles.some((r) => {
      const roleUpper = r.toUpperCase();
      return (
        userRole === roleUpper ||
        (roleUpper === 'ADMIN' && (userRole === 'MASTER_ADMIN' || isUserType === 'admin' || isUserType === 'master')) ||
        (roleUpper === 'MASTER_ADMIN' && (userRole === 'MASTER_ADMIN' || isUserType === 'master'))
      );
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permissions for this resource.',
      });
    }

    next();
  };
};

export default { authenticate, optionalAuth, requireRole, signToken };
