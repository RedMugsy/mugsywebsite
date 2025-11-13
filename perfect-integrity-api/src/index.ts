import express from 'express';
import { getDb } from './db.js';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    'https://redmugsy.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Email configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Turnstile verification function
async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  if (!secret || !token) {
    return false; // Fail if not configured
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret: secret,
        response: token
      })
    });

    const data = await response.json() as { success: boolean };
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    message: 'Perfect Integrity - Red Mugsy Community Newsletter API',
    features: ['email_verification', 'subscription_completion', 'admin_panel'],
    service: 'community-newsletter'
  });
});

// Also keep /api/health for backwards compatibility
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    message: 'Perfect Integrity - Red Mugsy Community Newsletter API',
    features: ['email_verification', 'subscription_completion', 'admin_panel'],
    service: 'community-newsletter'
  });
});

// Community subscription captcha endpoint
app.get('/api/newsletter/captcha', (req, res) => {
  res.json({
    type: 'turnstile',
    sitekey: process.env.TURNSTILE_SITEKEY_COMMUNITY || '0x4AAAAAAB_cZtzk94J3ZRyDKnOYoaQ6sKo'
  });
});

// Step 1: Initial email subscription (sends verification email)
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email: rawEmail, turnstileToken } = req.body;
    const email = (rawEmail || "").trim().toLowerCase();
    
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: "invalid_email" });
    }

    // Verify Turnstile token for Community Subscription
    if (process.env.TURNSTILE_SECRET_COMMUNITY && turnstileToken) {
      const turnstileValid = await verifyTurnstile(turnstileToken, process.env.TURNSTILE_SECRET_COMMUNITY);
      if (!turnstileValid) {
        return res.status(400).json({ ok: false, error: 'invalid_captcha' });
      }
    }

    const db = await getDb();
    const verificationToken = randomBytes(32).toString('hex');
    
    // Create or update subscription record
    const subscription = await db.newsletterSubscription.upsert({
      where: { email },
      update: {
        verificationToken,
        verificationSentAt: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      },
      create: {
        email,
        source: 'community-page',
        active: false, // Will be true after verification
        verificationToken,
        verificationSentAt: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    // Send verification email
    try {
      const transporter = createEmailTransporter();
      const verificationUrl = `${process.env.FRONTEND_URL || 'https://redmugsy.com'}/verify-email?token=${verificationToken}`;
      
      const mailOptions = {
        from: process.env.MAIL_FROM || 'community@redmugsy.com',
        to: email,
        subject: 'Welcome to the Red Mugsy Community! 🔥',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #ff0000, #cc0000); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🔥 Welcome to Red Mugsy Community! 🔥</h1>
              <p style="color: #ffcccc; margin: 10px 0 0 0; font-size: 16px;">Join the revolution • Get exclusive updates • Be part of the movement</p>
            </div>
            <div style="padding: 40px 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email to Join the Community</h2>
              <p style="color: #666; line-height: 1.8; font-size: 16px; margin: 0 0 30px 0;">
                You're one click away from joining the Red Mugsy community! Get ready for:
                <br><br>
                🚀 <strong>Exclusive updates</strong> on Red Mugsy developments<br>
                🎯 <strong>Early access</strong> to new features and announcements<br>
                🔥 <strong>Community events</strong> and meme contests<br>
                💎 <strong>Investment insights</strong> and market updates
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #ff0000, #cc0000); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255,0,0,0.3); transition: all 0.3s ease;">
                  🚀 JOIN THE COMMUNITY
                </a>
              </div>
              <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #ff0000; margin: 30px 0;">
                <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>Can't click the button?</strong><br>
                  Copy and paste this link into your browser:<br>
                  <a href="${verificationUrl}" style="color: #ff0000; word-break: break-all;">${verificationUrl}</a>
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0 0 0;">
                <p style="color: #999; font-size: 12px; margin: 0;">This verification link expires in 24 hours</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">Questions? Reply to this email for support</p>
              </div>
            </div>
            <div style="background: #333; padding: 20px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} Red Mugsy Community. All rights reserved.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Community verification email sent to:', email);
      
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Continue anyway - they can try subscribing again
    }

    res.json({ 
      ok: true, 
      message: 'Verification email sent! Please check your inbox and click the verification link to complete your subscription.',
      requiresVerification: true,
      email: email
    });

  } catch (error) {
    console.error('Community subscription error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'subscription_failed',
      message: 'Please try again later'
    });
  }
});

// Step 2: Email verification endpoint
app.get('/api/newsletter/verify', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ ok: false, error: 'missing_token' });
    }

    const db = await getDb();
    
    // Find subscription by verification token
    const subscription = await db.newsletterSubscription.findUnique({
      where: { verificationToken: token }
    });

    if (!subscription) {
      return res.status(404).json({ ok: false, error: 'invalid_token' });
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - subscription.verificationSentAt.getTime();
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return res.status(410).json({ ok: false, error: 'token_expired' });
    }

    // Mark as verified
    await db.newsletterSubscription.update({
      where: { id: subscription.id },
      data: {
        active: true,
        verifiedAt: new Date(),
        verificationToken: null // Clear token after use
      }
    });

    // Redirect to subscription completion form
    const formUrl = `${process.env.FRONTEND_URL || 'https://redmugsy.com'}/complete-subscription?email=${encodeURIComponent(subscription.email)}`;
    res.redirect(formUrl);

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ ok: false, error: 'verification_failed' });
  }
});

// Step 3: Complete subscription with additional details
app.post('/api/newsletter/complete', async (req, res) => {
  try {
    const { email, firstName, lastName, gender, dateOfBirth, hearAboutUs } = req.body;
    
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: 'invalid_email' });
    }

    const db = await getDb();
    
    // Find verified subscription
    const subscription = await db.newsletterSubscription.findUnique({
      where: { email }
    });

    if (!subscription || !subscription.active || !subscription.verifiedAt) {
      return res.status(400).json({ 
        ok: false, 
        error: 'unverified_email',
        message: 'Please verify your email first'
      });
    }

    // Update with additional details
    await db.newsletterSubscription.update({
      where: { email },
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        hearAboutUs: hearAboutUs?.trim(),
        subscriptionCompletedAt: new Date()
      }
    });

    res.json({ 
      ok: true, 
      message: 'Welcome to the Red Mugsy Community!',
      welcomeMessage: `Welcome to the Red Mugsy Community, ${firstName || 'fellow revolutionary'}! 🔥 You're now part of an exclusive group that gets first access to updates, announcements, and community events. Get ready for the revolution!`
    });

  } catch (error) {
    console.error('Subscription completion error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'completion_failed',
      message: 'Please try again'
    });
  }
});

// Admin endpoint to view community subscriptions
app.get('/api/admin/subscriptions', async (req, res) => {
  try {
    const db = await getDb();
    const subscriptions = await db.newsletterSubscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100
    });

    const safeSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      email: sub.email,
      firstName: sub.firstName,
      lastName: sub.lastName,
      gender: sub.gender,
      hearAboutUs: sub.hearAboutUs,
      active: sub.active,
      verified: !!sub.verifiedAt,
      completed: !!sub.subscriptionCompletedAt,
      createdAt: sub.createdAt,
      verifiedAt: sub.verifiedAt,
      completedAt: sub.subscriptionCompletedAt,
      source: sub.source
    }));

    res.json({ 
      ok: true, 
      subscriptions: safeSubscriptions, 
      total: subscriptions.length,
      stats: {
        verified: safeSubscriptions.filter(s => s.verified).length,
        completed: safeSubscriptions.filter(s => s.completed).length,
        pending: safeSubscriptions.filter(s => !s.verified).length,
        community: safeSubscriptions.filter(s => s.source === 'community-page').length
      }
    });
  } catch (error) {
    console.error('Admin subscriptions error:', error);
    res.status(500).json({ ok: false, error: 'fetch_failed' });
  }
});

const PORT = process.env.PORT || 8788;
// Deploy trigger: ensure latest commit builds correctly
app.listen(PORT, () => {
  console.log(`🔥 Red Mugsy Community Newsletter API running on port ${PORT}`);
  console.log('✨ Perfect Integrity Service - Email verification and subscription management');
  console.log('🚀 Features: Email verification, community signup, admin panel');
});