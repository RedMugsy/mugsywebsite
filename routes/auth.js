import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Promoter from '../models/Promoter.js';
import {
  sendPromoterVerificationEmail,
  sendPasswordResetEmail
} from '../services/emailService.js';
import { 
  validate, 
  promoterRegistrationSchema, 
  promoterLoginSchema,
  passwordResetRequestSchema,
  passwordResetSchema 
} from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT tokens
const generateTokens = (promoter) => {
  const payload = {
    id: promoter._id,
    email: promoter.email,
    role: promoter.role
  };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
  
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
  
  return { accessToken, refreshToken };
};

// Register new promoter
router.post('/register', validate(promoterRegistrationSchema), async (req, res) => {
  try {
    const { name, email, password, organization, phone } = req.body;
    
    // Check if promoter already exists
    const existingPromoter = await Promoter.findByEmail(email);
    if (existingPromoter) {
      return res.status(409).json({
        error: 'Email Already Registered',
        message: 'A promoter with this email address already exists'
      });
    }
    
    // Create new promoter
    const promoter = new Promoter({
      name,
      email,
      password,
      organization,
      phone,
      status: 'pending' // Requires admin approval
    });
    
    // Generate verification token
    promoter.verificationToken = crypto.randomBytes(32).toString('hex');
    
    await promoter.save();
    
    try {
      await sendPromoterVerificationEmail({
        to: promoter.email,
        name: promoter.name,
        token: promoter.verificationToken
      });
    } catch (emailError) {
      console.error('❌ Verification Email Error:', emailError);
    }
    
    res.status(201).json({
      message: 'Registration successful',
      data: {
        id: promoter._id,
        name: promoter.name,
        email: promoter.email,
        status: promoter.status,
        verified: promoter.verified
      }
    });
    
  } catch (error) {
    console.error('❌ Registration Error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate Email',
        message: 'An account with this email already exists'
      });
    }
    
    res.status(500).json({
      error: 'Registration Failed',
      message: 'An error occurred during registration'
    });
  }
});

// Login promoter
router.post('/login', validate(promoterLoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find promoter
    const promoter = await Promoter.findByEmail(email);
    if (!promoter) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Check if account is locked
    if (promoter.isLocked) {
      return res.status(423).json({
        error: 'Account Locked',
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }
    
    // Verify password
    const isPasswordValid = await promoter.comparePassword(password);
    if (!isPasswordValid) {
      await promoter.incLoginAttempts();
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Check account status
    if (promoter.status !== 'active') {
      return res.status(403).json({
        error: 'Account Inactive',
        message: 'Your account is not active. Please contact support for assistance.'
      });
    }
    
    // Reset login attempts on successful login
    if (promoter.loginAttempts > 0) {
      await promoter.resetLoginAttempts();
    }
    
    // Update last login
    promoter.lastLogin = new Date();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(promoter);
    
    // Store refresh token
    promoter.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    });
    
    // Limit stored refresh tokens (keep last 5)
    if (promoter.refreshTokens.length > 5) {
      promoter.refreshTokens = promoter.refreshTokens.slice(-5);
    }
    
    await promoter.save();
    
    res.json({
      message: 'Login successful',
      data: {
        promoter: {
          id: promoter._id,
          name: promoter.name,
          email: promoter.email,
          role: promoter.role,
          organization: promoter.organization,
          verified: promoter.verified,
          permissions: promoter.permissions
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      error: 'Login Failed',
      message: 'An error occurred during login'
    });
  }
});

// Admin login (requires admin or super_admin role)
router.post('/admin/login', validate(promoterLoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const promoter = await Promoter.findByEmail(email);
    if (!promoter) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }

    if (!['admin', 'super_admin'].includes(promoter.role)) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Administrator privileges are required'
      });
    }

    if (promoter.isLocked) {
      return res.status(423).json({
        error: 'Account Locked',
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    const isPasswordValid = await promoter.comparePassword(password);
    if (!isPasswordValid) {
      await promoter.incLoginAttempts();
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }

    if (promoter.status !== 'active') {
      return res.status(403).json({
        error: 'Account Inactive',
        message: 'Your account is not active'
      });
    }

    if (!promoter.verified) {
      return res.status(403).json({
        error: 'Account Not Verified',
        message: 'Please verify your email address before accessing this resource.'
      });
    }

    if (promoter.loginAttempts > 0) {
      await promoter.resetLoginAttempts();
    }

    promoter.lastLogin = new Date();

    const { accessToken, refreshToken } = generateTokens(promoter);

    promoter.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    });

    if (promoter.refreshTokens.length > 5) {
      promoter.refreshTokens = promoter.refreshTokens.slice(-5);
    }

    await promoter.save();

    res.json({
      message: 'Admin login successful',
      data: {
        promoter: {
          id: promoter._id,
          name: promoter.name,
          email: promoter.email,
          role: promoter.role,
          organization: promoter.organization,
          verified: promoter.verified,
          permissions: promoter.permissions
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    });
  } catch (error) {
    console.error('❌ Admin Login Error:', error);
    res.status(500).json({
      error: 'Login Failed',
      message: 'An error occurred during admin login'
    });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh Token Required',
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find promoter
    const promoter = await Promoter.findById(decoded.id);
    if (!promoter) {
      return res.status(401).json({
        error: 'Invalid Refresh Token',
        message: 'Promoter not found'
      });
    }
    
    // Check if refresh token exists in database
    const tokenExists = promoter.refreshTokens.some(t => t.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        error: 'Invalid Refresh Token',
        message: 'Refresh token is not valid'
      });
    }
    
    // Check account status
    if (promoter.status !== 'active') {
      return res.status(403).json({
        error: 'Account Inactive',
        message: 'Your account is not active'
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(promoter);
    
    // Remove old refresh token and add new one
    promoter.refreshTokens = promoter.refreshTokens.filter(t => t.token !== refreshToken);
    promoter.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date()
    });
    
    await promoter.save();
    
    res.json({
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Token Refresh Error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh Token Expired',
        message: 'Refresh token has expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Refresh Token',
        message: 'Refresh token is invalid'
      });
    }
    
    res.status(500).json({
      error: 'Token Refresh Failed',
      message: 'An error occurred while refreshing token'
    });
  }
});

// Logout (revoke refresh token)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Remove specific refresh token
      req.promoter.refreshTokens = req.promoter.refreshTokens.filter(t => t.token !== refreshToken);
    } else {
      // Remove all refresh tokens (logout from all devices)
      req.promoter.refreshTokens = [];
    }
    
    await req.promoter.save();
    
    res.json({
      message: 'Logout successful'
    });
    
  } catch (error) {
    console.error('❌ Logout Error:', error);
    res.status(500).json({
      error: 'Logout Failed',
      message: 'An error occurred during logout'
    });
  }
});

// Get current promoter profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      message: 'Profile retrieved successfully',
      data: {
        promoter: req.promoter
      }
    });
  } catch (error) {
    console.error('❌ Profile Error:', error);
    res.status(500).json({
      error: 'Profile Retrieval Failed',
      message: 'An error occurred while retrieving profile'
    });
  }
});

// Request password reset
router.post('/forgot-password', validate(passwordResetRequestSchema), async (req, res) => {
  try {
    const { email } = req.body;
    
    const promoter = await Promoter.findByEmail(email);
    
    // Always return success message to prevent email enumeration
    const successMessage = 'If an account with that email exists, a password reset link has been sent.';
    
    if (!promoter) {
      return res.json({
        message: successMessage
      });
    }
    
    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    promoter.passwordResetToken = resetToken;
    promoter.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await promoter.save();
    
    try {
      await sendPasswordResetEmail({
        to: promoter.email,
        name: promoter.name,
        token: resetToken
      });
    } catch (emailError) {
      console.error('❌ Password Reset Email Error:', emailError);
    }
    
    res.json({
      message: successMessage
    });
    
  } catch (error) {
    console.error('❌ Password Reset Request Error:', error);
    res.status(500).json({
      error: 'Password Reset Failed',
      message: 'An error occurred while processing password reset request'
    });
  }
});

// Reset password
router.post('/reset-password', validate(passwordResetSchema), async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const promoter = await Promoter.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
    
    if (!promoter) {
      return res.status(400).json({
        error: 'Invalid Reset Token',
        message: 'Password reset token is invalid or has expired'
      });
    }
    
    // Update password
    promoter.password = newPassword;
    promoter.passwordResetToken = null;
    promoter.passwordResetExpires = null;
    
    // Clear all refresh tokens (force re-login)
    promoter.refreshTokens = [];
    
    await promoter.save();
    
    res.json({
      message: 'Password reset successful. Please login with your new password.'
    });
    
  } catch (error) {
    console.error('❌ Password Reset Error:', error);
    res.status(500).json({
      error: 'Password Reset Failed',
      message: 'An error occurred while resetting password'
    });
  }
});

// Verify email address
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const promoter = await Promoter.findOne({ verificationToken: token });
    
    if (!promoter) {
      return res.status(400).json({
        error: 'Invalid Verification Token',
        message: 'Email verification token is invalid'
      });
    }
    
    promoter.verified = true;
    promoter.verificationToken = null;
    
    await promoter.save();
    
    res.json({
      message: 'Email verification successful'
    });
    
  } catch (error) {
    console.error('❌ Email Verification Error:', error);
    res.status(500).json({
      error: 'Email Verification Failed',
      message: 'An error occurred while verifying email'
    });
  }
});

export default router;
