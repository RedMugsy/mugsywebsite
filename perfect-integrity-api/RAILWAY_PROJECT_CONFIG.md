# Railway Project Configuration - Perfect Integrity

## Project Details
- **Project Name**: Perfect Integrity
- **Service Type**: Community Newsletter API
- **Repository**: RedMugsy/mugsywebsite
- **Root Directory**: perfect-integrity-api
- **Branch**: main

## Deployment Settings

### Source Configuration
1. Go to Railway Dashboard
2. Open "Perfect Integrity" project
3. Settings → Source
4. Connect to RedMugsy/mugsywebsite
5. Set Root Directory: `perfect-integrity-api`
6. Set Branch: `main`

### Build Configuration
- **Builder**: Nixpacks (auto-detected)
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: 8788 (auto-detected from PORT env var)

### Required Services
1. **PostgreSQL Database**
   - Add PostgreSQL service to project
   - Will auto-populate DATABASE_URL
   - Prisma handles migrations

### Environment Variables
```bash
# Core Application
NODE_ENV=production
PORT=8788

# Database (auto-filled by Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Email Service (Gmail SMTP)
SMTP_USER=community@redmugsy.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM=community@redmugsy.com

# Frontend Integration
FRONTEND_URL=https://redmugsy.com
```

### Health Check
Railway will automatically monitor:
- Endpoint: `/api/health`
- Expected: HTTP 200 with JSON response
- Frequency: Every 30 seconds

### Deployment Trigger
Auto-deploys on:
- Push to main branch
- Changes in perfect-integrity-api/ directory
- Manual redeploy from Railway dashboard

## Post-Deployment

1. **Test Health Check**: Visit `/api/health`
2. **Test Subscription**: POST to `/api/newsletter/subscribe`
3. **Update Frontend**: Point Community.tsx to new Railway URL
4. **Monitor Logs**: Check Railway dashboard for errors

## Expected URL Format
`https://perfect-integrity-production-XXXX.up.railway.app`