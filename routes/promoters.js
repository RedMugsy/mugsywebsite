import express from 'express';
import Promoter from '../models/Promoter.js';
import TreasureHunt from '../models/TreasureHunt.js';
import { 
  authenticateToken, 
  authorize, 
  checkPermission 
} from '../middleware/auth.js';
import { 
  validate, 
  validateQuery, 
  paginationSchema 
} from '../middleware/validation.js';
import {
  sendPromoterApprovalEmail,
  sendPromoterRejectionEmail,
  sendPromoterSuspensionEmail
} from '../services/emailService.js';

const router = express.Router();

// Get all promoters (admin only)
router.get('/', 
  authenticateToken, 
  authorize('admin', 'super_admin'),
  validateQuery(paginationSchema),
  async (req, res) => {
    try {
      const { page, limit, sort = 'createdAt', order } = req.query;
      const skip = (page - 1) * limit;
      
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj = { [sort]: sortOrder };
      
      const [promoters, total] = await Promise.all([
        Promoter.find({})
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .select('-password -refreshTokens'),
        Promoter.countDocuments({})
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      res.json({
        message: 'Promoters retrieved successfully',
        data: {
          promoters,
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
      console.error('❌ Promoters Retrieval Error:', error);
      res.status(500).json({
        error: 'Promoters Retrieval Failed',
        message: 'An error occurred while retrieving promoters'
      });
    }
  }
);

// Get promoter by ID
router.get('/:id', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if requesting own profile or admin
      const isOwnProfile = req.promoter._id.toString() === id;
      const isAdmin = ['admin', 'super_admin'].includes(req.promoter.role);
      
      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'You can only view your own profile'
        });
      }
      
      const promoter = await Promoter.findById(id).select('-password -refreshTokens');
      
      if (!promoter) {
        return res.status(404).json({
          error: 'Promoter Not Found',
          message: 'Promoter with the specified ID does not exist'
        });
      }
      
      res.json({
        message: 'Promoter retrieved successfully',
        data: { promoter }
      });
      
    } catch (error) {
      console.error('❌ Promoter Retrieval Error:', error);
      res.status(500).json({
        error: 'Promoter Retrieval Failed',
        message: 'An error occurred while retrieving promoter'
      });
    }
  }
);

// Update promoter profile
router.put('/:id', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if updating own profile or admin
      const isOwnProfile = req.promoter._id.toString() === id;
      const isAdmin = ['admin', 'super_admin'].includes(req.promoter.role);
      
      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'You can only update your own profile'
        });
      }
      
      const promoter = await Promoter.findById(id);
      
      if (!promoter) {
        return res.status(404).json({
          error: 'Promoter Not Found',
          message: 'Promoter with the specified ID does not exist'
        });
      }
      
      // Fields that can be updated by promoter
      const allowedUpdates = ['name', 'organization', 'phone', 'profile'];
      
      // Additional fields that admins can update
      const adminOnlyUpdates = ['role', 'status', 'verified', 'permissions'];
      
      const updates = {};
      
      // Process allowed updates
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      // Process admin-only updates
      if (isAdmin) {
        adminOnlyUpdates.forEach(field => {
          if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
          }
        });
      }
      
      // Update promoter
      Object.assign(promoter, updates);
      await promoter.save();
      
      res.json({
        message: 'Promoter updated successfully',
        data: {
          promoter: await Promoter.findById(id).select('-password -refreshTokens')
        }
      });
      
    } catch (error) {
      console.error('❌ Promoter Update Error:', error);
      res.status(500).json({
        error: 'Promoter Update Failed',
        message: 'An error occurred while updating promoter'
      });
    }
  }
);

// Delete promoter (admin only)
router.delete('/:id', 
  authenticateToken, 
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const promoter = await Promoter.findById(id);
      
      if (!promoter) {
        return res.status(404).json({
          error: 'Promoter Not Found',
          message: 'Promoter with the specified ID does not exist'
        });
      }
      
      // Check if promoter has treasure hunts
      const treasureHuntCount = await TreasureHunt.countDocuments({ promoter: id });
      
      if (treasureHuntCount > 0) {
        return res.status(400).json({
          error: 'Cannot Delete Promoter',
          message: `Promoter has ${treasureHuntCount} treasure hunt(s) associated. Please reassign or delete them first.`
        });
      }
      
      await Promoter.findByIdAndDelete(id);
      
      res.json({
        message: 'Promoter deleted successfully'
      });
      
    } catch (error) {
      console.error('❌ Promoter Deletion Error:', error);
      res.status(500).json({
        error: 'Promoter Deletion Failed',
        message: 'An error occurred while deleting promoter'
      });
    }
  }
);

// Approve promoter (admin only)
router.patch('/:id/approve', 
  authenticateToken, 
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const promoter = await Promoter.findById(id);
      
      if (!promoter) {
        return res.status(404).json({
          error: 'Promoter Not Found',
          message: 'Promoter with the specified ID does not exist'
        });
      }
      
      promoter.status = 'active';
      await promoter.save();
      
      try {
        await sendPromoterApprovalEmail({
          to: promoter.email,
          name: promoter.name
        });
      } catch (emailError) {
        console.error('❌ Promoter Approval Email Error:', emailError);
      }
      
      res.json({
        message: 'Promoter approved successfully',
        data: {
          promoter: await Promoter.findById(id).select('-password -refreshTokens')
        }
      });
      
    } catch (error) {
      console.error('❌ Promoter Approval Error:', error);
      res.status(500).json({
        error: 'Promoter Approval Failed',
        message: 'An error occurred while approving promoter'
      });
    }
  }
);

// Reject promoter (admin only)
router.patch('/:id/reject', 
  authenticateToken, 
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const promoter = await Promoter.findById(id);
      
      if (!promoter) {
        return res.status(404).json({
          error: 'Promoter Not Found',
          message: 'Promoter with the specified ID does not exist'
        });
      }
      
      promoter.status = 'rejected';
      if (reason) {
        promoter.notes = reason;
      }
      await promoter.save();
      
      try {
        await sendPromoterRejectionEmail({
          to: promoter.email,
          name: promoter.name,
          reason
        });
      } catch (emailError) {
        console.error('❌ Promoter Rejection Email Error:', emailError);
      }
      
      res.json({
        message: 'Promoter rejected successfully',
        data: {
          promoter: await Promoter.findById(id).select('-password -refreshTokens')
        }
      });
      
    } catch (error) {
      console.error('❌ Promoter Rejection Error:', error);
      res.status(500).json({
        error: 'Promoter Rejection Failed',
        message: 'An error occurred while rejecting promoter'
      });
    }
  }
);

// Suspend promoter (admin only)
router.patch('/:id/suspend', 
  authenticateToken, 
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const promoter = await Promoter.findById(id);
      
      if (!promoter) {
        return res.status(404).json({
          error: 'Promoter Not Found',
          message: 'Promoter with the specified ID does not exist'
        });
      }
      
      promoter.status = 'suspended';
      if (reason) {
        promoter.notes = reason;
      }
      
      // Clear all refresh tokens (force logout)
      promoter.refreshTokens = [];
      
      await promoter.save();
      
      try {
        await sendPromoterSuspensionEmail({
          to: promoter.email,
          name: promoter.name,
          reason
        });
      } catch (emailError) {
        console.error('❌ Promoter Suspension Email Error:', emailError);
      }
      
      res.json({
        message: 'Promoter suspended successfully',
        data: {
          promoter: await Promoter.findById(id).select('-password -refreshTokens')
        }
      });
      
    } catch (error) {
      console.error('❌ Promoter Suspension Error:', error);
      res.status(500).json({
        error: 'Promoter Suspension Failed',
        message: 'An error occurred while suspending promoter'
      });
    }
  }
);

// Get promoter's treasure hunts
router.get('/:id/treasure-hunts', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if requesting own treasure hunts or admin
      const isOwnProfile = req.promoter._id.toString() === id;
      const isAdmin = ['admin', 'super_admin'].includes(req.promoter.role);
      
      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'You can only view your own treasure hunts'
        });
      }
      
      const treasureHunts = await TreasureHunt.find({ promoter: id })
        .sort({ createdAt: -1 })
        .select('-clues.solution'); // Don't expose solutions
      
      res.json({
        message: 'Treasure hunts retrieved successfully',
        data: {
          treasureHunts,
          count: treasureHunts.length
        }
      });
      
    } catch (error) {
      console.error('❌ Promoter Treasure Hunts Retrieval Error:', error);
      res.status(500).json({
        error: 'Treasure Hunts Retrieval Failed',
        message: 'An error occurred while retrieving treasure hunts'
      });
    }
  }
);

// Get promoter statistics
router.get('/:id/stats', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if requesting own stats or admin
      const isOwnProfile = req.promoter._id.toString() === id;
      const isAdmin = ['admin', 'super_admin'].includes(req.promoter.role);
      
      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'You can only view your own statistics'
        });
      }
      
      const [
        totalHunts,
        activeHunts,
        completedHunts,
        totalParticipants,
        totalRevenue
      ] = await Promise.all([
        TreasureHunt.countDocuments({ promoter: id }),
        TreasureHunt.countDocuments({ promoter: id, status: 'published' }),
        TreasureHunt.countDocuments({ promoter: id, status: 'completed' }),
        TreasureHunt.aggregate([
          { $match: { promoter: id } },
          { $group: { _id: null, total: { $sum: '$participation.currentParticipants' } } }
        ]),
        TreasureHunt.aggregate([
          { $match: { promoter: id } },
          { 
            $group: { 
              _id: null, 
              pathfinderRevenue: { 
                $sum: { 
                  $multiply: [
                    '$pricing.registrationFee.pathfinder',
                    '$participation.currentParticipants' // This is simplified
                  ]
                }
              },
              keymasterRevenue: { 
                $sum: { 
                  $multiply: [
                    '$pricing.registrationFee.keymaster',
                    '$participation.currentParticipants' // This is simplified
                  ]
                }
              }
            }
          }
        ])
      ]);
      
      const stats = {
        treasureHunts: {
          total: totalHunts,
          active: activeHunts,
          completed: completedHunts,
          draft: totalHunts - activeHunts - completedHunts
        },
        participants: {
          total: totalParticipants[0]?.total || 0
        },
        revenue: {
          estimated: {
            pathfinder: totalRevenue[0]?.pathfinderRevenue || 0,
            keymaster: totalRevenue[0]?.keymasterRevenue || 0
          }
        }
      };
      
      res.json({
        message: 'Statistics retrieved successfully',
        data: { stats }
      });
      
    } catch (error) {
      console.error('❌ Promoter Statistics Error:', error);
      res.status(500).json({
        error: 'Statistics Retrieval Failed',
        message: 'An error occurred while retrieving statistics'
      });
    }
  }
);

export default router;
