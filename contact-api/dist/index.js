"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const zod_1 = require("zod");
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const ADMIN_UI_ENABLED = String(process.env.ADMIN_UI_ENABLED || '').toLowerCase() === 'true';
// Basic JSON body parsing for non-multipart routes
app.use(express_1.default.json({ limit: '1mb' }));
// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin))
            return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
// Rate limit: 5 requests/hour per IP
const limiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
app.use('/contact', limiter);
// Multer for file upload (memory for email attachment)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const ok = [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/webp',
            'text/plain',
        ];
        if (ok.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error('Invalid file type'));
    },
});
const PurposeEnum = zod_1.z.enum([
    'General',
    'Partnership',
    'Support',
    'Bug Report',
    'Feedback',
    'Other',
]);
const contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    company: zod_1.z.string().max(120).optional().or(zod_1.z.literal('')),
    phoneCountry: zod_1.z.string().max(2).optional().or(zod_1.z.literal('')),
    phoneCode: zod_1.z.string().max(6).optional().or(zod_1.z.literal('')),
    phoneNumber: zod_1.z.string().max(32).optional().or(zod_1.z.literal('')),
    purpose: PurposeEnum,
    subject: zod_1.z.string().max(140).optional().or(zod_1.z.literal('')),
    message: zod_1.z.string().min(50).max(3000),
    walletAddress: zod_1.z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .optional()
        .or(zod_1.z.literal('')),
    agreePolicy: zod_1.z.literal(true),
    human: zod_1.z.boolean().optional(),
    cfTurnstileToken: zod_1.z.string().optional(),
});
function suggestSubject(purpose) {
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
async function verifyHuman(token, fallbackHuman) {
    const secret = process.env.TURNSTILE_SECRET;
    if (secret && token) {
        try {
            const resp = await (0, node_fetch_1.default)('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ secret, response: token }),
            });
            const data = (await resp.json());
            return !!data?.success;
        }
        catch {
            return false;
        }
    }
    // fallback to checkbox
    return !!fallbackHuman;
}
async function verifyTurnstile(token, secretOverride) {
    const secret = secretOverride || process.env.TURNSTILE_SECRET;
    // If Turnstile is not configured, allow (dev mode)
    if (!secret)
        return true;
    // If configured, require a token
    if (!token)
        return false;
    try {
        const resp = await (0, node_fetch_1.default)('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ secret, response: token }),
        });
        const data = (await resp.json());
        return !!data?.success;
    }
    catch {
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
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user && pass ? { user, pass } : undefined,
    });
}
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/api/ping', (_req, res) => res.json({ ok: true }));
app.get('/api/ping', (_req, res) => res.json({ ok: true }));
// Claim flow helper: verify Turnstile token directly
app.post('/api/claim/turnstile-verify', express_1.default.json(), async (req, res) => {
    try {
        const token = req.body?.token;
        const ok = await verifyTurnstile(token, process.env.TURNSTILE_SECRET_CLAIM);
        return res.json({ ok });
    }
    catch {
        return res.status(500).json({ ok: false });
    }
});
// Claim event logging (used by Claim UI)
app.post('/api/claim/log', express_1.default.json(), async (req, res) => {
    try {
        const prisma = (0, db_1.getDb)();
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
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || undefined,
                userAgent: req.headers['user-agent'],
            },
        });
        res.json({ ok: true, id: item.id });
    }
    catch (e) {
        res.status(500).json({ ok: false });
    }
});
// Claim eligibility (hybrid: merkle or voucher)
app.get('/api/claim/eligibility', async (req, res) => {
    try {
        const addressRaw = String(req.query.address || '').toLowerCase();
        if (!/^0x[0-9a-f]{40}$/i.test(addressRaw))
            return res.json({ method: 'none' });
        const dir = process.env.CLAIM_DATA_DIR || path_1.default.join(process.cwd(), 'public', 'claim-data');
        const fp = path_1.default.join(dir, 'eligibility.json');
        if (!fs_1.default.existsSync(fp))
            return res.json({ method: 'none' });
        const map = JSON.parse(fs_1.default.readFileSync(fp, 'utf8'));
        const e = map[addressRaw] || map[addressRaw.toLowerCase()] || map['*'];
        if (!e)
            return res.json({ method: 'none' });
        return res.json(e);
    }
    catch {
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
        return res.json({ type: 'turnstile', expiresAt: new Date(Date.now() + 5 * 60000).toISOString() });
    }
    // Fallback: trivial placeholder
    res.json({ type: 'image', nonce: Math.random().toString(36).slice(2), expiresAt: new Date(Date.now() + 5 * 60000).toISOString() });
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
        if (!humanOk)
            return res.status(400).json({ ok: false, error: 'Human check failed' });
        // Subject
        const subject = data.subject && data.subject.trim().length > 0 ? data.subject : suggestSubject(data.purpose);
        // Persist submission
        const prisma = (0, db_1.getDb)();
        let savedPath;
        let savedName;
        let savedMime;
        const uploadDir = path_1.default.join(process.cwd(), 'uploads');
        try {
            if (!fs_1.default.existsSync(uploadDir))
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        catch { }
        const file = req.file;
        if (file && file.buffer) {
            const fname = `${Date.now()}_${file.originalname}`.replace(/[^a-zA-Z0-9._-]/g, '_');
            const fpath = path_1.default.join(uploadDir, fname);
            fs_1.default.writeFileSync(fpath, file.buffer);
            savedPath = fpath;
            savedName = file.originalname;
            savedMime = file.mimetype;
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
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || undefined,
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
        const attachments = [];
        if (file && file.buffer) {
            attachments.push({ filename: file.originalname, content: file.buffer, contentType: file.mimetype });
        }
        await transporter.sendMail({ from, to, subject: `[Contact] ${subject}`, text: lines, attachments });
        return res.json({ ok: true });
    }
    catch (err) {
        console.error(err);
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
        const jsonSchema = zod_1.z.object({
            locale: zod_1.z.string().optional(),
            name: zod_1.z.string().min(2).max(100),
            email: zod_1.z.string().email(),
            company: zod_1.z.string().max(120).optional().or(zod_1.z.literal('')),
            phoneCountry: zod_1.z.string().max(3).optional().or(zod_1.z.literal('')),
            phoneDialCode: zod_1.z.string().max(8).optional().or(zod_1.z.literal('')),
            phoneNational: zod_1.z.string().max(32).optional().or(zod_1.z.literal('')),
            phoneE164: zod_1.z.string().max(32).optional().or(zod_1.z.literal('')),
            purpose: zod_1.z.string().min(2).max(64),
            otherReason: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
            subject: zod_1.z.string().max(140).optional().or(zod_1.z.literal('')),
            message: zod_1.z.string().min(50).max(3000),
            walletAddress: zod_1.z.string().optional().or(zod_1.z.literal('')),
            issuedAt: zod_1.z.number().optional(),
            issuedSig: zod_1.z.string().optional(),
            website: zod_1.z.string().optional(), // honeypot
            captcha: zod_1.z.any().optional(),
        });
        const parsed = jsonSchema.safeParse(body);
        if (!parsed.success)
            return res.status(400).json({ ok: false, error: 'ValidationError', details: parsed.error.flatten() });
        const data = parsed.data;
        if (data.website)
            return res.status(400).json({ ok: false, error: 'Spam detected' });
        // Optional Turnstile verification if token is present
        const turnstileToken = data?.captcha?.type === 'turnstile' ? data.captcha.token : undefined;
        const turnstileOk = await verifyTurnstile(turnstileToken);
        if (!turnstileOk)
            return res.status(400).json({ ok: false, error: 'Human check failed' });
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
        const prisma = (0, db_1.getDb)();
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
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || undefined,
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
    }
    catch (err) {
        try {
            const dir = path_1.default.join(process.cwd(), 'tmp');
            if (!fs_1.default.existsSync(dir))
                fs_1.default.mkdirSync(dir);
            const fp = path_1.default.join(dir, 'server-error.log');
            const msg = `[${new Date().toISOString()}] /api/contact error: ${String(err?.message || err)}\n${err?.stack || ''}\n`;
            fs_1.default.appendFileSync(fp, msg);
        }
        catch { }
        console.error(err);
        return res.status(500).json({ ok: false, error: 'ServerError' });
    }
});
const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
    console.log(`Contact API listening on http://localhost:${port}`);
});
// Global error handler
app.use((err, _req, res, _next) => {
    try {
        const dir = path_1.default.join(process.cwd(), 'tmp');
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir);
        const fp = path_1.default.join(dir, 'server-error.log');
        const msg = `[${new Date().toISOString()}] Global error: ${String(err?.message || err)}\n${err?.stack || ''}\n`;
        fs_1.default.appendFileSync(fp, msg);
    }
    catch { }
    res.status(500).json({ ok: false, error: 'ServerError' });
});
process.on('unhandledRejection', (reason) => {
    try {
        const dir = path_1.default.join(process.cwd(), 'tmp');
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir);
        const fp = path_1.default.join(dir, 'server-error.log');
        const msg = `[${new Date().toISOString()}] UnhandledRejection: ${String(reason?.message || reason)}\n${reason?.stack || ''}\n`;
        fs_1.default.appendFileSync(fp, msg);
    }
    catch { }
});
process.on('uncaughtException', (err) => {
    try {
        const dir = path_1.default.join(process.cwd(), 'tmp');
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir);
        const fp = path_1.default.join(dir, 'server-error.log');
        const msg = `[${new Date().toISOString()}] UncaughtException: ${String(err?.message || err)}\n${err?.stack || ''}\n`;
        fs_1.default.appendFileSync(fp, msg);
    }
    catch { }
});
// --- OAuth2-style admin auth and APIs ---
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'devsecret';
async function ensureAdminSeed() {
    const prisma = (0, db_1.getDb)();
    const count = await prisma.adminUser.count();
    if (count === 0 && process.env.ADMIN_USER && process.env.ADMIN_PASS) {
        const hash = await bcryptjs_1.default.hash(process.env.ADMIN_PASS, 10);
        await prisma.adminUser.create({ data: { username: process.env.ADMIN_USER, passwordHash: hash, role: 'MASTER', fullName: process.env.ADMIN_NAME || 'Admin' } });
        console.log('Admin user created:', process.env.ADMIN_USER);
    }
}
ensureAdminSeed().catch(() => { });
app.post('/oauth/token', express_1.default.urlencoded({ extended: true }), async (req, res) => {
    try {
        const grant = (req.body?.grant_type || '').toString();
        if (grant !== 'password')
            return res.status(400).json({ error: 'unsupported_grant_type' });
        const username = (req.body?.username || '').toString();
        const password = (req.body?.password || '').toString();
        const prisma = (0, db_1.getDb)();
        const user = await prisma.adminUser.findUnique({ where: { username } });
        if (!user)
            return res.status(400).json({ error: 'invalid_grant' });
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(400).json({ error: 'invalid_grant' });
        const role = user.role || 'MASTER';
        const access_token = jsonwebtoken_1.default.sign({ sub: user.id, username, role }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token_type: 'Bearer', access_token, expires_in: 3600, role });
    }
    catch (e) {
        return res.status(500).json({ error: 'server_error' });
    }
});
function authRequired(req, res, next) {
    try {
        const header = req.headers['authorization'] || '';
        const m = /^Bearer\s+(.+)$/i.exec(header);
        if (!m)
            return res.status(401).json({ error: 'unauthorized' });
        const token = m[1];
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.admin = { id: payload.sub, username: payload.username, role: payload.role || 'MASTER' };
        next();
    }
    catch {
        return res.status(401).json({ error: 'unauthorized' });
    }
}
function requireRole(roles) {
    return function (req, res, next) {
        const r = req.admin?.role || 'MASTER';
        if (!roles.includes(r))
            return res.status(403).json({ error: 'forbidden' });
        next();
    };
}
// Current user info
app.get('/api/admin/me', authRequired, async (req, res) => {
    const prisma = (0, db_1.getDb)();
    const me = await prisma.adminUser.findUnique({ where: { id: req.admin.id }, select: { id: true, username: true, role: true, createdAt: true } });
    if (!me)
        return res.status(404).json({ error: 'not_found' });
    res.json(me);
});
app.get('/api/admin/submissions', authRequired, requireRole(['MASTER', 'ENGAGEMENT']), async (req, res) => {
    const prisma = (0, db_1.getDb)();
    const take = Math.min(Number(req.query.take || 50), 200);
    const skip = Math.max(Number(req.query.skip || 0), 0);
    const q = req.query.q?.trim() || '';
    const sortByRaw = req.query.sortBy?.toLowerCase() || 'date';
    const sortDirRaw = req.query.sortDir?.toLowerCase() || 'desc';
    const sortDir = sortDirRaw === 'asc' ? 'asc' : 'desc';
    const sortField = (() => {
        switch (sortByRaw) {
            case 'name': return 'name';
            case 'email': return 'email';
            case 'purpose': return 'purpose';
            case 'subject': return 'subject';
            case 'date':
            default: return 'createdAt';
        }
    })();
    // Build where clause
    let where = undefined;
    if (q) {
        // If q looks like YYYY-MM-DD, filter by that date range
        const m = /^\d{4}-\d{2}-\d{2}$/.exec(q);
        if (m) {
            const start = new Date(q + 'T00:00:00.000Z');
            const end = new Date(new Date(q + 'T00:00:00.000Z').getTime() + 24 * 60 * 60 * 1000);
            where = { createdAt: { gte: start, lt: end } };
        }
        else {
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
app.get('/api/admin/claims', authRequired, requireRole(['MASTER', 'CLAIM_MANAGER']), async (req, res) => {
    const prisma = (0, db_1.getDb)();
    const take = Math.min(Number(req.query.take || 50), 200);
    const skip = Math.max(Number(req.query.skip || 0), 0);
    const q = req.query.q?.trim() || '';
    const sortByRaw = req.query.sortBy?.toLowerCase() || 'date';
    const sortDirRaw = req.query.sortDir?.toLowerCase() || 'desc';
    const sortDir = sortDirRaw === 'asc' ? 'asc' : 'desc';
    const sortField = (() => {
        switch (sortByRaw) {
            case 'address': return 'address';
            case 'chain': return 'chainId';
            case 'contract': return 'contract';
            case 'type': return 'type';
            case 'status': return 'status';
            case 'amount': return 'amount';
            case 'date':
            default: return 'createdAt';
        }
    })();
    let where = undefined;
    if (q) {
        const m = /^\d{4}-\d{2}-\d{2}$/.exec(q);
        if (m) {
            const start = new Date(q + 'T00:00:00.000Z');
            const end = new Date(new Date(q + 'T00:00:00.000Z').getTime() + 24 * 60 * 60 * 1000);
            where = { createdAt: { gte: start, lt: end } };
        }
        else {
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
app.get('/api/admin/claims/:id', authRequired, requireRole(['MASTER', 'CLAIM_MANAGER']), async (req, res) => {
    const prisma = (0, db_1.getDb)();
    const item = await prisma.claimEvent.findUnique({ where: { id: String(req.params.id) } });
    if (!item)
        return res.status(404).json({ error: 'not_found' });
    res.json(item);
});
app.get('/api/admin/submissions/:id', authRequired, requireRole(['MASTER', 'ENGAGEMENT']), async (req, res) => {
    const prisma = (0, db_1.getDb)();
    const item = await prisma.submission.findUnique({ where: { id: String(req.params.id) } });
    if (!item)
        return res.status(404).json({ error: 'not_found' });
    res.json(item);
});
app.get('/api/admin/attachments/:id', authRequired, requireRole(['MASTER', 'ENGAGEMENT']), async (req, res) => {
    const prisma = (0, db_1.getDb)();
    const item = await prisma.submission.findUnique({ where: { id: String(req.params.id) } });
    if (!item || !item.attachmentPath)
        return res.status(404).end();
    res.setHeader('Content-Type', item.attachmentMime || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${item.attachmentName || 'file'}"`);
    fs_1.default.createReadStream(item.attachmentPath).pipe(res);
});
// User management (MASTER only)
app.get('/api/admin/users', authRequired, requireRole(['MASTER']), async (_req, res) => {
    const prisma = (0, db_1.getDb)();
    const users = await prisma.adminUser.findMany({ select: { id: true, username: true, fullName: true, role: true, createdAt: true } });
    res.json({ items: users });
});
app.post('/api/admin/users', authRequired, requireRole(['MASTER']), express_1.default.json(), async (req, res) => {
    try {
        const username = String(req.body?.username || '').trim();
        const password = String(req.body?.password || '').trim();
        const role = String(req.body?.role || 'ENGAGEMENT').toUpperCase();
        const fullName = (req.body?.fullName ? String(req.body.fullName) : undefined);
        if (!username || !password)
            return res.status(400).json({ error: 'missing_fields' });
        if (!['MASTER', 'ENGAGEMENT', 'CLAIM_MANAGER'].includes(role))
            return res.status(400).json({ error: 'invalid_role' });
        const prisma = (0, db_1.getDb)();
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.adminUser.create({ data: { username, passwordHash: hash, role, fullName } });
        // Send welcome email
        try {
            const transport = makeTransport();
            const admin = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
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
        }
        catch (e) {
            console.warn('Send welcome mail failed:', e?.message || e);
        }
        res.json({ ok: true, id: user.id });
    }
    catch (e) {
        res.status(500).json({ error: 'server_error' });
    }
});
app.patch('/api/admin/users/:id', authRequired, requireRole(['MASTER']), express_1.default.json(), async (req, res) => {
    try {
        const id = String(req.params.id);
        const data = {};
        if (req.body?.username)
            data.username = String(req.body.username);
        if (req.body?.fullName != null)
            data.fullName = req.body.fullName ? String(req.body.fullName) : null;
        if (req.body?.password)
            data.passwordHash = await bcryptjs_1.default.hash(String(req.body.password), 10);
        if (req.body?.role) {
            const role = String(req.body.role).toUpperCase();
            if (!['MASTER', 'ENGAGEMENT', 'CLAIM_MANAGER'].includes(role))
                return res.status(400).json({ error: 'invalid_role' });
            data.role = role;
        }
        const prisma = (0, db_1.getDb)();
        const u = await prisma.adminUser.update({ where: { id }, data });
        res.json({ ok: true, id: u.id });
    }
    catch (e) {
        res.status(500).json({ error: 'server_error' });
    }
});
app.delete('/api/admin/users/:id', authRequired, requireRole(['MASTER']), async (req, res) => {
    try {
        const id = String(req.params.id);
        const prisma = (0, db_1.getDb)();
        await prisma.adminUser.delete({ where: { id } });
        res.json({ ok: true });
    }
    catch (e) {
        res.status(500).json({ error: 'server_error' });
    }
});
// Minimal static admin UI (opt-in via ADMIN_UI_ENABLED=true)
if (ADMIN_UI_ENABLED) {
    app.use('/admin', express_1.default.static(path_1.default.join(process.cwd(), 'public', 'admin')));
}
