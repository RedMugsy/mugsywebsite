# Railway Deployment Manual for Red Mugsy Contact API

## Current Status
✅ Site is back online at https://redmugsy.com
⚠️ Contact form shows console errors - needs Railway API deployment
🎯 **Next Step: Deploy Contact API to Railway**

## Step-by-Step Railway Deployment

### 1. Create Railway Account
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with your GitHub account
4. Verify your email if prompted

### 2. Deploy from GitHub Repository
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account if not already connected
4. Select the repository: `RedMugsy/mugsywebsite`
5. **Important**: Set the root directory to `contact-api/`
6. In the build settings, choose **Dockerfile** and set the path to `contact-api/Dockerfile`
7. Click "Deploy"

### 3. Configure Environment Variables
In Railway project dashboard → Variables tab, add these variables:

**Required Environment Variables:**
```
DATABASE_URL=file:./data.db
PORT=8787
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM=noreply@redmugsy.com
MAIL_TO=support@redmugsy.com
ALLOWED_ORIGINS=https://redmugsy.com,https://redmugsy.github.io
```

**Optional Admin Panel:**
```
ADMIN_UI_ENABLED=true
ADMIN_USER=admin
ADMIN_PASS=RedMugsy2024!
ADMIN_JWT_SECRET=super-secret-jwt-key-for-redmugsy-admin-2024
ADMIN_NAME=Red Mugsy Admin
```

### 4. Gmail SMTP Setup
1. Go to your Gmail account settings
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate an app password for "Mail"
5. Use this app password (NOT your regular Gmail password) for `SMTP_PASS`

### 5. Get Your Railway URL
After deployment completes, Railway will show your app URL:
- Format: `https://your-app-name-production.up.railway.app`
- Example: `https://contact-api-production-a1b2.up.railway.app`

### 6. Test the Deployment
Test these endpoints:
- Health check: `https://your-railway-url/health`
- API endpoint: `https://your-railway-url/api/contact`
- Admin panel: `https://your-railway-url/admin/`

### 7. Update Frontend Configuration
Once you have the Railway URL, we need to:
1. Update `mugsy-site/.env.production` with the new Railway URL
2. Rebuild and redeploy the frontend

## Expected Railway URL Format
Your Railway URL will look like:
`https://contact-api-production-XXXX.up.railway.app`

## Next Steps After Deployment
1. Get the Railway URL from your deployment
2. Update the frontend environment variables
3. Rebuild and redeploy the site
4. Test the contact form functionality

## Troubleshooting
- If build fails: Check that root directory is set to `contact-api/`
- If variables don't work: Restart the Railway service after adding them
- If SMTP fails: Double-check Gmail app password (not regular password)
- If CORS errors: Ensure `ALLOWED_ORIGINS` includes both domains

## Current Site Status
- ✅ Main site working: https://redmugsy.com
- ✅ Navigation fixed
- ✅ Contact page accessible
- ⚠️ Contact form needs Railway API (showing localhost errors)
- ✅ Claims feature disabled (no dummy contracts)

## Admin Panel Access
Once deployed, admin panel will be at:
`https://your-railway-url/admin/`

Username: `admin`
Password: `RedMugsy2024!`
