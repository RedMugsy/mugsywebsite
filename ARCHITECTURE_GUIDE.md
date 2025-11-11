# 🏗️ GitHub Repository Architecture Guide

## Overview
This document explains the architecture of the `mugsywebsite` repository to help AI agents understand the project structure and current development focus.

## 📁 Repository Structure

### Main Website (`mugsywebsite`)
- **Repository**: `RedMugsy/mugsywebsite`
- **Purpose**: Primary website with multiple forms
- **Technology**: Static HTML/CSS/JavaScript (GitHub Pages)
- **Location**: Root directory files (`index.html`, assets, etc.)

## 📋 Forms Architecture

### 1. **Contact Us Form** ✅ **RESOLVED**
- **Status**: ✅ Working correctly
- **Backend**: Handled by `contact-api` Railway app
- **Endpoint**: `/api/contact`
- **Issues**: None - do not modify

### 2. **Claims Page Form** ✅ **RESOLVED** 
- **Status**: ✅ Working correctly
- **Backend**: Handled by `contact-api` Railway app  
- **Endpoint**: `/api/claims` (or similar)
- **Issues**: None - do not modify

### 3. **Subscription Form** ⚠️ **CURRENT ISSUE**
- **Status**: ⚠️ Needs troubleshooting
- **Backend**: Separate Railway app called **"Hospitable-forgiveness"**
- **Technology**: Node.js/TypeScript backend
- **Issues**: This is what needs attention

## 🚂 Railway Apps Architecture

### App 1: `contact-api` ✅ Working
- **Purpose**: Handles Contact Us and Claims forms
- **Status**: Deployed and functioning
- **Location**: `/contact-api/` directory
- **Configuration**: 
  - `nixpacks.toml`
  - `railway.json` 
  - `Dockerfile`
- **⚠️ DO NOT MODIFY** - This is working correctly

### App 2: `Hospitable-forgiveness` ⚠️ Needs Work
- **Purpose**: Handles Subscription form submissions
- **Status**: Has deployment/runtime issues
- **Railway Project Name**: "Hospitable-forgiveness"
- **Technology**: Node.js/TypeScript backend
- **Current Issues**: Unknown - needs investigation

## 🎯 Current Development Focus

### ✅ What's Working (Don't Touch)
1. Main website (GitHub Pages deployment)
2. Contact Us form + `contact-api` backend
3. Claims form + `contact-api` backend
4. Git repository (recently cleaned up node_modules issue)

### ⚠️ What Needs Attention
1. **Subscription Form Backend** (`Hospitable-forgiveness` Railway app)
   - May have deployment issues
   - May have runtime errors
   - May have configuration problems
   - This is the ONLY thing that needs fixing

## 📝 Instructions for AI Agents

### ✅ DO:
- Focus on the `Hospitable-forgiveness` Railway app
- Investigate subscription form backend issues
- Check deployment logs for the subscription service
- Test subscription form endpoints
- Verify subscription form configuration

### ❌ DON'T:
- Modify the working `contact-api` 
- Change Contact Us or Claims form functionality
- Modify working parts of the main website
- Touch the `/contact-api/` directory unless specifically asked
- Make changes to resolved components

## 🔍 Debugging Priority

1. **First Priority**: Subscription form (`Hospitable-forgiveness`)
   - Check if Railway app is deployed
   - Verify endpoints are responding
   - Check for runtime errors
   - Test form submission flow

2. **Second Priority**: Frontend-backend connection
   - Verify subscription form points to correct Railway URL
   - Check CORS configuration for subscription endpoint
   - Test end-to-end submission flow

## 📊 Repository Status Summary

| Component | Status | Railway App | Action Needed |
|-----------|--------|-------------|---------------|
| Main Website | ✅ Working | N/A (GitHub Pages) | None |
| Contact Form | ✅ Working | `contact-api` | None |
| Claims Form | ✅ Working | `contact-api` | None |
| Subscription Form | ⚠️ Issues | `Hospitable-forgiveness` | **Fix This** |

## 🚨 Important Notes

- The `contact-api` is a separate, working Railway deployment
- The `Hospitable-forgiveness` is a different Railway app for subscriptions
- These are TWO DIFFERENT Railway projects
- Only the subscription functionality needs debugging
- Contact and Claims forms are production-ready

---

**TL;DR for AI Agents**: 
Focus on the subscription form backend (`Hospitable-forgiveness` Railway app). Everything else is working correctly and should not be modified.