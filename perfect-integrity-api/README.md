# 🔥 Perfect Integrity - Red Mugsy Community Newsletter API

**Service Purpose:** Community newsletter subscription with email verification  
**Railway App:** Perfect Integrity  
**Handles:** Newsletter subscriptions from Community page  
**Deploy Status:** Force rebuild trigger v3

## ✨ Features

- ✅ **Email verification flow** - Secure 2-step subscription process
- ✅ **Community-branded emails** - Beautiful HTML emails with Red Mugsy branding
- ✅ **Subscription completion** - Collect member details after verification
- ✅ **Admin dashboard** - View and manage community subscriptions
- ✅ **Rate limiting** - Prevent spam and abuse
- ✅ **CORS protection** - Secure cross-origin requests

## 🚀 Quick Deploy to Railway

### Step 1: Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `mugsywebsite` repository
4. Set **Root Directory** to: `perfect-integrity-api/`
5. Railway will auto-detect Node.js project

### Step 2: Environment Variables
Add these in Railway dashboard → Variables:

```bash
# Database (Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Email Configuration (Gmail SMTP)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM=community@redmugsy.com

# Application Settings
FRONTEND_URL=https://redmugsy.com
NODE_ENV=production
PORT=8788
```

### Step 3: Database Setup
1. Add **PostgreSQL** service in Railway
2. Database will auto-populate `DATABASE_URL`
3. Prisma will auto-migrate on first deploy

### Step 4: Test Deployment
After deployment, test these endpoints:
- Health: `https://your-app.railway.app/api/health`
- Subscribe: `POST https://your-app.railway.app/api/newsletter/subscribe`
- Admin: `https://your-app.railway.app/api/admin/subscriptions`

## 📧 Gmail SMTP Setup

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App passwords
3. Generate app password for "Mail"
4. Use this password for `SMTP_PASS` (not regular Gmail password)

## 🎯 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/newsletter/subscribe` - Start subscription (sends verification email)
- `GET /api/newsletter/verify` - Verify email token (redirects to completion form)
- `POST /api/newsletter/complete` - Complete subscription with user details

### Admin Endpoints
- `GET /api/admin/subscriptions` - List community subscriptions with stats

## 🛡️ Security Features

- **Rate limiting** - 100 requests per 15 minutes per IP
- **CORS protection** - Only allows requests from redmugsy.com
- **Input validation** - Email format validation and sanitization
- **Secure tokens** - Cryptographically secure verification tokens
- **Helmet.js** - Security headers and XSS protection

## 📊 Expected Railway URL Format

Your Perfect Integrity app will be available at:  
`https://perfect-integrity-production-XXXX.up.railway.app`

## 🔗 Frontend Integration

Update your frontend to point to Perfect Integrity:  
```typescript
// Community.tsx
const API_BASE = 'https://your-perfect-integrity-url.railway.app'
```