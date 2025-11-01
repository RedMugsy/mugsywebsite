# Quick Start: Deploy Your Contact API to Railway

## ✅ What's Done
- ✅ Website is now live at: https://redmugsy.github.io/mugsywebsite/
- ✅ Frontend build fixed (GitHub Pages paths corrected)
- ✅ Backend API code is ready for deployment
- ✅ All configuration files are in place

## 🚀 Next Steps (Do This Now)

### 1. Deploy Backend to Railway (5 minutes)
1. Go to **[railway.app](https://railway.app)** and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your **`mugsywebsite`** repository
4. Choose **`contact-api`** as the root directory
5. Railway will automatically deploy using the `railway.json` config

### 2. Set Environment Variables in Railway
In Railway dashboard, add these variables:
```bash
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=super-secret-jwt-key-change-this
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
ADMIN_EMAIL=admin@redmugsy.com
ADMIN_PASSWORD=admin123
CORS_ORIGINS=https://redmugsy.github.io
PORT=8787
NODE_ENV=production
```

### 3. Get Your Railway URL
- After deployment, Railway will give you a URL like: `https://contact-api-production-abcd.up.railway.app`
- Copy this URL

### 4. Update Frontend Config
Replace the URL in `mugsy-site/.env.production`:
```bash
VITE_API_BASE=https://your-actual-railway-url.up.railway.app
```

### 5. Redeploy Frontend
```bash
git add mugsy-site/.env.production
git commit -m "Update API URL for Railway deployment"
git push
```

## 🎉 That's It!
- Your website will automatically rebuild and deploy via GitHub Actions
- Contact forms will start working with your Railway backend
- Admin panel will be available at: `https://your-railway-url.up.railway.app/admin`

## 🔧 If You Need Help
The detailed deployment guide is in `RAILWAY_DEPLOYMENT_STEPS.md`

## Current Status
- **Frontend**: ✅ Deployed and working
- **Backend**: ⏳ Ready to deploy (waiting for you to do the Railway setup)
- **Integration**: ⏳ Will work once Railway URL is updated in frontend