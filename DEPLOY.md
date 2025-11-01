# 🚀 Complete Deployment Guide - Red Mugsy Website

## Overview
Your Red Mugsy website consists of two parts:
1. **Frontend** (React/Vite) → Deployed on GitHub Pages
2. **Backend** (Node.js/Express) → Deployed on Railway

## 📋 Prerequisites
- GitHub account (already set up ✅)
- Railway account (need to create)
- Gmail account (for sending emails)

---

## 🔧 Backend Deployment (Railway)

### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Verify your email

### Step 2: Deploy Backend
1. In Railway, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `mugsywebsite` repository
4. Select **"contact-api"** as the root directory
5. Railway will auto-detect Node.js and start building

### Step 3: Configure Environment Variables
In Railway project dashboard → **Variables** tab:

**Required Variables:**
```bash
DATABASE_URL=file:./data.db
PORT=8787
ALLOWED_ORIGINS=https://redmugsy.github.io
```

**Email Configuration (Gmail):**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM=noreply@redmugsy.com
MAIL_TO=support@redmugsy.com
```

**Admin Panel (Optional):**
```bash
ADMIN_UI_ENABLED=true
ADMIN_USER=admin
ADMIN_PASS=your-secure-password
ADMIN_JWT_SECRET=your-super-secret-jwt-key-128-chars-long
ADMIN_NAME=Red Mugsy Admin
```

### Step 4: Gmail App Password Setup
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App passwords
3. Generate app password for "Mail"
4. Use this password for `SMTP_PASS` (not your regular Gmail password)

### Step 5: Get Your Railway URL
After deployment, Railway gives you a URL like:
```
https://contact-api-production-xyz.railway.app
```
**Save this URL - you'll need it for frontend configuration!**

---

## 🌐 Frontend Configuration

### Step 6: Update Frontend API URL
1. Edit `mugsy-site/.env.production`
2. Replace `your-railway-app` with your actual Railway URL:
```bash
VITE_API_BASE=https://contact-api-production-xyz.railway.app
```

### Step 7: Deploy Frontend Updates
```bash
git add mugsy-site/.env.production
git commit -m "Update API URL for production"
git push origin main
```

GitHub Actions will automatically rebuild and deploy your site!

---

## ✅ Testing Your Deployment

### Backend Health Check
Visit: `https://your-railway-url.railway.app/health`
Should return: `{"status":"ok"}`

### Admin Panel
Visit: `https://your-railway-url.railway.app/admin/`
Login with your `ADMIN_USER` and `ADMIN_PASS`

### Frontend
Visit: `https://redmugsy.github.io/mugsywebsite/`
Test the contact form - it should now work with your Railway backend!

---

## 🔒 Security Notes

- ✅ Use strong passwords for admin accounts
- ✅ Keep your JWT secret long and complex (128+ characters)
- ✅ Only add trusted domains to `ALLOWED_ORIGINS`
- ✅ Use Gmail App Passwords, not regular passwords
- ✅ Keep environment variables private

---

## 📊 Monitoring

### Railway Dashboard
- View logs, metrics, and deployment status
- Monitor database usage and API calls
- Set up alerts for downtime

### GitHub Actions
- Monitor frontend deployment status
- View build logs and errors
- Automatic deployments on code changes

---

## 🛠 Troubleshooting

### Common Issues

**"CORS Error"**
- Check `ALLOWED_ORIGINS` includes your GitHub Pages URL
- Verify Railway deployment is running

**"Email not sending"**
- Verify Gmail App Password is correct
- Check SMTP settings in Railway variables
- Ensure 2FA is enabled on Gmail

**"Admin login fails"**
- Check `ADMIN_USER` and `ADMIN_PASS` variables
- Verify `ADMIN_JWT_SECRET` is set
- Try clearing browser cookies

**"Contact form not working"**
- Verify `VITE_API_BASE` points to Railway URL
- Check Railway deployment is healthy (/health endpoint)
- Verify CORS settings

### Support
If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Test individual API endpoints
4. Check GitHub Actions build logs

---

## 🎉 You're Done!

Your complete Red Mugsy website is now live with:
- ✅ Frontend hosted on GitHub Pages
- ✅ Backend API hosted on Railway  
- ✅ Contact form fully functional
- ✅ Admin panel for managing submissions
- ✅ Automatic deployments on code changes
- ✅ Professional email delivery system

**Website:** https://redmugsy.github.io/mugsywebsite/
**Admin:** https://your-railway-url.railway.app/admin/

