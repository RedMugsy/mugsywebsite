# Red Mugsy Treasure Hunt - Complete System Documentation

## PROJECT OVERVIEW
**Project Name:** Red Mugsy Treasure Hunt  
**Type:** Web-based treasure hunt platform with Solana cryptocurrency payments  
**Status:** Production deployment in progress - backend health check failures  
**Date:** December 9, 2025  

---

## SYSTEM ARCHITECTURE

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │    DATABASE     │
│  GitHub Pages   │◄──►│    Railway      │◄──►│MongoDB Railway  │
│                 │    │                 │    │                 │
│ React/TypeScript│    │ Node.js/Express │    │   treasure_hunt │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   SECURITY      │    │    PAYMENTS     │
│Cloudflare       │    │     Solana      │
│Turnstile        │    │   mainnet-beta  │
└─────────────────┘    └─────────────────┘
```

---

## COMPONENT ROLES & RESPONSIBILITIES

### **1. FRONTEND (GitHub Pages)**
- **Technology:** React + TypeScript + Vite
- **Hosting:** GitHub Pages
- **Repository:** `RedMugsy/mugsywebsite`
- **URL:** `https://redmugsy.github.io/mugsywebsite/`
- **Location in Repo:** `/mugsy-site/` directory
- **Role:** User interface for treasure hunt participation, user registration, payments

### **2. BACKEND (Railway)**
- **Technology:** Node.js + Express + ES Modules
- **Hosting:** Railway
- **Repository:** `RedMugsy/mugsywebsite` (same repo as frontend)
- **URL:** `https://red-mugsy-treasure-hunt-backend-production.up.railway.app`
- **Location in Repo:** `/mugsy-site/backend/` directory
- **Role:** API server, authentication, database operations, Solana integration

### **3. DATABASE (MongoDB on Railway)**
- **Type:** MongoDB
- **Hosting:** Railway (same project as backend)
- **Database Name:** `treasure_hunt`
- **Connection:** Internal Railway networking
- **Role:** Store user data, treasure hunt progress, authentication tokens

### **4. SECURITY (Cloudflare Turnstile)**
- **Domain:** `redmugsy.com`
- **Implementation:** Bot protection for forms
- **Integration:** Backend validates Turnstile tokens
- **Keys:** Participant, Promoter, and Signin-specific configurations

### **5. PAYMENTS (Solana)**
- **Network:** mainnet-beta
- **Integration:** 100% Solana-based payment system
- **Role:** Handle treasure hunt entry fees and prize distributions

---

## REPOSITORY STRUCTURE

### **Single Repository Strategy**
```
RedMugsy/mugsywebsite/
├── mugsy-site/                    # Frontend container
│   ├── src/                      # React source code
│   ├── public/                   # Static assets
│   ├── dist/                     # Built frontend (deployed to GitHub Pages)
│   ├── backend/                  # Backend application
│   │   ├── server.js            # Main server file (ES modules)
│   │   ├── package.json         # Backend dependencies
│   │   ├── railway.json         # Railway deployment config
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API endpoints
│   │   ├── middleware/          # Authentication middleware
│   │   └── services/            # Business logic
│   ├── package.json             # Frontend dependencies
│   └── vite.config.ts           # Frontend build config
├── railway.json                  # Root Railway config (legacy)
├── server.js                     # Copied backend (legacy)
└── README.md
```

---

## DEPLOYMENT CONFIGURATION

### **Frontend Deployment (GitHub Pages)**
- **Source:** Repository root
- **Build:** Automatic via GitHub Actions
- **Static Files:** Served from `/mugsy-site/dist/`
- **Domain:** Custom domain `redmugsy.com` (if configured)

### **Backend Deployment (Railway)**
- **Repository:** `RedMugsy/mugsywebsite`
- **Branch:** `main`
- **Root Directory:** `mugsy-site/backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Health Check:** `/health` endpoint with 60s timeout
- **Port:** Dynamic (`$PORT` environment variable)

---

## ENVIRONMENT VARIABLES (Railway)

### **Database Configuration**
```
MONGODB_URI=mongodb://mongo:ANqJfgpRKCrTlrkLGeBFLvMxgvOOjYju@mongodb.railway.internal:27017/treasure_hunt
DATABASE_URL=postgresql://... (unused, PostgreSQL service exists but not used)
```

### **Application Configuration**
```
NODE_ENV=production
PORT=$PORT
FRONTEND_URL=https://redmugsy.github.io/mugsywebsite
CORS_ORIGIN=https://redmugsy.github.io
```

### **Authentication**
```
JWT_SECRET=a8f3d9c2b1e4f7a9c5d8e6b3f2a7d4c9e5f8a2b6d3c7f9e1a4b8c5d2f6a9e3c7d1
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=b9e4c8a3f6d2a7e5c1f9b4d8a2c6f3e7b1a5d9c4f8e2b7a3d6c1f5e9b2a8d4c7f6
JWT_REFRESH_EXPIRES_IN=7d
ADMIN_EMAIL=info@redmugsy.com
ADMIN_PASSWORD=SecureAdminPass123!Change2025
```

### **Email Configuration**
```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=info@redmugsy.com
SMTP_PASS=wmnrnlxvhnfnvvmg
SMTP_SECURE=false
EMAIL_FROM=info@redmugsy.com
EMAIL_FROM_NAME=Red Mugsy Treasure Hunt
```

### **Cloudflare Turnstile**
```
TURNSTILE_SECRET_PARTICIPANT=0x4AAAAAACCjOKcMasWMf4LaJRbGmMfkIvc
TURNSTILE_SECRET_PROMOTER=0x4AAAAAACCjPAYKmLx3VnQK4daBnIlTgZA
TURNSTILE_SECRET_PARTICIPANT_SIGNIN=0x4AAAAAACFA8okn92b9FI3zqxU6mAAbYko
```

### **Solana Configuration**
```
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## CURRENT ISSUE: BACKEND HEALTH CHECK FAILURES

### **Problem Description**
The backend application deploys successfully but fails all health checks, resulting in "Application failed to respond" (502 errors). The application appears to be crashing immediately after startup.

### **Symptoms**
1. ✅ **Build Phase:** Successful - image builds and pushes (293.4 MB)
2. ✅ **Deploy Phase:** Successful - container starts
3. ❌ **Health Check:** Fails - `/health` endpoint unresponsive
4. ❌ **Service Status:** 502 errors on all endpoints
5. ❌ **Retry Behavior:** Railway retries for 40-60 seconds before giving up

### **Error Pattern**
```
Starting Healthcheck
Path: /health
Retry window: 60s
Attempt #1 failed with service unavailable. Continuing to retry for 40s
Attempt #2 failed with service unavailable. Continuing to retry for 48s
[continues...]
1/1 replicas never became healthy!
Healthcheck failed!
```

---

## TROUBLESHOOTING HISTORY & RESOLUTIONS

### **Phase 1: Initial Discovery (December 8, 2025)**
**Problem:** User registration failing with "Connection timeout" errors  
**Root Cause:** Railway backend returning 502 errors  
**Status:** ✅ Identified core issue  

### **Phase 2: Repository Connection Issues**
**Problem:** Railway connected to wrong repository (`red-mugsy-treasure-hunt-backend`)  
**Solution:** ✅ Connected Railway to correct repository (`RedMugsy/mugsywebsite`)  
**Status:** ✅ Resolved  

### **Phase 3: Directory Structure Issues**
**Problem:** Railway couldn't find backend files due to incorrect path navigation  
**Root Cause:** Railway.toml causing double directory navigation  
**Solution:** ✅ Created proper `railway.json` configuration in `/mugsy-site/backend/`  
**Configuration:**
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 60,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```
**Status:** ✅ Resolved  

### **Phase 4: Environment Variable Corrections**
**Problem:** Multiple environment variable typos causing backend crashes  
**Original Issues:**
- `FRONTEND_UR` → `FRONTEND_URL` ✅ Fixed
- `SMTP_POR` → `SMTP_PORT` ✅ Fixed  
- `SOLANA_RPC_UR` → `SOLANA_RPC_URL` ✅ Fixed
- `MONGODB_URI` missing `/treasure_hunt` ✅ Fixed
- `PORT` variable missing ✅ Added as `$PORT`

**Status:** ✅ All environment variables corrected  

### **Phase 5: Railway Configuration Optimization**
**Problem:** Startup command and health check timeout issues  
**Solutions Applied:**
- ✅ Changed start command from `npm start` to `node server.js` (more direct)
- ✅ Increased health check timeout from 30s to 60s
- ✅ Verified ES modules compatibility (`"type": "module"` in package.json)

**Status:** ✅ Configuration optimized  

---

## CURRENT STATUS SUMMARY

### **✅ COMPLETED FIXES**
1. **Repository Connection:** Railway correctly connected to `RedMugsy/mugsywebsite`
2. **Directory Structure:** Railway.json properly placed in `/mugsy-site/backend/`
3. **Environment Variables:** All 20+ variables correctly configured with proper names
4. **Build Configuration:** Nixpacks successfully building Node.js ES modules application
5. **Deployment Strategy:** Direct `node server.js` execution with extended health checks

### **❌ REMAINING ISSUE**
**Backend Application Startup Failure:** Despite successful deployment, the Node.js application is not responding to health checks, indicating an immediate crash or hang during startup.

### **🔍 LIKELY CAUSES**
1. **Database Connection Issues:** MongoDB connection string or network connectivity problems
2. **Missing Dependencies:** Runtime dependencies not properly installed
3. **ES Modules Compatibility:** Node.js version or import/export syntax issues
4. **Environment Variable Validation:** Application expecting additional variables not configured
5. **CORS Configuration Mismatch:** Frontend URL vs CORS origin conflicts

---

## NEXT STEPS FOR DEBUGGING

### **Immediate Actions Needed**
1. **Railway Logs Analysis:** Access Railway deployment logs to see Node.js startup errors
2. **Environment Variable Audit:** Compare all `process.env.*` usage in code vs configured variables
3. **Database Connection Test:** Verify MongoDB connectivity and authentication
4. **Dependencies Check:** Ensure all package.json dependencies are production-compatible
5. **ES Modules Verification:** Confirm Node.js version supports ES modules syntax used

### **Alternative Solutions**
1. **Downgrade to CommonJS:** Convert from ES modules to require() syntax for compatibility
2. **Add Debug Logging:** Inject console.log statements to identify exact failure point
3. **Railway Service Restart:** Complete service deletion and recreation with fresh configuration
4. **Local Environment Test:** Reproduce the issue locally with identical environment variables

---

## TECHNICAL SPECIFICATIONS

### **Backend Dependencies**
- **Node.js Runtime:** Latest LTS (Railway Nixpacks default)
- **Framework:** Express.js with ES modules
- **Database:** Mongoose ODM for MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Input sanitization and Turnstile verification

### **Frontend Dependencies**
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite for fast development and production builds
- **Styling:** Tailwind CSS for utility-first design
- **Testing:** Playwright for end-to-end testing

### **Infrastructure Requirements**
- **Railway:** Node.js service with MongoDB addon
- **GitHub Pages:** Static site hosting with custom domain support
- **Cloudflare:** DNS and Turnstile bot protection
- **Solana RPC:** Mainnet-beta network access for cryptocurrency operations

---

## SECURITY CONSIDERATIONS

### **Authentication Flow**
1. User submits credentials via frontend
2. Cloudflare Turnstile validates human user
3. Backend verifies Turnstile token with Cloudflare API
4. JWT tokens issued for authenticated sessions
5. Database operations protected by authentication middleware

### **Payment Security**
- Solana private keys securely stored in Railway environment variables
- No direct cryptocurrency handling in frontend
- All payment processing server-side verified

### **Data Protection**
- HTTPS enforced on all connections
- CORS properly configured for cross-origin requests
- Input validation and sanitization on all API endpoints
- Production error messages sanitized (no stack traces exposed)

---

**Documentation Last Updated:** December 9, 2025, 7:30 PM  
**System Status:** Backend deployment failing health checks - investigation ongoing  
**Priority:** HIGH - Blocking production launch of treasure hunt platform