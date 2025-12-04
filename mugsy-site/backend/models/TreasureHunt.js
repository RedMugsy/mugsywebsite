import mongoose from 'mongoose';

const treasureHuntSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 300
  },
  promoter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promoter',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed', 'cancelled', 'paused'],
    default: 'draft'
  },
  category: {
    type: String,
    enum: ['adventure', 'puzzle', 'photo', 'location', 'trivia', 'mixed'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    radius: {
      type: Number,
      default: 1000, // meters
      min: 10,
      max: 10000
    }
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    registrationDeadline: {
      type: Date,
      required: true
    }
  },
  participation: {
    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
      max: 10000
    },
    currentParticipants: {
      type: Number,
      default: 0
    },
    minTeamSize: {
      type: Number,
      default: 1,
      min: 1
    },
    maxTeamSize: {
      type: Number,
      default: 1,
      min: 1
    },
    ageRestriction: {
      minAge: {
        type: Number,
        min: 0,
        max: 100
      },
      maxAge: {
        type: Number,
        min: 0,
        max: 100
      }
    }
  },
  pricing: {
    registrationFee: {
      pathfinder: {
        type: Number,
        required: true,
        min: 0
      },
      keymaster: {
        type: Number,
        required: true,
        min: 0
      }
    },
    currency: {
      type: String,
      enum: ['SOL', 'USDC', 'BONK'],
      default: 'SOL'
    },
    walletAddress: {
      type: String,
      required: true,
      match: [/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Please enter a valid Solana wallet address']
    }
  },
  clues: [{
    order: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    type: {
      type: String,
      enum: ['text', 'image', 'audio', 'video', 'qr_code'],
      default: 'text'
    },
    media: {
      url: String,
      filename: String,
      mimetype: String,
      size: Number
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number], // [longitude, latitude]
      radius: {
        type: Number,
        default: 50, // meters
        min: 1,
        max: 500
      }
    },
    hints: [{
      content: String,
      unlockAfter: {
        type: Number,
        default: 0 // minutes after clue start
      }
    }],
    solution: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      default: 100,
      min: 0,
      max: 1000
    }
  }],
  prizes: [{
    position: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    value: {
      amount: Number,
      currency: String
    },
    type: {
      type: String,
      enum: ['trophy', 'cash', 'gift_card', 'merchandise', 'experience', 'other'],
      default: 'other'
    }
  }],
  rules: {
    type: String,
    default: 'Standard treasure hunt rules apply. Be respectful, stay safe, and have fun!'
  },
  media: {
    coverImage: {
      url: String,
      filename: String,
      mimetype: String,
      size: Number
    },
    gallery: [{
      url: String,
      filename: String,
      mimetype: String,
      size: Number,
      caption: String
    }]
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowTeams: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    sendReminders: {
      type: Boolean,
      default: true
    },
    trackLocation: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    registrations: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    }
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
treasureHuntSchema.index({ promoter: 1, status: 1 });
treasureHuntSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
treasureHuntSchema.index({ 'location.coordinates': '2dsphere' });
treasureHuntSchema.index({ category: 1, difficulty: 1 });
treasureHuntSchema.index({ createdAt: -1 });

// Virtual for registration status
treasureHuntSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  const deadline = new Date(this.schedule.registrationDeadline);
  const startDate = new Date(this.schedule.startDate);
  
  if (now > startDate) return 'closed';
  if (now > deadline) return 'expired';
  if (this.participation.currentParticipants >= this.participation.maxParticipants) return 'full';
  return 'open';
});

// Virtual for hunt status
treasureHuntSchema.virtual('huntStatus').get(function() {
  const now = new Date();
  const startDate = new Date(this.schedule.startDate);
  const endDate = new Date(this.schedule.endDate);
  
  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'draft') return 'draft';
  if (now < startDate) return 'upcoming';
  if (now >= startDate && now <= endDate) return 'active';
  if (now > endDate) return 'completed';
  return this.status;
});

// Virtual for duration
treasureHuntSchema.virtual('duration').get(function() {
  const start = new Date(this.schedule.startDate);
  const end = new Date(this.schedule.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60)); // hours
});

// Pre-save middleware
treasureHuntSchema.pre('save', function(next) {
  // Ensure end date is after start date
  if (this.schedule.endDate <= this.schedule.startDate) {
    const error = new Error('End date must be after start date');
    error.status = 400;
    return next(error);
  }
  
  // Ensure registration deadline is before start date
  if (this.schedule.registrationDeadline >= this.schedule.startDate) {
    const error = new Error('Registration deadline must be before start date');
    error.status = 400;
    return next(error);
  }
  
  // Sort clues by order
  if (this.clues && this.clues.length > 0) {
    this.clues.sort((a, b) => a.order - b.order);
  }
  
  next();
});

// Instance method to check if registration is open
treasureHuntSchema.methods.isRegistrationOpen = function() {
  const now = new Date();
  const deadline = new Date(this.schedule.registrationDeadline);
  const startDate = new Date(this.schedule.startDate);
  
  return (
    this.status === 'published' &&
    now < deadline &&
    now < startDate &&
    this.participation.currentParticipants < this.participation.maxParticipants
  );
};

// Instance method to add participant
treasureHuntSchema.methods.addParticipant = function(participantId) {
  if (!this.isRegistrationOpen()) {
    const error = new Error('Registration is not open for this treasure hunt');
    error.status = 400;
    throw error;
  }
  
  if (!this.participants.includes(participantId)) {
    this.participants.push(participantId);
    this.participation.currentParticipants += 1;
    this.analytics.registrations += 1;
  }
  
  return this.save();
};

// Static method to find active hunts
treasureHuntSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'published',
    'schedule.startDate': { $lte: now },
    'schedule.endDate': { $gte: now }
  });
};

// Static method to find upcoming hunts
treasureHuntSchema.statics.findUpcoming = function() {
  const now = new Date();
  return this.find({
    status: 'published',
    'schedule.startDate': { $gt: now }
  });
};

// Static method to find by promoter
treasureHuntSchema.statics.findByPromoter = function(promoterId) {
  return this.find({ promoter: promoterId });
};

const TreasureHunt = mongoose.model('TreasureHunt', treasureHuntSchema);

export default TreasureHunt;