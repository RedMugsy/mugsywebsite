# 🏭 Red Mugsy Website Project

**A modern multi-service web application with contact forms, claims processing, and community newsletter functionality.**

## 🌐 Live Website
**Main Site**: https://redmugsy.github.io/mugsywebsite/

## 🏗️ Architecture Overview

This project implements a distributed architecture with a static frontend and multiple backend services:

### Frontend
- **Platform**: GitHub Pages with React components
- **Technology**: HTML5, CSS3, JavaScript with Vite build system
- **Features**: Contact forms, Claims processing, Newsletter signup
- **Cache Strategy**: Aggressive cache-busting for immediate updates

### Backend Services

#### 1. mugsywebsite Railway App
- **Purpose**: Contact Us and Claims form processing
- **URL**: https://mugsywebsite-production-b065.up.railway.app
- **Technology**: Node.js/TypeScript, Express, Prisma ORM, PostgreSQL
- **Features**: Form processing, admin dashboard, data persistence

#### 2. Perfect Integrity Railway App  
- **Purpose**: Community Newsletter with email verification
- **URL**: https://web-production-8c2c8.up.railway.app
- **Technology**: Node.js/TypeScript, Express, Prisma ORM, PostgreSQL
- **Features**: Email verification workflow, subscription management, admin dashboard

## 📋 Features

### ✅ Contact Management
- Contact form submissions with validation
- Basic claims processing
- Admin dashboard for submission review
- Email notifications for new submissions

### ✅ Newsletter System
- Community newsletter subscription
- Email verification workflow  
- Double opt-in confirmation process
- Subscription management dashboard
- Community-branded verification emails

### ✅ Administrative Tools
- Unified admin panels for both services
- Submission tracking and management
- Health monitoring for all services
- Real-time status dashboards

## 🚀 Deployment Status

| Component | Status | Platform | Health Check |
|-----------|--------|----------|-------------|
| Frontend Website | ✅ Active | GitHub Pages | ✅ Live |
| mugsywebsite API | ✅ Active | Railway | ✅ Passing |
| Perfect Integrity API | ✅ Active | Railway | ✅ Passing |

## 🔧 Environment Configuration

### Required Setup
Both Railway applications require:

1. **PostgreSQL Database**
   - DATABASE_URL environment variable
   - Automated migrations via Prisma

2. **SMTP Email Service**
   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
   - For contact notifications and newsletter verification

3. **Security Configuration**
   - JWT_SECRET for authentication
   - CORS_ORIGINS for cross-origin security

## 📁 Repository Structure

```
/
├── index.html                    # Main website entry
├── contact-api/                  # mugsywebsite Railway app
│   ├── src/                      # TypeScript source code
│   ├── prisma/                   # Database schema
│   ├── railway.json              # Railway deployment config
│   └── package.json              # Dependencies
├── perfect-integrity-api/        # Perfect Integrity Railway app  
│   ├── src/                      # TypeScript source code
│   ├── prisma/                   # Database schema
│   ├── railway.json              # Railway deployment config
│   └── package.json              # Dependencies
├── assets/                       # Static website assets
├── img/                          # Image resources
└── docs/                         # Documentation files
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Railway CLI (for deployment)
- PostgreSQL (for local development)

### Local Development
1. Clone the repository
2. Navigate to each API directory
3. Install dependencies: `npm install`
4. Configure environment variables
5. Run migrations: `npx prisma migrate dev`
6. Start development: `npm run dev`

### Deployment
Both APIs automatically deploy to Railway via GitHub webhooks when changes are pushed to the main branch.

## 📚 Documentation

- **[Current Status](CURRENT_STATUS.md)** - Real-time project status and next steps
- **[Architecture Guide](ARCHITECTURE_GUIDE.md)** - Detailed technical architecture
- **[Deployment Guide](DEPLOY_NOW.md)** - Current deployment status and configuration steps

## 🔍 Health Monitoring

All services include health check endpoints for monitoring:
- **mugsywebsite**: `/health`
- **Perfect Integrity**: `/health`
- **Frontend**: Live status via GitHub Pages

## 🎯 Quick Start

### For Users
Visit https://redmugsy.github.io/mugsywebsite/ to access:
- Contact forms
- Claims submission
- Newsletter subscription

### For Developers  
1. Review [CURRENT_STATUS.md](CURRENT_STATUS.md) for latest project state
2. Check [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md) for technical details
3. Follow [DEPLOY_NOW.md](DEPLOY_NOW.md) for deployment information

## 📞 Support

For technical issues or questions:
- Check health status endpoints
- Review admin dashboards
- Consult documentation files in repository

---

**Status**: Production Ready - Environment Configuration Pending  
**Last Updated**: December 2024