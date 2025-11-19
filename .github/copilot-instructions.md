# 🤖 AI Agent Instructions for Red Mugsy Website Project

## Architecture Overview

This is a **distributed multi-service application** with:
- **Static Frontend**: GitHub Pages (`index.html` + React components)
- **Two Railway Backend APIs**: `contact-api/` (mugsywebsite app) and `perfect-integrity-api/` (Perfect Integrity app)
- **PostgreSQL Databases**: One per Railway app
- **Email Systems**: SMTP-based email verification and notifications

## 🚨 Critical Knowledge for AI Agents

### Project Status (READ THIS FIRST)
- **All applications are DEPLOYED and ACTIVE** with passing health checks
- **No redeployment needed** - focus only on environment configuration
- **Current blocker**: PostgreSQL databases and SMTP email settings need configuration
- **Never modify**: Core application logic, deployment configs, or Railway settings

### Service Endpoints
```bash
# Frontend (GitHub Pages)
https://redmugsy.github.io/mugsywebsite/

# Backend APIs (Both Active)
https://mugsywebsite-production-b065.up.railway.app/health          # contact-api
https://web-production-8c2c8.up.railway.app/health                  # perfect-integrity-api
```

### Repository Structure Pattern
```
/contact-api/           # mugsywebsite Railway app (contact + claims forms)
├── src/index.ts        # Express server with /api/contact, /api/claims endpoints
├── prisma/schema.prisma # ContactSubmission + ClaimSubmission models
├── Dockerfile          # Railway deployment config
└── package.json        # TypeScript, Express, Prisma, PostgreSQL stack

/perfect-integrity-api/ # Perfect Integrity Railway app (newsletter)
├── src/index.ts        # Express server with /api/newsletter/* endpoints  
├── prisma/schema.prisma # NewsletterSubscription model with email verification
└── package.json        # Same tech stack as contact-api

/index.html             # Main website with React components
/assets/                # Vite-built frontend assets with cache-busting
```

## 🔧 Development Patterns

### TypeScript + Prisma ORM Pattern
Both APIs follow identical patterns:
```typescript
// Database connection pattern (both APIs)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Request validation using Zod schemas
import { z } from 'zod';

// Express middleware stack: helmet, cors, rate limiting, compression
```

### CORS Configuration Standard
Both APIs use this exact CORS pattern:
```typescript
const DEFAULT_ALLOWED_ORIGINS = [
  'https://redmugsy.com',
  'https://www.redmugsy.com', 
  'https://redmugsy.github.io',
  'https://redmugsy.github.io/mugsywebsite',
  /^https:\/\/.*\.github\.io$/,
  'http://localhost:5173',    // Vite dev server
  'http://localhost:3000'
];
```

### Database Schema Patterns
```sql
-- contact-api models
ContactSubmission  (contact forms + file uploads)
ClaimSubmission   (warranty/defect claims)

-- perfect-integrity-api models  
NewsletterSubscription (email verification workflow)
```

### Build and Deployment Workflow
```bash
# Both APIs use identical npm scripts:
npm run dev          # nodemon + ts-node for development
npm run build        # TypeScript compilation + Prisma generation
npm start           # Production server (node dist/index.js)

# Railway deployment triggers automatically on git push to main
# Health checks: /health endpoints for monitoring
```

## 📋 Common Tasks for AI Agents

### Environment Configuration (PRIMARY TASK)
```bash
# Required Railway environment variables for BOTH apps:
DATABASE_URL=postgresql://[connection-string]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[email-address]  
SMTP_PASS=[app-password]
JWT_SECRET=[secure-random-string]
ADMIN_EMAIL=admin@redmugsy.com
NODE_ENV=production
```

### Database Management
```bash
# Run migrations after DATABASE_URL is set:
npx prisma db push
npx prisma generate

# Check database connection:
npx prisma db seed
```

### Testing API Endpoints
```bash
# Health checks (should return 200 OK):
curl https://mugsywebsite-production-b065.up.railway.app/health
curl https://web-production-8c2c8.up.railway.app/health

# Form endpoints (require CORS-compliant origin):
POST /api/contact       # Contact form submissions
POST /api/claims        # Claims form submissions  
POST /api/newsletter/subscribe  # Newsletter signup with verification
```

## 🚫 What NOT to Modify

- **Railway deployment configurations** (`railway.json`, `Dockerfile`)
- **Prisma schema structure** (models are production-ready)
- **Express server setup** (security middleware properly configured)
- **CORS origins list** (already supports all required domains)
- **Package.json dependencies** (all necessary packages included)

## 🎯 Focus Areas for AI Agents

1. **Environment Configuration**: Set up PostgreSQL and SMTP for both Railway apps
2. **End-to-End Testing**: Verify form submissions and email workflows after config
3. **Admin Dashboard Verification**: Check `/api/admin/*` endpoints work properly
4. **Email Verification Testing**: Ensure newsletter signup → email → verification flow works

## 📚 Key Files Reference

- `CURRENT_STATUS.md` - Real-time project status and immediate next steps
- `ARCHITECTURE_GUIDE.md` - Detailed technical architecture and service overview  
- `contact-api/src/index.ts` - Contact and claims form processing logic
- `perfect-integrity-api/src/index.ts` - Newsletter with email verification logic
- `*/prisma/schema.prisma` - Database models and relationships

Remember: This is a **production-ready system** requiring only environment setup, not code changes.