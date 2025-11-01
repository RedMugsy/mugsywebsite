# Railway Deployment Guide for Contact API

## Option 1: Deploy via Railway Web Interface (Recommended)

### Step 1: Set up Railway Project
1. Go to [Railway.app](https://railway.app)
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `mugsywebsite` repository
6. Select the `contact-api` folder as the root directory

### Step 2: Configure Environment Variables
Add these environment variables in Railway dashboard:

```bash
# Database
DATABASE_URL=file:./prisma/dev.db

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-here

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin Configuration
ADMIN_EMAIL=admin@redmugsy.com
ADMIN_PASSWORD=your-secure-admin-password

# CORS Origins (your frontend URL)
CORS_ORIGINS=https://redmugsy.github.io

# API Configuration
PORT=8787
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Deploy
1. Railway will automatically detect the Node.js project
2. It will use the `package.json` scripts to build and deploy
3. The `railway.json` config file will set the correct build/start commands
4. Your API will be available at: `https://your-app-name.up.railway.app`

### Step 4: Update Frontend Configuration
1. Copy your Railway app URL
2. Update `mugsy-site/.env.production` with your Railway URL:
```bash
VITE_API_BASE=https://your-app-name.up.railway.app
```

### Step 5: Redeploy Frontend
1. Commit and push the updated `.env.production` file
2. GitHub Actions will automatically rebuild and deploy the frontend
3. Your contact forms will now work with the Railway backend

## Option 2: Deploy via Railway CLI

### Prerequisites
```bash
npm install -g @railway/cli
railway login
```

### Deploy Commands
```bash
# From the project root
cd contact-api

# Initialize Railway project
railway init

# Set environment variables (one by one)
railway variables set DATABASE_URL=file:./prisma/dev.db
railway variables set JWT_SECRET=your-super-secure-jwt-secret-here
# ... (set all other variables from Option 1)

# Deploy
railway up
```

## Important Notes

### Database Setup
- Railway will automatically run `prisma generate` and `prisma db push` during deployment
- Your SQLite database will be created in the Railway container
- Database data will persist across deployments

### SSL/HTTPS
- Railway automatically provides HTTPS for all deployments
- No additional SSL configuration needed

### CORS Configuration
- Make sure to add your frontend domain to CORS_ORIGINS
- Current frontend URL: `https://redmugsy.github.io`

### Gmail SMTP Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for SMTP
3. Use the app password (not your regular password) in SMTP_PASS

### Environment Variables Security
- Never commit real environment variables to git
- Use Railway's secure environment variable storage
- JWT_SECRET should be a long, random string
- Use strong passwords for admin access

## Testing the Deployment

### Health Check
Visit: `https://your-app-name.up.railway.app/health`
Should return: `{"status":"OK","timestamp":"..."}`

### API Endpoints
- `POST /api/contact` - Contact form submission
- `POST /api/claim` - Token claiming
- `GET /api/admin` - Admin panel
- `POST /api/admin/login` - Admin login

### Troubleshooting
1. Check Railway deployment logs in the dashboard
2. Verify all environment variables are set correctly
3. Ensure database migrations ran successfully
4. Check CORS settings if getting cross-origin errors

## Next Steps After Deployment
1. Test contact form submission from your website
2. Test admin panel login
3. Verify email delivery works
4. Monitor deployment logs for any issues

Your backend API should now be fully functional at your Railway URL!