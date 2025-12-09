import express from 'express';
import TreasureHunt from '../models/TreasureHunt.js';
import Participant from '../models/Participant.js';
import { 
  authenticateToken, 
  optionalAuth, 
  checkPermission,
  checkOwnership
} from '../middleware/auth.js';
import { 
  validate, 
  validateQuery, 
  treasureHuntSchema,
  treasureHuntQuerySchema,
  participantRegistrationSchema
} from '../middleware/validation.js';

const router = express.Router();

// Get all treasure hunts (public endpoint with optional auth)
router.get('/', 
  optionalAuth,
  validateQuery(treasureHuntQuerySchema),
  async (req, res) => {
    try {
      const { 
        page, 
        limit, 
        sort = 'createdAt', 
        order,
        status,
        category,
        difficulty,
        search,
        startDate,
        endDate 
      } = req.query;
      
      const skip = (page - 1) * limit;
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj = { [sort]: sortOrder };
      
      // Build filter query
      const filter = {};
      
      // If not authenticated or not admin, only show published hunts
      if (!req.promoter || !['admin', 'super_admin'].includes(req.promoter.role)) {
        filter.status = 'published';
        filter['settings.isPublic'] = true;
      } else if (status) {
        filter.status = status;
      }
      
      if (category) filter.category = category;
      if (difficulty) filter.difficulty = difficulty;
      
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (startDate || endDate) {
        filter['schedule.startDate'] = {};
        if (startDate) filter['schedule.startDate'].$gte = new Date(startDate);
        if (endDate) filter['schedule.startDate'].$lte = new Date(endDate);
      }
      
      const [treasureHunts, total] = await Promise.all([
        TreasureHunt.find(filter)
          .populate('promoter', 'name organization')
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .select('-clues.solution'), // Don't expose solutions
        TreasureHunt.countDocuments(filter)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      res.json({
        message: 'Treasure hunts retrieved successfully',
        data: {
          treasureHunts,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Treasure Hunts Retrieval Error:', error);
      res.status(500).json({
        error: 'Treasure Hunts Retrieval Failed',
        message: 'An error occurred while retrieving treasure hunts'
      });
    }
  }
);

// Create new treasure hunt
router.post('/', 
  authenticateToken,
  checkPermission('canCreateEvents'),
  validate(treasureHuntSchema),
  async (req, res) => {
    try {
      const treasureHuntData = {
        ...req.body,
        promoter: req.promoter._id
      };
      
      const treasureHunt = new TreasureHunt(treasureHuntData);
      await treasureHunt.save();
      
      await treasureHunt.populate('promoter', 'name organization');
      
      res.status(201).json({
        message: 'Treasure hunt created successfully',
        data: { treasureHunt }
      });
      
    } catch (error) {
      console.error('❌ Treasure Hunt Creation Error:', error);
      res.status(500).json({
        error: 'Treasure Hunt Creation Failed',
        message: 'An error occurred while creating treasure hunt'
      });
    }
  }
);

// Get treasure hunt by ID
router.get('/:id', 
  optionalAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const treasureHunt = await TreasureHunt.findById(id)
        .populate('promoter', 'name organization profile')
        .populate('participants', 'name progress.status');
      
      if (!treasureHunt) {
        return res.status(404).json({
          error: 'Treasure Hunt Not Found',
          message: 'Treasure hunt with the specified ID does not exist'
        });
      }
      
      // Check if user can view this treasure hunt
      const isOwner = req.promoter && treasureHunt.promoter._id.toString() === req.promoter._id.toString();
      const isAdmin = req.promoter && ['admin', 'super_admin'].includes(req.promoter.role);
      const isPublic = treasureHunt.settings.isPublic && treasureHunt.status === 'published';
      
      if (!isOwner && !isAdmin && !isPublic) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'You do not have permission to view this treasure hunt'
        });
      }
      
      // Hide solutions from non-owners
      let responseData = treasureHunt.toObject();
      if (!isOwner && !isAdmin) {
        responseData.clues = responseData.clues?.map(clue => {
          const { solution, ...clueWithoutSolution } = clue;
          return clueWithoutSolution;
        });
      }
      
      res.json({
        message: 'Treasure hunt retrieved successfully',
        data: { treasureHunt: responseData }
      });
      
    } catch (error) {
      console.error('❌ Treasure Hunt Retrieval Error:', error);
      res.status(500).json({
        error: 'Treasure Hunt Retrieval Failed',
        message: 'An error occurred while retrieving treasure hunt'
      });
    }
  }
);

// Update treasure hunt
router.put('/:id', 
  authenticateToken,
  checkPermission('canEditEvents'),
  checkOwnership(TreasureHunt),
  validate(treasureHuntSchema),
  async (req, res) => {
    try {
      const updates = req.body;
      
      // Prevent updating certain fields after publication
      if (req.resource.status === 'published') {
        const restrictedFields = ['pricing', 'schedule.startDate', 'schedule.endDate'];
        const hasRestrictedUpdates = restrictedFields.some(field => {
          const fieldParts = field.split('.');
          return fieldParts.length === 1 ? 
            updates[field] !== undefined : 
            updates[fieldParts[0]] && updates[fieldParts[0]][fieldParts[1]] !== undefined;
        });
        
        if (hasRestrictedUpdates) {
          return res.status(400).json({
            error: 'Invalid Update',
            message: 'Cannot modify pricing or schedule for published treasure hunts'
          });
        }
      }
      
      Object.assign(req.resource, updates);
      await req.resource.save();
      
      await req.resource.populate('promoter', 'name organization');
      
      res.json({
        message: 'Treasure hunt updated successfully',
        data: { treasureHunt: req.resource }
      });
      
    } catch (error) {
      console.error('❌ Treasure Hunt Update Error:', error);
      res.status(500).json({
        error: 'Treasure Hunt Update Failed',
        message: 'An error occurred while updating treasure hunt'
      });
    }
  }
);

// Delete treasure hunt
router.delete('/:id', 
  authenticateToken,
  checkPermission('canDeleteEvents'),
  checkOwnership(TreasureHunt),
  async (req, res) => {
    try {
      // Check if there are participants
      const participantCount = await Participant.countDocuments({ 
        treasureHunt: req.resource._id,
        paymentStatus: 'confirmed'
      });
      
      if (participantCount > 0) {
        return res.status(400).json({
          error: 'Cannot Delete Treasure Hunt',
          message: `Cannot delete treasure hunt with ${participantCount} confirmed participants`
        });
      }
      
      // Delete associated participants (if any pending)
      await Participant.deleteMany({ treasureHunt: req.resource._id });
      
      await TreasureHunt.findByIdAndDelete(req.resource._id);
      
      res.json({
        message: 'Treasure hunt deleted successfully'
      });
      
    } catch (error) {
      console.error('❌ Treasure Hunt Deletion Error:', error);
      res.status(500).json({
        error: 'Treasure Hunt Deletion Failed',
        message: 'An error occurred while deleting treasure hunt'
      });
    }
  }
);

// Publish treasure hunt
router.patch('/:id/publish', 
  authenticateToken,
  checkOwnership(TreasureHunt),
  async (req, res) => {
    try {
      if (req.resource.status !== 'draft') {
        return res.status(400).json({
          error: 'Invalid Status',
          message: 'Only draft treasure hunts can be published'
        });
      }
      
      // Validate treasure hunt is complete
      if (!req.resource.clues || req.resource.clues.length === 0) {
        return res.status(400).json({
          error: 'Incomplete Treasure Hunt',
          message: 'Treasure hunt must have at least one clue to be published'
        });
      }
      
      req.resource.status = 'published';
      await req.resource.save();
      
      res.json({
        message: 'Treasure hunt published successfully',
        data: { treasureHunt: req.resource }
      });
      
    } catch (error) {
      console.error('❌ Treasure Hunt Publishing Error:', error);
      res.status(500).json({
        error: 'Treasure Hunt Publishing Failed',
        message: 'An error occurred while publishing treasure hunt'
      });
    }
  }
);

// Cancel treasure hunt
router.patch('/:id/cancel', 
  authenticateToken,
  checkOwnership(TreasureHunt),
  async (req, res) => {
    try {
      const { reason } = req.body;
      
      if (req.resource.status === 'completed') {
        return res.status(400).json({
          error: 'Cannot Cancel',
          message: 'Cannot cancel a completed treasure hunt'
        });
      }
      
      req.resource.status = 'cancelled';
      if (reason) {
        req.resource.notes = reason;
      }
      await req.resource.save();
      
      // TODO: Send cancellation emails to participants
      // TODO: Process refunds if needed
      
      res.json({
        message: 'Treasure hunt cancelled successfully',
        data: { treasureHunt: req.resource }
      });
      
    } catch (error) {
      console.error('❌ Treasure Hunt Cancellation Error:', error);
      res.status(500).json({
        error: 'Treasure Hunt Cancellation Failed',
        message: 'An error occurred while cancelling treasure hunt'
      });
    }
  }
);

// Register participant for treasure hunt
router.post('/:id/register', 
  validate(participantRegistrationSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const treasureHunt = await TreasureHunt.findById(id);
      
      if (!treasureHunt) {
        return res.status(404).json({
          error: 'Treasure Hunt Not Found',
          message: 'Treasure hunt with the specified ID does not exist'
        });
      }
      
      if (!treasureHunt.isRegistrationOpen()) {
        return res.status(400).json({
          error: 'Registration Closed',
          message: 'Registration is not open for this treasure hunt'
        });
      }
      
      // Check if participant already registered
      const existingParticipant = await Participant.findOne({
        treasureHunt: id,
        email: req.body.email
      });
      
      if (existingParticipant) {
        return res.status(409).json({
          error: 'Already Registered',
          message: 'A participant with this email is already registered for this treasure hunt'
        });
      }
      
      // Validate payment amount matches tier
      const expectedAmount = treasureHunt.pricing.registrationFee[req.body.tier];
      if (req.body.paymentDetails.amount !== expectedAmount) {
        return res.status(400).json({
          error: 'Invalid Payment Amount',
          message: `Payment amount does not match ${req.body.tier} tier fee of ${expectedAmount} ${treasureHunt.pricing.currency}`
        });
      }
      
      // Create participant
      const participantData = {
        ...req.body,
        treasureHunt: id,
        paymentStatus: 'pending' // Will be confirmed after blockchain verification
      };
      
      const participant = new Participant(participantData);
      await participant.save();
      
      // TODO: Verify payment on blockchain
      // For now, we'll mark as confirmed
      participant.paymentStatus = 'confirmed';
      await participant.save();
      
      // Update treasure hunt participant count
      treasureHunt.participation.currentParticipants += 1;
      treasureHunt.analytics.registrations += 1;
      await treasureHunt.save();
      
      res.status(201).json({
        message: 'Registration successful',
        data: { 
          participant: participant.toObject(),
          treasureHunt: {
            id: treasureHunt._id,
            title: treasureHunt.title,
            status: treasureHunt.huntStatus
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Participant Registration Error:', error);
      res.status(500).json({
        error: 'Registration Failed',
        message: 'An error occurred during registration'
      });
    }
  }
);

// Get treasure hunt participants
router.get('/:id/participants', 
  authenticateToken,
  checkOwnership(TreasureHunt),
  async (req, res) => {
    try {
      const participants = await Participant.find({ 
        treasureHunt: req.resource._id 
      }).sort({ createdAt: -1 });
      
      res.json({
        message: 'Participants retrieved successfully',
        data: {
          participants,
          count: participants.length,
          confirmed: participants.filter(p => p.paymentStatus === 'confirmed').length
        }
      });
      
    } catch (error) {
      console.error('❌ Participants Retrieval Error:', error);
      res.status(500).json({
        error: 'Participants Retrieval Failed',
        message: 'An error occurred while retrieving participants'
      });
    }
  }
);

// Get treasure hunt leaderboard
router.get('/:id/leaderboard', 
  async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      
      const leaderboard = await Participant.getLeaderboard(id, limit);
      
      res.json({
        message: 'Leaderboard retrieved successfully',
        data: { leaderboard }
      });
      
    } catch (error) {
      console.error('❌ Leaderboard Retrieval Error:', error);
      res.status(500).json({
        error: 'Leaderboard Retrieval Failed',
        message: 'An error occurred while retrieving leaderboard'
      });
    }
  }
);

// Get treasure hunt analytics
router.get('/:id/analytics', 
  authenticateToken,
  checkOwnership(TreasureHunt),
  async (req, res) => {
    try {
      const [
        participantStats,
        completionStats,
        revenueStats
      ] = await Promise.all([
        Participant.aggregate([
          { $match: { treasureHunt: req.resource._id } },
          {
            $group: {
              _id: '$tier',
              count: { $sum: 1 },
              confirmed: {
                $sum: { $cond: [{ $eq: ['$paymentStatus', 'confirmed'] }, 1, 0] }
              }
            }
          }
        ]),
        Participant.aggregate([
          { $match: { treasureHunt: req.resource._id, paymentStatus: 'confirmed' } },
          {
            $group: {
              _id: '$progress.status',
              count: { $sum: 1 }
            }
          }
        ]),
        Participant.aggregate([
          { $match: { treasureHunt: req.resource._id, paymentStatus: 'confirmed' } },
          {
            $group: {
              _id: '$tier',
              totalRevenue: { $sum: '$paymentDetails.amount' },
              count: { $sum: 1 }
            }
          }
        ])
      ]);
      
      const analytics = {
        participants: participantStats,
        completion: completionStats,
        revenue: revenueStats,
        overview: {
          totalViews: req.resource.analytics.views,
          totalRegistrations: req.resource.analytics.registrations,
          totalCompletions: req.resource.analytics.completions
        }
      };
      
      res.json({
        message: 'Analytics retrieved successfully',
        data: { analytics }
      });
      
    } catch (error) {
      console.error('❌ Analytics Retrieval Error:', error);
      res.status(500).json({
        error: 'Analytics Retrieval Failed',
        message: 'An error occurred while retrieving analytics'
      });
    }
  }
);

export default router;