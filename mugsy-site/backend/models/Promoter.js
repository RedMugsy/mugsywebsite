import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const promoterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  organization: {
    type: String,
    trim: true,
    maxlength: 200
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['promoter', 'admin', 'super_admin'],
    default: 'promoter'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'rejected'],
    default: 'pending'
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: 500
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid URL']
    },
    socialLinks: {
      twitter: String,
      linkedin: String,
      instagram: String
    }
  },
  permissions: {
    canCreateEvents: {
      type: Boolean,
      default: true
    },
    canEditEvents: {
      type: Boolean,
      default: true
    },
    canDeleteEvents: {
      type: Boolean,
      default: false
    },
    canManageParticipants: {
      type: Boolean,
      default: true
    },
    canViewAnalytics: {
      type: Boolean,
      default: true
    }
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '7d'
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.passwordResetToken;
      delete ret.refreshTokens;
      return ret;
    }
  }
});

// Indexes
promoterSchema.index({ status: 1 });
promoterSchema.index({ createdAt: 1 });

// Virtual for account lock status
promoterSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
promoterSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
promoterSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Instance method to increment login attempts
promoterSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
promoterSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Instance method to generate verification token
promoterSchema.methods.generateVerificationToken = function() {
  this.verificationToken = crypto.randomBytes(32).toString('hex');
  return this.verificationToken;
};

// Instance method to generate password reset token
promoterSchema.methods.generatePasswordResetToken = function() {
  this.passwordResetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return this.passwordResetToken;
};

// Static method to find by email
promoterSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active promoters
promoterSchema.statics.findActive = function() {
  return this.find({ status: 'active', verified: true });
};

const Promoter = mongoose.model('Promoter', promoterSchema);

export default Promoter;