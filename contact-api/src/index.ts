import express from 'express';
import { getDb } from './db.js';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createHash } from 'crypto';
import multer from 'multer';

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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf','image/png','image/jpeg','image/webp','text/plain'];
    cb(null, allowed.includes(file.mimetype));
  }
});

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

// CSRF token generation
const generateCSRF = () => randomBytes(32).toString('hex');
const csrfTokens = new Set();

// Session store (in production, use Redis or similar)
const sessions = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    message: 'Contact Us API is running',
    features: ['contact_form', 'file_uploads', 'admin_panel']
  });
});

// Also keep /api/health for backwards compatibility
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    message: 'Contact Us API is running',
    features: ['contact_form', 'file_uploads', 'admin_panel']
  });
});

// CSRF endpoint
app.get('/api/contact/csrf', (req, res) => {
  const token = generateCSRF();
  csrfTokens.add(token);
  
  // Clean up old tokens (keep last 100)
  if (csrfTokens.size > 100) {
    const tokensArray = Array.from(csrfTokens);
    csrfTokens.clear();
    tokensArray.slice(-50).forEach(t => csrfTokens.add(t));
  }
  
  res.json({ token });
});

// Timestamp endpoint
app.get('/api/contact/timestamp', (req, res) => {
  const now = Date.now();
  const signature = createHash('sha256')
    .update(`${now}-${process.env.TIMESTAMP_SECRET || 'fallback-secret'}`)
    .digest('hex');
  
  res.json({ 
    issuedAt: now,
    issuedSig: signature 
  });
});

// Captcha endpoint (simple implementation)
app.get('/api/contact/captcha', (req, res) => {
  // For now, return a simple verification token
  // In production, integrate with Cloudflare Turnstile or similar
  const token = randomBytes(16).toString('hex');
  
  res.json({
    type: 'turnstile',
    token: token,
    sitekey: process.env.TURNSTILE_SITEKEY || ''
  });
});

// Main contact form submission
app.post('/api/contact', upload.single('file'), async (req, res) => {
  try {
    // CSRF validation
    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken || !csrfTokens.has(csrfToken)) {
      return res.status(403).json({ ok: false, error: 'invalid_csrf' });
    }

    // Extract form data
    const {
      locale = 'en',
      name,
      email,
      company = '',
      phoneCountry,
      phoneDialCode,
      phoneNational,
      phoneE164,
      purpose,
      otherReason,
      subject,
      message,
      walletAddress,
      website = '', // honeypot
      issuedAt,
      issuedSig,
      captcha
    } = req.body;

    // Honeypot check
    if (website) {
      return res.status(400).json({ ok: false, error: 'spam_detected' });
    }

    // Validation
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: 'invalid_email' });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ ok: false, error: 'invalid_name' });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({ ok: false, error: 'invalid_message' });
    }

    // Generate request ID
    const requestId = randomBytes(8).toString('hex').toUpperCase();

    // Save to database
    const db = await getDb();
    const submission = await db.contactSubmission.create({
      data: {
        requestId,
        locale,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        company: company.trim(),
        phoneCountry,
        phoneDialCode,
        phoneNational,
        phoneE164,
        purpose,
        otherReason: purpose === 'Other' ? otherReason?.trim() : null,
        subject: subject.trim(),
        message: message.trim(),
        walletAddress: walletAddress?.trim(),
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        fileMimeType: req.file?.mimetype,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'new'
      }
    });

    // Send notification email to admin
    try {
      const transporter = createEmailTransporter();
      
      const adminEmail = {
        from: process.env.MAIL_FROM || 'noreply@redmugsy.com',
        to: process.env.MAIL_TO || 'support@redmugsy.com',
        subject: `New Contact Form: ${subject} [${requestId}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0;">New Contact Form Submission</h2>
              <p style="color: #666; margin: 5px 0 0 0;">Request ID: <strong>${requestId}</strong></p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; background: #f8f9fa; font-weight: bold;">Name:</td><td style="padding: 8px;">${name}</td></tr>
              <tr><td style="padding: 8px; background: #f8f9fa; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
              <tr><td style="padding: 8px; background: #f8f9fa; font-weight: bold;">Company:</td><td style="padding: 8px;">${company}</td></tr>
              <tr><td style="padding: 8px; background: #f8f9fa; font-weight: bold;">Phone:</td><td style="padding: 8px;">${phoneE164}</td></tr>
              <tr><td style="padding: 8px; background: #f8f9fa; font-weight: bold;">Purpose:</td><td style="padding: 8px;">${purpose}</td></tr>
              <tr><td style="padding: 8px; background: #f8f9fa; font-weight: bold;">Subject:</td><td style="padding: 8px;">${subject}</td></tr>
              <tr><td style="padding: 8px; background: #f8f9fa; font-weight: bold;">Wallet:</td><td style="padding: 8px;">${walletAddress}</td></tr>
            </table>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Message:</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            ${req.file ? `<p><strong>Attachment:</strong> ${req.file.originalname} (${Math.round(req.file.size / 1024)}KB)</p>` : ''}
          </div>
        `
      };

      await transporter.sendMail(adminEmail);
      console.log('Admin notification sent for:', requestId);
      
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the submission if email fails
    }

    res.json({ 
      ok: true, 
      requestId,
      message: 'Your message has been submitted successfully. We will respond within 2-3 business days.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'submission_failed',
      message: 'Please try again later'
    });
  }
});

// Admin endpoint to view submissions
app.get('/api/admin/submissions', async (req, res) => {
  try {
    const { type = 'contact', take = '100', skip = '0', q = '', sortBy = 'createdAt', sortDir = 'desc' } = req.query;
    const takeNum = Math.min(parseInt(take as string) || 100, 100);
    const skipNum = parseInt(skip as string) || 0;
    
    const db = await getDb();
    
    const where = q ? {
      OR: [
        { name: { contains: q as string, mode: 'insensitive' as const } },
        { email: { contains: q as string, mode: 'insensitive' as const } },
        { subject: { contains: q as string, mode: 'insensitive' as const } },
        { requestId: { contains: q as string, mode: 'insensitive' as const } }
      ]
    } : {};

    if (type === 'claims') {
      // Future claims functionality
      const claims = await db.claimSubmission.findMany({
        where,
        orderBy: { [sortBy as string]: sortDir },
        take: takeNum,
        skip: skipNum
      });
      
      const total = await db.claimSubmission.count({ where });
      
      return res.json({ 
        ok: true, 
        items: claims.map(claim => ({
          id: claim.id,
          requestId: claim.requestId,
          name: claim.name,
          email: claim.email,
          claimType: claim.claimType,
          status: claim.status,
          createdAt: claim.createdAt
        })),
        total 
      });
    }

    // Default: contact submissions
    const submissions = await db.contactSubmission.findMany({
      where,
      orderBy: { [sortBy as string]: sortDir },
      take: takeNum,
      skip: skipNum
    });
    
    const total = await db.contactSubmission.count({ where });

    const safeSubmissions = submissions.map(sub => ({
      id: sub.id,
      requestId: sub.requestId,
      name: sub.name,
      email: sub.email,
      company: sub.company,
      purpose: sub.purpose,
      subject: sub.subject,
      status: sub.status,
      createdAt: sub.createdAt,
      hasAttachment: !!sub.fileName
    }));

    res.json({ 
      ok: true, 
      items: safeSubmissions, 
      total
    });
  } catch (error) {
    console.error('Admin submissions error:', error);
    res.status(500).json({ ok: false, error: 'fetch_failed' });
  }
});

// Basic claims endpoint for future use
app.post('/api/claims', upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      email,
      claimType,
      productModel,
      purchaseDate,
      issueDescription
    } = req.body;

    if (!name || !email || !claimType || !issueDescription) {
      return res.status(400).json({ ok: false, error: 'missing_required_fields' });
    }

    const requestId = randomBytes(8).toString('hex').toUpperCase();
    const images = (req.files as Express.Multer.File[])?.map(file => file.path) || [];

    const db = await getDb();
    const claim = await db.claimSubmission.create({
      data: {
        requestId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        claimType,
        productModel: productModel?.trim(),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        issueDescription: issueDescription.trim(),
        images,
        status: 'submitted'
      }
    });

    res.json({ 
      ok: true, 
      requestId,
      message: 'Claim submitted successfully. We will review and respond within 5-7 business days.'
    });

  } catch (error) {
    console.error('Claims submission error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'submission_failed',
      message: 'Please try again later'
    });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Red Mugsy Contact API running on port ${PORT}`);
  console.log('Features: Contact forms, file uploads, admin panel');
});