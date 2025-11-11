import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import slowDown from 'express-slow-down';
import compression from 'compression';
import { z } from 'zod';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './db';

dotenv.config();

const app = express();
// Trust proxy headers so rate-limiters and IP detection work behind CDNs/proxies
app.set('trust proxy', true);
app.disable('x-powered-by');

// Security headers (API-safe)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  })
);
// Parameter pollution protection
app.use(hpp() as any);
// Basic compression
app.use(compression() as any);

const ADMIN_UI_ENABLED = String(process.env.ADMIN_UI_ENABLED || '').toLowerCase() === 'true';

// Basic JSON body parsing for non-multipart routes
app.use(express.json({ limit: '1mb' }));
// Apply a reasonable timeout to responses to avoid resource hogging
app.use((req, res, next) => {
  try { res.setTimeout(Number(process.env.REQUEST_TIMEOUT_MS || 15000)); } catch {}
  next();
});

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Optional: only allow requests that come through edge (e.g., Cloudflare) by checking a shared header
const EDGE_AUTH_SECRET = process.env.EDGE_AUTH_SECRET || '';
function requireEdgeAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!EDGE_AUTH_SECRET) return next();
  const hdr = (req.headers['x-edge-auth'] || req.headers['cf-edge-auth']) as string | undefined;
  if (hdr && hdr === EDGE_AUTH_SECRET) return next();
  return res.status(403).json({ error: 'forbidden' });
}

// Global and route-specific rate limits / slow-downs
const GLOBAL_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const GLOBAL_MAX = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120);
const globalLimiter = rateLimit({
  windowMs: GLOBAL_WINDOW_MS,
  max: GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    console.warn(`[rate-limit] global limit reached ip=${ip} path=${req.originalUrl}`);
    return res.status(429).json({ error: 'Too many requests' });
  },
});

// Fine-grained route controls
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.CONTACT_MAX_PER_HOUR || 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    console.warn(`[rate-limit] contact limit reached ip=${ip} path=${req.originalUrl}`);
    return res.status(429).json({ error: 'Too many requests' });
  },
});
const contactSlowdown = slowDown({ windowMs: 15 * 60 * 1000, delayAfter: 3, delayMs: 500 });
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_MAX_PER_WINDOW || 20),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    console.warn(`[rate-limit] auth limit reached ip=${ip} path=${req.originalUrl}`);
    return res.status(429).json({ error: 'Too many requests' });
  },
});
const authSlowdown = slowDown({ windowMs: 15 * 60 * 1000, delayAfter: 5, delayMs: 750 });
const turnstileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.TURNSTILE_VERIFY_MAX_PER_MIN || 30),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    console.warn(`[rate-limit] turnstile limit reached ip=${ip} path=${req.originalUrl}`);
    return res.status(429).json({ error: 'Too many requests' });
  },
});

// Apply to sensitive paths
app.use(['/contact', '/api/contact'], contactLimiter as any, contactSlowdown as any, requireEdgeAuth);
app.use('/oauth/token', authLimiter as any, authSlowdown as any, requireEdgeAuth);
app.use('/api/claim/turnstile-verify', turnstileLimiter);
app.use(['/api/claim'], globalLimiter);

// Multer for file upload (memory for email attachment)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ok = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
      'text/plain',
    ];
    if (ok.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

const PurposeEnum = z.enum([
  'General',
  'Partnership',
  'Support',
  'Bug Report',
  'Feedback',
  'Other',
]);

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().max(120).optional().or(z.literal('')),
  phoneCountry: z.string().max(2).optional().or(z.literal('')),
  phoneCode: z.string().max(6).optional().or(z.literal('')),
  phoneNumber: z.string().max(32).optional().or(z.literal('')),
  purpose: PurposeEnum,
  subject: z.string().max(140).optional().or(z.literal('')),
  message: z.string().min(50).max(3000),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional()
    .or(z.literal('')),
  agreePolicy: z.literal(true),
  human: z.boolean().optional(),
  cfTurnstileToken: z.string().optional(),
});

function suggestSubject(purpose: z.infer<typeof PurposeEnum>): string {
  switch (purpose) {
    case 'Partnership':
      return 'Partnership inquiry';
    case 'Support':
      return 'Support request';
    case 'Bug Report':
      return 'Bug report';
    case 'Feedback':
      return 'User feedback';
    case 'General':
      return 'General inquiry';
    case 'Other':
    default:
      return 'Contact request';
  }
}

async function verifyHuman(token?: string, fallbackHuman?: boolean): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (secret && token) {
    try {
      const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token }),
      });
      const data = (await resp.json()) as any;
      return !!data?.success;
    } catch {
      return false;
    }
  }
  // fallback to checkbox
  return !!fallbackHuman;
}

async function verifyTurnstile(token?: string, secretOverride?: string): Promise<boolean> {
  const secret = secretOverride || process.env.TURNSTILE_SECRET;
  // If Turnstile is not configured, allow (dev mode)
  if (!secret) return true;
  // If configured, require a token
  if (!token) return false;
  try {
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await resp.json()) as any;
    return !!data?.success;
  } catch {
    return false;
  }
}

function makeTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.warn('SMTP not fully configured. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS');
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

app.get('/health', async (_req, res) => {
  try {
    // Test database connection
    const db = getDb();
    await db.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});
app.post('/api/ping', (_req, res) => res.json({ ok: true }));
app.get('/api/ping', (_req, res) => res.json({ ok: true }));

// Claim flow helper: verify Turnstile token directly
app.post('/api/claim/turnstile-verify', express.json(), async (req, res) => {
  try {
    const token = req.body?.token as string | undefined;
    const ok = await verifyTurnstile(token, process.env.TURNSTILE_SECRET_CLAIM);
    return res.json({ ok });
  } catch {
    return res.status(500).json({ ok: false });
  }
});

// Claim event logging (used by Claim UI)
app.post('/api/claim/log', express.json(), async (req, res) => {
  try {
    const prisma = getDb();
    const body = req.body || {};
    const item = await prisma.claimEvent.create({
      data: {
        type: String(body.type || 'other'),
        address: body.address || null,
        chainId: body.chainId != null ? Number(body.chainId) : null,
        contract: body.contract || null,
        txHash: body.txHash || null,
        amount: body.amount != null ? String(body.amount) : null,
        status: body.status || null,
        payload: body && Object.keys(body).length ? JSON.stringify(body) : null,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers['user-agent'],
      },
    });
    res.json({ ok: true, id: item.id });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

// Claim eligibility (hybrid: merkle or voucher)
app.get('/api/claim/eligibility', async (req, res) => {
  try {
    const addressRaw = String(req.query.address || '').toLowerCase();
    if (!/^0x[0-9a-f]{40}$/i.test(addressRaw)) return res.json({ method: 'none' });
    const dir = process.env.CLAIM_DATA_DIR || path.join(process.cwd(), 'public', 'claim-data');
    const fp = path.join(dir, 'eligibility.json');
    if (!fs.existsSync(fp)) return res.json({ method: 'none' });
    const map = JSON.parse(fs.readFileSync(fp, 'utf8')) as Record<string, any>;
    const e = map[addressRaw] || map[addressRaw.toLowerCase()] || map['*'];
    if (!e) return res.json({ method: 'none' });
    return res.json(e);
  } catch {
    return res.json({ method: 'none' });
  }
});

// Compatibility endpoints expected by the existing frontend antiSpam util
app.get('/api/contact/csrf', (_req, res) => {
  const token = Math.random().toString(36).slice(2);
  res.json({ token });
});

app.get('/api/contact/timestamp', (_req, res) => {
  const issuedAt = Date.now();
  const issuedSig = 'dev';
  res.json({ issuedAt, issuedSig });
});

app.get('/api/contact/captcha', (_req, res) => {
  // If Turnstile is configured, advertise Turnstile so the frontend renders the widget
  if (process.env.TURNSTILE_SECRET) {
    return res.json({ type: 'turnstile', expiresAt: new Date(Date.now() + 5 * 60_000).toISOString() });
  }
  // Fallback: trivial placeholder
  res.json({ type: 'image', nonce: Math.random().toString(36).slice(2), expiresAt: new Date(Date.now() + 5 * 60_000).toISOString() });
});

app.post('/contact', upload.single('file'), async (req, res) => {
  try {
    const fieldsRaw = {
      ...req.body,
      purpose: req.body?.purpose,
      agreePolicy: req.body?.agreePolicy === 'true' || req.body?.agreePolicy === true,
      human: req.body?.human === 'true' || req.body?.human === true,
    };
    const parsed = contactSchema.safeParse(fieldsRaw);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'ValidationError', details: parsed.error.flatten() });
    }
    const data = parsed.data;

    // Verify human
    const humanOk = await verifyHuman(data.cfTurnstileToken, data.human);
    if (!humanOk) return res.status(400).json({ ok: false, error: 'Human check failed' });

    // Subject
    const subject = data.subject && data.subject.trim().length > 0 ? data.subject : suggestSubject(data.purpose);

    // Persist submission
    const prisma = getDb();
    let savedPath: string | undefined;
    let savedName: string | undefined;
    let savedMime: string | undefined;
    const uploadDir = path.join(process.cwd(), 'uploads');
    try { if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true }); } catch {}
    const file = (req as any).file as Express.Multer.File | undefined;
    if (file && file.buffer) {
      const fname = `${Date.now()}_${file.originalname}`.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fpath = path.join(uploadDir, fname);
      fs.writeFileSync(fpath, file.buffer);
      savedPath = fpath; savedName = file.originalname; savedMime = file.mimetype;
    }

    await prisma.submission.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company || null,
        phoneDialCode: data.phoneCode || null,
        phoneNational: data.phoneNumber || null,
        purpose: data.purpose,
        subject,
        message: data.message,
        walletAddress: data.walletAddress || null,
        attachmentPath: savedPath,
        attachmentMime: savedMime,
        attachmentName: savedName,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers['user-agent'],
      }
    });

    // Compose email
    const transporter = makeTransport();
    const from = process.env.MAIL_FROM || 'no-reply@example.com';
    const to = process.env.MAIL_TO || 'support@example.com';

    const lines = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.company ? `Company: ${data.company}` : undefined,
      data.phoneCode || data.phoneNumber
        ? `Phone: ${data.phoneCode || ''} ${data.phoneNumber || ''}`
        : undefined,
      `Purpose: ${data.purpose}`,
      data.walletAddress ? `Wallet: ${data.walletAddress}` : undefined,
      '',
      'Message:',
      data.message,
    ]
      .filter(Boolean)
      .join('\n');

    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    if (file && file.buffer) {
      attachments.push({ filename: file.originalname, content: file.buffer, contentType: file.mimetype });
    }

    await transporter.sendMail({ from, to, subject: `[Contact] ${subject}`, text: lines, attachments });
    return res.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'ServerError' });
  }
});

// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const body = req.body || {};
    const schema = z.object({
      email: z.string().email(),
      turnstileToken: z.string().optional(),
      source: z.string().optional(),
    });
    
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'ValidationError', details: parsed.error.flatten() });
    }
    
    const data = parsed.data;
    
    // Verify Turnstile if token provided
    const turnstileOk = await verifyTurnstile(data.turnstileToken);
    if (!turnstileOk) {
      return res.status(400).json({ ok: false, error: 'Human verification failed' });
    }
    
    // Save subscription to database
    const prisma = getDb();
    try {
      await prisma.newsletterSubscription.create({
        data: {
          email: data.email,
          source: data.source || 'unknown',
          ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined,
          userAgent: req.headers['user-agent'],
        }
      });
    } catch (dbError: any) {
      // Handle duplicate email gracefully
      if (dbError.code === 'P2002') {
        return res.status(400).json({ ok: false, error: 'Email already subscribed' });
      }
      throw dbError;
    }
    
    // Send notification email to admin
    try {
      const from = process.env.MAIL_FROM || 'no-reply@redmugsy.com';
      const to = process.env.MAIL_TO || 'contact@redmugsy.com';
      const smtpConfigured = !!(process.env.SMTP_HOST && (process.env.SMTP_USER || process.env.SMTP_PASS));
      
      if (smtpConfigured) {
        const transporter = makeTransport();
        await transporter.sendMail({
          from,
          to,
          subject: '[Red Mugsy] New Newsletter Subscription',
          text: `New newsletter subscription:\n\nEmail: ${data.email}\nSource: ${data.source || 'unknown'}\nTimestamp: ${new Date().toISOString()}`
        });
      }
    } catch (emailError) {
      console.warn('Failed to send newsletter notification email:', emailError);
      // Don't fail the subscription if email fails
    }
    
    return res.json({ ok: true, message: 'Successfully subscribed to newsletter' });
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    return res.status(500).json({ ok: false, error: 'ServerError' });
  }
});

// JSON submission path used by current frontend (no file upload)
app.post('/api/contact', async (req, res) => {
  try {
    if (process.env.MOCK_CONTACT === '1') {
      const requestId = Math.random().toString(36).slice(2, 10);
      return res.json({ ok: true, requestId, mocked: true });
    }
    const body = req.body || {};
    const jsonSchema = z.object({
      locale: z.string().optional(),
      name: z.string().min(2).max(100),
      email: z.string().email(),
      company: z.string().max(120).optional().or(z.literal('')),
      phoneCountry: z.string().max(3).optional().or(z.literal('')),
      phoneDialCode: z.string().max(8).optional().or(z.literal('')),
      phoneNational: z.string().max(32).optional().or(z.literal('')),
      phoneE164: z.string().max(32).optional().or(z.literal('')),
      purpose: z.string().min(2).max(64),
      otherReason: z.string().max(200).optional().or(z.literal('')),
      subject: z.string().max(140).optional().or(z.literal('')),
      message: z.string().min(50).max(3000),
      walletAddress: z.string().optional().or(z.literal('')),
      issuedAt: z.number().optional(),
      issuedSig: z.string().optional(),
      website: z.string().optional(), // honeypot
      captcha: z.any().optional(),
    });
    const parsed = jsonSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: 'ValidationError', details: parsed.error.flatten() });
    const data = parsed.data as any;
    if (data.website) return res.status(400).json({ ok: false, error: 'Spam detected' });

    // Optional Turnstile verification if token is present
    const turnstileToken: string | undefined = data?.captcha?.type === 'turnstile' ? data.captcha.token : undefined;
    const turnstileOk = await verifyTurnstile(turnstileToken);
    if (!turnstileOk) return res.status(400).json({ ok: false, error: 'Human check failed' });

    const subject = data.subject && data.subject.trim().length > 0 ? data.subject : suggestSubject('General');
    const lines = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.company ? `Company: ${data.company}` : undefined,
      (data.phoneE164 || data.phoneDialCode || data.phoneNational)
        ? `Phone: ${data.phoneE164 || `${data.phoneDialCode || ''} ${data.phoneNational || ''}`}`
        : undefined,
      `Purpose: ${data.purpose}${data.otherReason ? ` (${data.otherReason})` : ''}`,
      data.walletAddress ? `Wallet: ${data.walletAddress}` : undefined,
      '',
      'Message:',
      data.message,
    ].filter(Boolean).join('\n');

    // Persist to DB
    const prisma = getDb();
    await prisma.submission.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company || null,
        phoneE164: data.phoneE164 || null,
        phoneDialCode: data.phoneDialCode || null,
        phoneNational: data.phoneNational || null,
        purpose: data.purpose,
        subject,
        message: data.message,
        walletAddress: data.walletAddress || null,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers['user-agent'],
      }
    });

    const from = process.env.MAIL_FROM || 'no-reply@example.com';
    const to = process.env.MAIL_TO || 'support@example.com';
    const smtpConfigured = !!(process.env.SMTP_HOST && (process.env.SMTP_USER || process.env.SMTP_PASS));
    if (smtpConfigured) {
      const transporter = makeTransport();
      await transporter.sendMail({ from, to, subject: `[Contact] ${subject}`, text: lines });
    }

    const requestId = Math.random().toString(36).slice(2, 10);
    return res.json({ ok: true, requestId });
  } catch (err) {
    try {
      const dir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      const fp = path.join(dir, 'server-error.log');
      const msg = `[${new Date().toISOString()}] /api/contact error: ${String((err as any)?.message || err)}\n${(err as any)?.stack || ''}\n`;
      fs.appendFileSync(fp, msg);
    } catch {}
    console.error(err);
    return res.status(500).json({ ok: false, error: 'ServerError' });
  }
});

const port = Number(process.env.PORT || 8787);

console.log(`Starting Contact API on port ${port}...`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Contact API successfully listening on http://0.0.0.0:${port}`);
  console.log(`🏥 Health check available at http://0.0.0.0:${port}/health`);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  try {
    const dir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const fp = path.join(dir, 'server-error.log');
    const msg = `[${new Date().toISOString()}] Global error: ${String(err?.message || err)}\n${err?.stack || ''}\n`;
    fs.appendFileSync(fp, msg);
  } catch {}
  res.status(500).json({ ok: false, error: 'ServerError' });
});

process.on('unhandledRejection', (reason: any) => {
  try {
    const dir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const fp = path.join(dir, 'server-error.log');
    const msg = `[${new Date().toISOString()}] UnhandledRejection: ${String(reason?.message || reason)}\n${reason?.stack || ''}\n`;
    fs.appendFileSync(fp, msg);
  } catch {}
});

process.on('uncaughtException', (err: any) => {
  try {
    const dir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const fp = path.join(dir, 'server-error.log');
    const msg = `[${new Date().toISOString()}] UncaughtException: ${String(err?.message || err)}\n${err?.stack || ''}\n`;
    fs.appendFileSync(fp, msg);
  } catch {}
});

// --- OAuth2-style admin auth and APIs ---
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'devsecret';

async function ensureAdminSeed() {
  const prisma = getDb();
  const count = await prisma.adminUser.count();
  if (count === 0 && process.env.ADMIN_USER && process.env.ADMIN_PASS) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASS, 10);
    await prisma.adminUser.create({ data: { username: process.env.ADMIN_USER, passwordHash: hash, role: 'MASTER', fullName: process.env.ADMIN_NAME || 'Admin' } });
    console.log('Admin user created:', process.env.ADMIN_USER);
  }
}
ensureAdminSeed().catch(()=>{});

app.post('/oauth/token', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const grant = (req.body?.grant_type || '').toString();
    if (grant !== 'password') return res.status(400).json({ error: 'unsupported_grant_type' });
    const username = (req.body?.username || '').toString();
    const password = (req.body?.password || '').toString();
    const prisma = getDb();
    const user = await prisma.adminUser.findUnique({ where: { username } });
    if (!user) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      console.warn(`[auth] invalid_grant (no user) username=${username} ip=${ip}`);
      return res.status(400).json({ error: 'invalid_grant' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      console.warn(`[auth] invalid_grant (bad password) username=${username} ip=${ip}`);
      return res.status(400).json({ error: 'invalid_grant' });
    }
    const role = (user as any).role || 'MASTER';
    const access_token = jwt.sign({ sub: user.id, username, role }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token_type: 'Bearer', access_token, expires_in: 3600, role });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

function authRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const header = req.headers['authorization'] || '';
    const m = /^Bearer\s+(.+)$/i.exec(header);
    if (!m) return res.status(401).json({ error: 'unauthorized' });
    const token = m[1];
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).admin = { id: payload.sub, username: payload.username, role: payload.role || 'MASTER' };
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

function requireRole(roles: string[]) {
  return function(req: express.Request, res: express.Response, next: express.NextFunction) {
    const r = (req as any).admin?.role || 'MASTER';
    if (!roles.includes(r)) return res.status(403).json({ error: 'forbidden' });
    next();
  }
}

// Current user info
app.get('/api/admin/me', authRequired, async (req, res) => {
  const prisma = getDb();
  const me = await prisma.adminUser.findUnique({ where: { id: (req as any).admin.id }, select: { id: true, username: true, role: true, createdAt: true } });
  if (!me) return res.status(404).json({ error: 'not_found' });
  res.json(me);
});

app.get('/api/admin/submissions', authRequired, requireRole(['MASTER','ENGAGEMENT']), async (req, res) => {
  const prisma = getDb();
  const take = Math.min(Number(req.query.take || 50), 200);
  const skip = Math.max(Number(req.query.skip || 0), 0);
  const q = (req.query.q as string | undefined)?.trim() || '';
  const sortByRaw = (req.query.sortBy as string | undefined)?.toLowerCase() || 'date';
  const sortDirRaw = (req.query.sortDir as string | undefined)?.toLowerCase() || 'desc';
  const sortDir = sortDirRaw === 'asc' ? 'asc' as const : 'desc' as const;

  const sortField = (() => {
    switch (sortByRaw) {
      case 'name': return 'name' as const;
      case 'email': return 'email' as const;
      case 'purpose': return 'purpose' as const;
      case 'subject': return 'subject' as const;
      case 'date':
      default: return 'createdAt' as const;
    }
  })();

  // Build where clause
  let where: any = undefined;
  if (q) {
    // If q looks like YYYY-MM-DD, filter by that date range
    const m = /^\d{4}-\d{2}-\d{2}$/.exec(q);
    if (m) {
      const start = new Date(q + 'T00:00:00.000Z');
      const end = new Date(new Date(q + 'T00:00:00.000Z').getTime() + 24*60*60*1000);
      where = { createdAt: { gte: start, lt: end } };
    } else {
      where = {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { purpose: { contains: q, mode: 'insensitive' } },
          { subject: { contains: q, mode: 'insensitive' } },
        ],
      };
    }
  }

  const [items, total] = await Promise.all([
    prisma.submission.findMany({ where, orderBy: { [sortField]: sortDir }, take, skip }),
    prisma.submission.count({ where }),
  ]);
  res.json({ total, items });
});

app.get('/api/admin/claims', authRequired, requireRole(['MASTER','CLAIM_MANAGER']), async (req, res) => {
  const prisma = getDb();
  const take = Math.min(Number(req.query.take || 50), 200);
  const skip = Math.max(Number(req.query.skip || 0), 0);
  const q = (req.query.q as string | undefined)?.trim() || '';
  const sortByRaw = (req.query.sortBy as string | undefined)?.toLowerCase() || 'date';
  const sortDirRaw = (req.query.sortDir as string | undefined)?.toLowerCase() || 'desc';
  const sortDir = sortDirRaw === 'asc' ? 'asc' as const : 'desc' as const;

  const sortField = (() => {
    switch (sortByRaw) {
      case 'address': return 'address' as const;
      case 'chain': return 'chainId' as const;
      case 'contract': return 'contract' as const;
      case 'type': return 'type' as const;
      case 'status': return 'status' as const;
      case 'amount': return 'amount' as const;
      case 'date':
      default: return 'createdAt' as const;
    }
  })();

  let where: any = undefined;
  if (q) {
    const m = /^\d{4}-\d{2}-\d{2}$/.exec(q);
    if (m) {
      const start = new Date(q + 'T00:00:00.000Z');
      const end = new Date(new Date(q + 'T00:00:00.000Z').getTime() + 24*60*60*1000);
      where = { createdAt: { gte: start, lt: end } };
    } else {
      where = {
        OR: [
          { address: { contains: q, mode: 'insensitive' } },
          { contract: { contains: q, mode: 'insensitive' } },
          { type: { contains: q, mode: 'insensitive' } },
          { status: { contains: q, mode: 'insensitive' } },
          { txHash: { contains: q, mode: 'insensitive' } },
        ],
      };
    }
  }

  const [items, total] = await Promise.all([
    prisma.claimEvent.findMany({ where, orderBy: { [sortField]: sortDir }, take, skip }),
    prisma.claimEvent.count({ where }),
  ]);
  res.json({ total, items });
});

app.get('/api/admin/claims/:id', authRequired, requireRole(['MASTER','CLAIM_MANAGER']), async (req, res) => {
  const prisma = getDb();
  const item = await prisma.claimEvent.findUnique({ where: { id: String(req.params.id) } });
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

app.get('/api/admin/submissions/:id', authRequired, requireRole(['MASTER','ENGAGEMENT']), async (req, res) => {
  const prisma = getDb();
  const item = await prisma.submission.findUnique({ where: { id: String(req.params.id) } });
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

app.get('/api/admin/attachments/:id', authRequired, requireRole(['MASTER','ENGAGEMENT']), async (req, res) => {
  const prisma = getDb();
  const item = await prisma.submission.findUnique({ where: { id: String(req.params.id) } });
  if (!item || !item.attachmentPath) return res.status(404).end();
  res.setHeader('Content-Type', item.attachmentMime || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${item.attachmentName || 'file'}"`);
fs.createReadStream(item.attachmentPath).pipe(res);
});

// User management (MASTER only)
app.get('/api/admin/users', authRequired, requireRole(['MASTER']), async (_req, res) => {
  const prisma = getDb();
  const users = await prisma.adminUser.findMany({ select: { id: true, username: true, fullName: true, role: true, createdAt: true } });
  res.json({ items: users });
});

app.post('/api/admin/users', authRequired, requireRole(['MASTER']), express.json(), async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '').trim();
    const role = String(req.body?.role || 'ENGAGEMENT').toUpperCase();
    const fullName = (req.body?.fullName ? String(req.body.fullName) : undefined);
    if (!username || !password) return res.status(400).json({ error: 'missing_fields' });
    if (!['MASTER','ENGAGEMENT','CLAIM_MANAGER'].includes(role)) return res.status(400).json({ error: 'invalid_role' });
    const prisma = getDb();
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.adminUser.create({ data: { username, passwordHash: hash, role, fullName } });

    // Send welcome email
    try {
      const transport = makeTransport();
      const admin = await prisma.adminUser.findUnique({ where: { id: (req as any).admin.id } });
      const adminName = admin?.fullName || admin?.username || 'Admin';
      const toName = user.fullName || user.username;
      const portalUrl = process.env.ADMIN_PORTAL_URL || `${req.protocol}://${req.get('host')}/admin/`;
      const text = `Welcome ${toName} to Red Mugsy squad. The Admin ${adminName} has added you to the list of users.

You have been assigned the profile of ${role === 'MASTER' ? 'Master' : role === 'ENGAGEMENT' ? 'Engagement' : 'Claim Manager'}.

Your access credentials are:
User Name: ${user.username}
Password: ${password}

To access the portal, click on the link below
${portalUrl}

We wish you luck down the rabbit hole :-).

Regards,

Red Mugsy Squad`;
      await transport.sendMail({
        to: user.username,
        from: process.env.MAIL_FROM || 'no-reply@redmugsy.com',
        subject: 'Your Red Mugsy Admin Access',
        text,
      });
    } catch (e) {
      console.warn('Send welcome mail failed:', (e as any)?.message || e);
    }

    res.json({ ok: true, id: user.id });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
});

app.patch('/api/admin/users/:id', authRequired, requireRole(['MASTER']), express.json(), async (req, res) => {
  try {
    const id = String(req.params.id);
    const data: any = {};
    if (req.body?.username) data.username = String(req.body.username);
    if (req.body?.fullName != null) data.fullName = req.body.fullName ? String(req.body.fullName) : null;
    if (req.body?.password) data.passwordHash = await bcrypt.hash(String(req.body.password), 10);
    if (req.body?.role) {
      const role = String(req.body.role).toUpperCase();
      if (!['MASTER','ENGAGEMENT','CLAIM_MANAGER'].includes(role)) return res.status(400).json({ error: 'invalid_role' });
      data.role = role;
    }
    const prisma = getDb();
    const u = await prisma.adminUser.update({ where: { id }, data });
    res.json({ ok: true, id: u.id });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
});

app.delete('/api/admin/users/:id', authRequired, requireRole(['MASTER']), async (req, res) => {
  try {
    const id = String(req.params.id);
    const prisma = getDb();
    await prisma.adminUser.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
});

// Minimal static admin UI (opt-in via ADMIN_UI_ENABLED=true)
if (ADMIN_UI_ENABLED) {
  app.use('/admin', express.static(path.join(process.cwd(), 'public', 'admin')));
}
