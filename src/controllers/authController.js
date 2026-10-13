import User from '../models/User.js';
import Customer from '../models/Customer.js';
import { signToken } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

// Helper to generate 6-digit numeric OTP
const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email or password.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Account is currently ${user.status.toLowerCase()}. Contact administration.`,
      });
    }

    // Direct authentication: generate JWT token immediately so admin credentials (a@gmail.com / 123) sign in directly
    if (req.body.require2FA) {
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      user.otp = otp;
      user.otpExpiresAt = expiresAt;
      await user.save();

      console.log('====================================================');
      console.log(`🔐 [ADMIN 2FA OTP for ${user.email}]: ${otp}`);
      console.log('====================================================');

      return res.status(200).json({
        success: true,
        requiresOtp: true,
        message: 'Two-factor passcode generated. Please enter your 6-digit OTP.',
        data: {
          email: user.email,
          debugOtp: otp,
        },
        debugOtp: otp,
      });
    }

    // Direct token issuance
    const token = signToken(user);
    await logActivity(req, {
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id,
      payload: { role: user.role, email: user.email },
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account associated with this email.',
      });
    }

    if (!user.otp || String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect verification code. Please check your OTP and retry.',
      });
    }

    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new OTP.',
      });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = signToken(user);

    await logActivity(req, {
      action: '2FA_VERIFICATION_SUCCESS',
      resourceType: 'User',
      resourceId: user._id,
      payload: { role: user.role, email: user.email },
    });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    console.log('====================================================');
    console.log(`🔄 [RESENT OTP for ${user.email}]: ${otp}`);
    console.log('====================================================');

    return res.status(200).json({
      success: true,
      message: 'New verification passcode has been dispatched.',
      debugOtp: otp,
      data: {
        email: user.email,
        debugOtp: otp,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.',
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'CUSTOMER',
      isUser: 'user',
      status: 'ACTIVE',
    });

    // Create corresponding customer profile
    await Customer.create({
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '',
      status: 'NEW',
    });

    const token = signToken(newUser);

    await logActivity(req, {
      action: 'USER_REGISTER',
      resourceType: 'User',
      resourceId: newUser._id,
      payload: { name: newUser.name, email: newUser.email },
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        token,
        user: newUser.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user.toSafeObject(),
    },
  });
};

export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export default { login, verifyOtp, resendOtp, register, getMe, logout };
