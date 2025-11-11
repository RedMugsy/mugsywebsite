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

### App 1: `mugsywebsite` ✅ Working
- **Purpose**: Handles Contact Us and Claims forms
- **Status**: Deployed and functioning
- **Location**: `/contact-api/` directory in this repository
- **Configuration**: 
  - `nixpacks.toml`
  - `railway.json` 
  - `Dockerfile`
- **✅ WORKING CORRECTLY** - Contact and Claims forms

### App 2: `perfect-integrity` ⚠️ Current Focus
- **Purpose**: Handles Subscription/Registration form submissions
- **Status**: Currently being set up (replaced hospitable-forgiveness)
- **Railway Project Name**: "perfect-integrity"
- **Technology**: Node.js/TypeScript backend
- **Previous**: Was called "hospitable-forgiveness" (deleted and replaced)
- **Current Issues**: Needs configuration and testing

## 🎯 Current Development Focus

### ✅ What's Working (Don't Touch)
1. Main website (GitHub Pages deployment)
2. Contact Us form + `mugsywebsite` Railway app
3. Claims form + `mugsywebsite` Railway app
4. Git repository (recently cleaned up node_modules issue)

### ⚠️ What Needs Attention
1. **Subscription/Registration Form Backend** (`perfect-integrity` Railway app)
   - New deployment replacing old hospitable-forgiveness
   - May need configuration setup
   - May need environment variables
   - This is what needs to be configured and tested

## 📝 Instructions for AI Agents

### ✅ DO:
- Focus on the `perfect-integrity` Railway app for subscription functionality
- Set up subscription/registration form backend configuration
- Test subscription form endpoints in perfect-integrity
- Configure environment variables for subscription service
- Connect subscription forms to perfect-integrity URL

### ❌ DON'T:
- Modify the working `mugsywebsite` Railway app (contact + claims)
- Change Contact Us or Claims form functionality
- Modify working parts of the main website
- Touch the contact/claims functionality
- Look for hospitable-forgiveness (it was deleted and replaced)

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
| Contact Form | ✅ Working | `mugsywebsite` | None |
| Claims Form | ✅ Working | `mugsywebsite` | None |
| Subscription Form | ⚠️ Setup Needed | `perfect-integrity` | **Configure This** |

## 🚨 Important Notes

- The `contact-api` is a separate, working Railway deployment
- The `Hospitable-forgiveness` is a different Railway app for subscriptions
- These are TWO DIFFERENT Railway projects
- Only the subscription functionality needs debugging
- Contact and Claims forms are production-ready

---

**TL;DR for AI Agents**: 
Focus on setting up the subscription form backend (`perfect-integrity` Railway app). Contact and Claims functionality is working correctly on the `mugsywebsite` Railway app. The old `hospitable-forgiveness` was deleted and replaced.