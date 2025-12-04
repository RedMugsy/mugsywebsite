import jwt from 'jsonwebtoken';
import Promoter from '../models/Promoter.js';

// JWT Authentication middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Authentication token is required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const promoter = await Promoter.findById(decoded.id);
    
    if (!promoter) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid token - promoter not found'
      });
    }
    
    if (promoter.status !== 'active') {
      return res.status(403).json({
        error: 'Account Inactive',
        message: 'Your account is not active. Please contact support.'
      });
    }
    
    if (!promoter.verified) {
      return res.status(403).json({
        error: 'Account Not Verified',
        message: 'Please verify your email address before accessing this resource.'
      });
    }
    
    req.promoter = promoter;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Authentication token has expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Authentication token is invalid'
      });
    }
    
    console.error('❌ Authentication Error:', error);
    return res.status(500).json({
      error: 'Authentication Error',
      message: 'An error occurred during authentication'
    });
  }
};

// Authorization middleware for different roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.promoter) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'You must be authenticated to access this resource'
      });
    }
    
    if (!roles.includes(req.promoter.role)) {
      return res.status(403).json({
        error: 'Insufficient Permissions',
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Permission-based authorization
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.promoter) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'You must be authenticated to access this resource'
      });
    }
    
    const hasPermission = req.promoter.permissions && req.promoter.permissions[permission];
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient Permissions',
        message: `You don't have permission to ${permission.replace(/([A-Z])/g, ' $1').toLowerCase()}`
      });
    }
    
    next();
  };
};

// Middleware to check if promoter owns the resource
export const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          error: 'Resource Not Found',
          message: 'The requested resource does not exist'
        });
      }
      
      // Check if promoter owns the resource or is admin/super_admin
      const isOwner = resource.promoter && resource.promoter.toString() === req.promoter._id.toString();
      const isAdmin = ['admin', 'super_admin'].includes(req.promoter.role);
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'You can only access resources you own'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      console.error('❌ Ownership Check Error:', error);
      return res.status(500).json({
        error: 'Authorization Error',
        message: 'An error occurred while checking resource ownership'
      });
    }
  };
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const promoter = await Promoter.findById(decoded.id);
      
      if (promoter && promoter.status === 'active' && promoter.verified) {
        req.promoter = promoter;
      }
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

// Rate limiting for sensitive operations
export const sensitiveOperationLimit = (req, res, next) => {
  // This would be implemented with Redis in production
  // For now, just pass through
  next();
};

export default {
  authenticateToken,
  authorize,
  checkPermission,
  checkOwnership,
  optionalAuth,
  sensitiveOperationLimit
};