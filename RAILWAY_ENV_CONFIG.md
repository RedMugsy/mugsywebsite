# 🚀 Railway Environment Configuration Guide

## Overview
Both Railway applications require environment variables to enable full functionality. This guide provides the exact configuration needed for each app.

## 🏗️ mugsywebsite Railway App Configuration

**Railway Project**: mugsywebsite  
**URL**: https://mugsywebsite-production-b065.up.railway.app  
**Purpose**: Contact Us and Claims form processing

### Required Environment Variables

```bash
# PostgreSQL Database (Add PostgreSQL service first)
DATABASE_URL=postgresql://[auto-generated-by-railway]

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Admin Configuration
ADMIN_EMAIL=admin@redmugsy.com
ADMIN_PASSWORD=secure-admin-password

# Security & CORS
JWT_SECRET=your-secure-random-jwt-secret-key
CORS_ORIGINS=https://redmugsy.github.io,https://redmugsy.com
NODE_ENV=production
PORT=8787

# Turnstile Security Keys
TURNSTILE_SITEKEY_CONTACT=0x4AAAAAAB-gWCHhZ_cF2uz9
TURNSTILE_SITEKEY_CLAIMS=0x4AAAAAAB-gYLApRvUyjKDX
TURNSTILE_SECRET_CONTACT=0x4AAAAAAB-gWNfde6-qKg0rzQgK2fLZ71Q
TURNSTILE_SECRET_CLAIMS=0x4AAAAAAB-gYA67_gkGJR_fMbrK6biOEA4

# Email From Address
MAIL_FROM=contact@redmugsy.com
```

### Setup Steps
1. **Add PostgreSQL Service**:
   - Go to mugsywebsite Railway project
   - Add PostgreSQL service
   - Railway will auto-generate DATABASE_URL

2. **Add Environment Variables**:
   - Copy all variables above into Railway environment
   - Replace placeholder values with actual credentials

3. **Database Migration**:
   - Prisma will automatically run migrations on deployment
   - Creates `contact_submissions` and `claim_submissions` tables

---

## 🎯 Perfect Integrity Railway App Configuration

**Railway Project**: Perfect Integrity  
**URL**: https://web-production-8c2c8.up.railway.app  
**Purpose**: Community Newsletter with email verification

### Required Environment Variables

```bash
# PostgreSQL Database (Add PostgreSQL service first)
DATABASE_URL=postgresql://[auto-generated-by-railway]

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Email Configuration
MAIL_FROM=community@redmugsy.com
ADMIN_EMAIL=admin@redmugsy.com

# Frontend URL for email verification links
FRONTEND_URL=https://redmugsy.github.io/mugsywebsite

# Security & CORS
JWT_SECRET=your-secure-random-jwt-secret-key
CORS_ORIGINS=https://redmugsy.github.io,https://redmugsy.com
NODE_ENV=production
PORT=8788

# Turnstile Security Keys
TURNSTILE_SITEKEY_COMMUNITY=0x4AAAAAAB_cZo6l9Vt0npf_
TURNSTILE_SECRET_COMMUNITY=0x4AAAAAAB_cZiQeiVdmtK6Dctwa7L9i6FE
```

### Setup Steps
1. **Add PostgreSQL Service**:
   - Go to Perfect Integrity Railway project
   - Add PostgreSQL service
   - Railway will auto-generate DATABASE_URL

2. **Add Environment Variables**:
   - Copy all variables above into Railway environment
   - Replace placeholder values with actual credentials

3. **Database Migration**:
   - Prisma will automatically run migrations on deployment
   - Creates `community_newsletter_subscriptions` table

---

## 📧 SMTP Configuration Details

### Gmail SMTP Setup
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
3. **Use App Password** as `SMTP_PASS` (not your regular password)

### Alternative SMTP Providers
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587  
- **Amazon SES**: email-smtp.us-east-1.amazonaws.com:587

---

## 🔐 Turnstile Secret Keys

### Get Secret Keys from Cloudflare
1. **Login to Cloudflare Dashboard**
2. **Navigate to Turnstile section**
3. **Find your sites** and record both keys for each:
   - Contact Us: Site `0x4AAAAAAB-gWCHhZ_cF2uz9`, Secret `0x4AAAAAAB-gWNfde6-qKg0rzQgK2fLZ71Q`
   - Claims: Site `0x4AAAAAAB-gYLApRvUyjKDX`, Secret `0x4AAAAAAB-gYA67_gkGJR_fMbrK6biOEA4`
   - Community: Site `0x4AAAAAAB_cZo6l9Vt0npf_`, Secret `0x4AAAAAAB_cZiQeiVdmtK6Dctwa7L9i6FE`
4. **Copy Secret Keys** and add to respective Railway apps

### Development/Testing
For testing without real secret keys, use Cloudflare's test keys:
- Test Site Key: `1x00000000000000000000AA`
- Test Secret Key: `1x0000000000000000000000000000000AA`

---

## 🚀 Deployment Process

### After Adding Environment Variables
1. **Railway Auto-Deploy**: Apps will automatically redeploy when environment variables are added
2. **Health Checks**: Monitor health endpoints during deployment:
   - mugsywebsite: `/health`
   - Perfect Integrity: `/health`
3. **Database Migrations**: Prisma will run migrations automatically
4. **Service Verification**: All services should remain "Active"

---

## ✅ Configuration Checklist

### mugsywebsite Railway App
- [ ] PostgreSQL service added
- [ ] DATABASE_URL configured
- [ ] SMTP settings added (HOST, PORT, USER, PASS)
- [ ] Admin credentials set
- [ ] Security settings configured (JWT_SECRET, CORS_ORIGINS)
- [ ] Turnstile keys added (both site keys and secrets)
- [ ] MAIL_FROM configured

### Perfect Integrity Railway App  
- [ ] PostgreSQL service added
- [ ] DATABASE_URL configured
- [ ] SMTP settings added (HOST, PORT, USER, PASS)
- [ ] Email settings configured (MAIL_FROM, FRONTEND_URL)
- [ ] Security settings configured (JWT_SECRET, CORS_ORIGINS)
- [ ] Turnstile keys added (site key and secret)

---

## 🔍 Testing After Configuration

### Health Checks
- mugsywebsite: `curl https://mugsywebsite-production-b065.up.railway.app/health`
- Perfect Integrity: `curl https://web-production-8c2c8.up.railway.app/health`

### Form Testing
1. **Contact Us Form**: Submit test contact form
2. **Claims Form**: Submit test claims form  
3. **Newsletter**: Test email verification workflow
4. **Admin Panels**: Access both admin dashboards

### Email Testing
- Contact form notifications should be delivered
- Newsletter verification emails should be sent
- All emails should have proper formatting and branding

---

**Next Step**: Configure these environment variables in Railway dashboard, then proceed to end-to-end testing.
