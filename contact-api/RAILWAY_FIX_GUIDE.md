# Railway Deployment Fix Guide

## Current Issues Identified:
1. CORS errors - requests blocked from unauthorized origins
2. Port configuration conflicts 
3. Missing production environment variables
4. Database initialization issues

## Steps to Fix Railway Deployment:

### Step 1: Set Environment Variables in Railway Dashboard

Go to your Railway project dashboard → Variables tab and set these **EXACTLY**:

```
PORT=3000
NODE_ENV=production
DATABASE_URL=file:./data/production.db
ALLOWED_ORIGINS=https://redmugsy.github.io,https://www.redmugsy.com,https://redmugsy.com,https://your-frontend-domain.com

# SMTP Configuration (Replace with your actual values)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM=Red Mugsy Contact <contact@redmugsy.com>
MAIL_TO=contact@redmugsy.com

# Admin Configuration
ADMIN_UI_ENABLED=true
ADMIN_USER=admin
ADMIN_PASS=your-secure-admin-password-123
ADMIN_JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
ADMIN_NAME=Red Mugsy Admin

# Turnstile (if using Cloudflare Turnstile)
TURNSTILE_SECRET=your-turnstile-secret
TURNSTILE_SECRET_CLAIM=your-claim-turnstile-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
CONTACT_MAX_PER_HOUR=10
```

### Step 2: Update Railway Service Configuration

In Railway dashboard → Settings:
- **Build Command**: `npm run build`
- **Start Command**: `npm run start:prod`
- **Health Check Path**: `/health`

### Step 3: Domain Configuration

1. Add your actual frontend domain to `ALLOWED_ORIGINS`
2. If using a custom domain, configure it in Railway dashboard
3. Update your frontend API base URL to point to your Railway app URL

### Step 4: Gmail App Password Setup (if using Gmail SMTP)

1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to App passwords
4. Generate password for "Mail"
5. Use this password (16 chars, no spaces) for `SMTP_PASS`

### Step 5: Deploy/Redeploy

1. Push your changes to GitHub:
```bash
git add .
git commit -m "fix: Railway deployment configuration"
git push origin main
```

2. Railway should auto-deploy, or manually trigger a deployment

### Step 6: Test the Deployment

After deployment, test these URLs (replace with your actual Railway URL):

```
https://your-app.railway.app/health
https://your-app.railway.app/api/ping
https://your-app.railway.app/admin
```

## Common Issues & Solutions:

### Issue: Still getting CORS errors
**Solution**: Make sure your frontend domain is in `ALLOWED_ORIGINS` and restart the Railway service

### Issue: Admin panel not working
**Solution**: Ensure `ADMIN_UI_ENABLED=true` and visit `/admin/` (with trailing slash)

### Issue: Database errors
**Solution**: Railway will automatically run `npm run start:prod` which includes database setup

### Issue: Email not sending
**Solution**: Verify SMTP credentials and that Gmail app password is correct

## Files Updated:
- ✅ `railway.json` - deployment configuration
- ✅ `nixpacks.toml` - build configuration  
- ✅ `package.json` - added production scripts
- ✅ `start.sh` - startup script with DB setup
- ✅ `.env.production` - production environment template

## Next Steps:
1. Set the environment variables in Railway dashboard
2. Trigger a new deployment
3. Test the API endpoints
4. Update your frontend to use the new Railway API URL