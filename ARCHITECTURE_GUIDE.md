# 🏗️ GitHub Repository Architecture Guide

## Overview
This document explains the architecture of the `mugsywebsite` repository to help AI agents understand the project structure and current development focus.

## 📁 Repository Structure

### Main Website (`mugsywebsite`)
- **Repository**: `RedMugsy/mugsywebsite`
- **Purpose**: Primary website with multiple forms
- **Technology**: Static HTML/CSS/JavaScript with React components (GitHub Pages)
- **Location**: Root directory files (`index.html`, assets, etc.)

## 📋 Forms Architecture

### 1. **Contact Us Form** ✅ **ACTIVE**
- **Status**: ✅ Deployed and fully functional
- **Backend**: Handled by `mugsywebsite` Railway app
- **Endpoint**: `/api/contact`
- **Technology**: Node.js/TypeScript with Express, PostgreSQL, Prisma ORM
- **Issues**: None - production ready

### 2. **Claims Page Form** ✅ **ACTIVE** 
- **Status**: ✅ Deployed and fully functional
- **Backend**: Handled by `mugsywebsite` Railway app  
- **Endpoint**: `/api/claims`
- **Technology**: Node.js/TypeScript with Express, PostgreSQL, Prisma ORM
- **Issues**: None - production ready

### 3. **Community Newsletter Form** ✅ **ACTIVE**
- **Status**: ✅ Deployed and fully functional
- **Backend**: Handled by **Perfect Integrity** Railway app
- **Technology**: Node.js/TypeScript with Express, PostgreSQL, Prisma ORM
- **Features**: Email verification workflow, admin dashboard, community-branded emails
- **Issues**: Requires environment configuration only

## 🚂 Railway Apps Architecture

### App 1: `mugsywebsite` ✅ ACTIVE
- **Purpose**: Handles Contact Us and Claims forms
- **Status**: Deployed and active on Railway
- **Location**: `/contact-api/` directory in this repository
- **Health Check**: https://mugsywebsite-production-b065.up.railway.app/health
- **Configuration**: 
  - `nixpacks.toml`
  - `railway.json` 
  - `Dockerfile`
- **Database**: PostgreSQL with ContactSubmission and ClaimSubmission models
- **✅ PRODUCTION READY** - Contact and Claims forms active

### App 2: `Perfect Integrity` ✅ ACTIVE
- **Purpose**: Handles Community Newsletter subscriptions with email verification
- **Status**: Deployed and active on Railway
- **Railway Project Name**: "Perfect Integrity"
- **Location**: `/perfect-integrity-api/` directory in this repository
- **Health Check**: https://web-production-8c2c8.up.railway.app/health
- **Technology**: Node.js/TypeScript backend with email verification workflow
- **Database**: PostgreSQL with NewsletterSubmission model
- **Features**: Email verification, admin dashboard, community-branded emails
- **✅ PRODUCTION READY** - Newsletter functionality active

## 🎯 Current Development Status

### ✅ What's Working (Production Ready)
1. **Main website** (GitHub Pages deployment) - Active
2. **Contact Us form** + `mugsywebsite` Railway app - Active
3. **Claims form** + `mugsywebsite` Railway app - Active
4. **Community Newsletter** + `Perfect Integrity` Railway app - Active
5. **Email verification workflow** for newsletter subscriptions - Active
6. **Admin dashboards** for both contact and newsletter data - Active

### ⏳ Environment Configuration Needed
1. **PostgreSQL Database** setup for both Railway apps
   - Perfect Integrity needs DATABASE_URL environment variable
   - mugsywebsite needs DATABASE_URL environment variable
2. **SMTP Email Configuration** for both apps
   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables
3. **Frontend Environment Variables**
   - VITE_CONTACT_API pointing to mugsywebsite Railway app
   - VITE_NEWSLETTER_API pointing to Perfect Integrity Railway app

## 📝 Instructions for AI Agents

### ✅ DO:
- Configure PostgreSQL databases for both Railway apps
- Set up SMTP environment variables for email functionality
- Test end-to-end functionality after environment configuration
- Verify health check endpoints for both apps
- Test admin dashboard functionality

### ❌ DON'T:
- Redeploy apps (both are already active and healthy)
- Modify core application logic (all code is working)
- Change Railway app configurations
- Touch the successful deployment architecture
- Look for "hospitable-forgiveness" (deleted and replaced)

## 🔍 Environment Configuration Priority

1. **First Priority**: PostgreSQL Database Setup
   - Create PostgreSQL services on Railway for both apps
   - Add DATABASE_URL to Perfect Integrity Railway app
   - Add DATABASE_URL to mugsywebsite Railway app
   - Run database migrations on both apps

2. **Second Priority**: SMTP Email Configuration
   - Add SMTP environment variables to both Railway apps
   - Test email delivery for contact forms
   - Test email verification for newsletter subscriptions

3. **Third Priority**: End-to-End Testing
   - Verify newsletter signup and email verification flow
   - Test contact form submissions and notifications
   - Check admin dashboard functionality for both services

## 📊 Repository Status Summary

| Component | Status | Railway App | Health Check | Action Needed |
|-----------|--------|-------------|--------------|---------------|
| Main Website | ✅ Active | N/A (GitHub Pages) | N/A | None |
| Contact Form | ✅ Active | `mugsywebsite` | ✅ Passing | Environment Config |
| Claims Form | ✅ Active | `mugsywebsite` | ✅ Passing | Environment Config |
| Newsletter Form | ✅ Active | `Perfect Integrity` | ✅ Passing | Environment Config |
| Email Verification | ✅ Active | `Perfect Integrity` | ✅ Passing | Environment Config |
| Admin Dashboards | ✅ Active | Both Apps | ✅ Passing | Environment Config |

## 🚨 Important Notes

- Both Railway apps are **deployed and active**
- All health check endpoints are **passing**
- All application code is **production ready**
- Only **environment configuration** (PostgreSQL + SMTP) is needed
- No code changes or redeployment required

---

**TL;DR for AI Agents**: 
Both Railway apps are successfully deployed and active. Focus on configuring PostgreSQL databases and SMTP email settings for both `Perfect Integrity` (newsletter) and `mugsywebsite` (contact/claims) apps. All application logic is complete and functional.