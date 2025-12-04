import express from 'express';
import jwt from 'jsonwebtoken';
import Participant from '../models/Participant.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  validate,
  participantRegistrationSchema,
  participantLoginSchema
} from '../middleware/validation.js';

const router = express.Router();

// @route   POST /api/participants/register
// @desc    Register new participant
// @access  Public
router.post('/register', validate(participantRegistrationSchema), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      tier,
      walletAddress,
      referralCode,
      turnstileToken
    } = req.body;

    // Verify Turnstile token
    if (!turnstileToken) {
      return res.status(400).json({
        success: false,
        error: 'Captcha verification required'
      });
    }

    // Verify turnstile token with Cloudflare
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_PARTICIPANT,
        response: turnstileToken
      })
    });

    const turnstileResult = await turnstileResponse.json();
    
    if (!turnstileResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Captcha verification failed'
      });
    }

    // Check if participant already exists
    const existingParticipant = await Participant.findOne({ 
      $or: [{ email }, { walletAddress }] 
    });

    if (existingParticipant) {
      return res.status(409).json({
        success: false,
        error: 'Participant already registered with this email or wallet'
      });
    }

    // Create new participant
    const participant = new Participant({
      firstName,
      lastName,
      email,
      phone,
      tier,
      walletAddress,
      referralCode,
      registrationDate: new Date(),
      isActive: true,
      paymentStatus: tier === 'free' ? 'completed' : 'pending'
    });

    await participant.save();

    console.log('✅ New participant registered:', email);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      participant: {
        id: participant._id,
        email: participant.email,
        tier: participant.tier,
        registrationDate: participant.registrationDate
      }
    });

  } catch (error) {
    console.error('❌ Participant registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// @route   POST /api/participants/signin
// @desc    Sign in participant
// @access  Public
router.post('/signin', validate(participantLoginSchema), async (req, res) => {
  try {
    const { email, turnstileToken } = req.body;

    // Verify Turnstile token
    if (!turnstileToken) {
      return res.status(400).json({
        success: false,
        error: 'Captcha verification required'
      });
    }

    // Verify turnstile token with Cloudflare
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_PARTICIPANT_SIGNIN,
        response: turnstileToken
      })
    });

    const turnstileResult = await turnstileResponse.json();
    
    if (!turnstileResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Captcha verification failed'
      });
    }

    // Find participant
    const participant = await Participant.findOne({ email });
    
    if (!participant) {
      return res.status(401).json({
        success: false,
        error: 'Participant not found'
      });
    }

    if (!participant.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Update last login
    participant.lastLoginAt = new Date();
    await participant.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: participant._id, 
        email: participant.email,
        type: 'participant'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Participant signed in:', email);

    res.json({
      success: true,
      message: 'Sign in successful',
      token,
      participant: {
        id: participant._id,
        email: participant.email,
        firstName: participant.firstName,
        lastName: participant.lastName,
        tier: participant.tier,
        lastLoginAt: participant.lastLoginAt
      }
    });

  } catch (error) {
    console.error('❌ Participant signin error:', error);
    res.status(500).json({
      success: false,
      error: 'Sign in failed'
    });
  }
});

// @route   GET /api/participants
// @desc    Get all participants (admin only)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const participants = await Participant.find({})
      .select('-__v')
      .sort({ registrationDate: -1 });

    res.json({
      success: true,
      count: participants.length,
      participants
    });

  } catch (error) {
    console.error('❌ Get participants error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participants'
    });
  }
});

// @route   GET /api/participants/me
// @desc    Get current participant profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const participant = await Participant.findById(req.user.id)
      .select('-__v');

    if (!participant) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }

    res.json({
      success: true,
      participant
    });

  } catch (error) {
    console.error('❌ Get participant profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

export default router;