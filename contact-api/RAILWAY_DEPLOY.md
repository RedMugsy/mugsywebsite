# Railway Deployment Guide for Red Mugsy Contact API

## Quick Deploy to Railway

### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Verify your account

### Step 2: Deploy the Backend
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your `mugsywebsite` repository
3. Choose the `contact-api` folder as the root
4. Railway will automatically detect it's a Node.js project

### Step 3: Configure Environment Variables
In Railway's project dashboard, go to "Variables" tab and add:

**Required Variables:**
```
# Contact-Us Form Database
DATABASE_URL=postgresql://postgres:QZsYUThavYpYpKJuZjijlYWOFOtbyGvS@maglev.proxy.rlwy.net:17550/railway
PORT=8787
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM=noreply@redmugsy.com
MAIL_TO=support@redmugsy.com
ALLOWED_ORIGINS=https://redmugsy.github.io
```

**Admin Panel (Optional):**
```
ADMIN_UI_ENABLED=true
ADMIN_USER=admin
ADMIN_PASS=your-secure-password
ADMIN_JWT_SECRET=your-super-secret-jwt-key
ADMIN_NAME=Red Mugsy Admin
```

### Step 4: Get Your API URL
After deployment, Railway will give you a URL like:
`https://your-app-name.railway.app`

### Step 5: Update Frontend
Update your frontend to use the Railway API URL instead of localhost.

## Gmail SMTP Setup (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this app password (not your regular Gmail password) for `SMTP_PASS`

## Database
- Using Railway's managed PostgreSQL database
- Automatic backups and scaling handled by Railway
- Connection string provided in DATABASE_URL environment variable
- No additional database setup required - Prisma handles migrations automatically

## Admin Panel
Once deployed, access your admin panel at:
`https://your-app-name.railway.app/admin/`

Use the credentials you set in `ADMIN_USER` and `ADMIN_PASS`.

## Testing
Test your API endpoints:
- Health check: `https://your-app-name.railway.app/health`
- Contact form: `https://your-app-name.railway.app/api/contact`
- Admin login: `https://your-app-name.railway.app/admin/`