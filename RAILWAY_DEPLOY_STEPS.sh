# Railway Deployment Script
# Run this after deploying to Railway via web interface

# Step 1: Manual Railway Web Deployment
# 1. Go to https://railway.app and sign up/login
# 2. Click "New Project" → "Deploy from GitHub repo"
# 3. Select RedMugsy/mugsywebsite repository
# 4. Set ROOT DIRECTORY to: contact-api
# 5. Railway will auto-detect Node.js and deploy

# Step 2: Set Environment Variables in Railway Dashboard
# Navigate to your project → Variables tab and add:

DATABASE_URL=file:./data.db
PORT=8787
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM=noreply@redmugsy.com
MAIL_TO=support@redmugsy.com
ALLOWED_ORIGINS=https://redmugsy.com,https://redmugsy.github.io
NODE_ENV=production

# Optional Admin Panel (recommended for testing):
ADMIN_UI_ENABLED=true
ADMIN_USER=admin
ADMIN_PASS=RedMugsy2024!
ADMIN_JWT_SECRET=super-secret-jwt-key-for-redmugsy-admin-2024
ADMIN_NAME=Red Mugsy Admin

# Step 3: After deployment, your Railway URL will be:
# Format: https://contact-api-production-XXXX.up.railway.app
# Replace XXXX with your actual deployment ID

# Step 4: Test your deployment:
# - Health check: https://your-railway-url/health
# - Contact API: https://your-railway-url/api/contact
# - Admin panel: https://your-railway-url/admin/

# Step 5: Update this file with your actual Railway URL:
# RAILWAY_URL="https://contact-api-production-XXXX.up.railway.app"

# Step 6: Gmail App Password Setup:
# 1. Go to Gmail → Manage Account → Security
# 2. Enable 2-Factor Authentication
# 3. Go to App passwords
# 4. Generate password for "Mail"
# 5. Use that password (not your regular Gmail password) for SMTP_PASS