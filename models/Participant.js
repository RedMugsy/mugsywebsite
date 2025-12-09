import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  treasureHunt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreasureHunt',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  age: {
    type: Number,
    min: 1,
    max: 120
  },
  tier: {
    type: String,
    enum: ['pathfinder', 'keymaster'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
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
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  progress: {
    currentClue: {
      type: Number,
      default: 0
    },
    completedClues: [{
      clueIndex: Number,
      completedAt: Date,
      timeTaken: Number, // minutes
      hintsUsed: Number
    }],
    totalScore: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'abandoned'],
      default: 'not_started'
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    totalTime: {
      type: Number, // minutes
      default: 0
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      shareLocation: {
        type: Boolean,
        default: false
      },
      showInLeaderboard: {
        type: Boolean,
        default: true
      }
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  checkins: [{
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    clueIndex: Number
  }],
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
participantSchema.index({ treasureHunt: 1, email: 1 }, { unique: true });
participantSchema.index({ treasureHunt: 1, paymentStatus: 1 });
participantSchema.index({ 'progress.status': 1, 'progress.totalScore': -1 });
participantSchema.index({ createdAt: -1 });

// Virtual for completion percentage
participantSchema.virtual('completionPercentage').get(function() {
  if (!this.populated('treasureHunt') || !this.treasureHunt.clues) {
    return 0;
  }
  
  const totalClues = this.treasureHunt.clues.length;
  const completedClues = this.progress.completedClues.length;
  
  return totalClues > 0 ? Math.round((completedClues / totalClues) * 100) : 0;
});

// Virtual for rank (requires population with other participants)
participantSchema.virtual('rank').get(function() {
  // This would need to be calculated at query time
  return this._rank || null;
});

// Instance method to start the hunt
participantSchema.methods.startHunt = function() {
  if (this.progress.status !== 'not_started') {
    const error = new Error('Hunt has already been started');
    error.status = 400;
    throw error;
  }
  
  this.progress.status = 'in_progress';
  this.progress.startedAt = new Date();
  
  return this.save();
};

// Instance method to complete a clue
participantSchema.methods.completeClue = function(clueIndex, timeTaken = 0, hintsUsed = 0) {
  const alreadyCompleted = this.progress.completedClues.find(c => c.clueIndex === clueIndex);
  
  if (alreadyCompleted) {
    const error = new Error('Clue has already been completed');
    error.status = 400;
    throw error;
  }
  
  this.progress.completedClues.push({
    clueIndex,
    completedAt: new Date(),
    timeTaken,
    hintsUsed
  });
  
  this.progress.currentClue = clueIndex + 1;
  
  return this.save();
};

// Instance method to complete the hunt
participantSchema.methods.completeHunt = function() {
  if (this.progress.status !== 'in_progress') {
    const error = new Error('Hunt is not in progress');
    error.status = 400;
    throw error;
  }
  
  this.progress.status = 'completed';
  this.progress.completedAt = new Date();
  
  if (this.progress.startedAt) {
    const totalTime = (this.progress.completedAt - this.progress.startedAt) / (1000 * 60); // minutes
    this.progress.totalTime = Math.round(totalTime);
  }
  
  return this.save();
};

// Instance method to add check-in
participantSchema.methods.addCheckin = function(coordinates, clueIndex = null) {
  this.checkins.push({
    location: {
      coordinates
    },
    clueIndex,
    timestamp: new Date()
  });
  
  return this.save();
};

// Static method to find by treasure hunt
participantSchema.statics.findByTreasureHunt = function(treasureHuntId) {
  return this.find({ treasureHunt: treasureHuntId });
};

// Static method to find confirmed participants
participantSchema.statics.findConfirmed = function(treasureHuntId) {
  return this.find({ 
    treasureHunt: treasureHuntId,
    paymentStatus: 'confirmed'
  });
};

// Static method to get leaderboard
participantSchema.statics.getLeaderboard = function(treasureHuntId, limit = 10) {
  return this.find({ 
    treasureHunt: treasureHuntId,
    paymentStatus: 'confirmed',
    'preferences.privacy.showInLeaderboard': true
  })
  .sort({ 
    'progress.totalScore': -1,
    'progress.totalTime': 1,
    'progress.completedAt': 1
  })
  .limit(limit)
  .select('name progress tier');
};

const Participant = mongoose.model('Participant', participantSchema);

export default Participant;