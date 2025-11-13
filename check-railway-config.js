#!/usr/bin/env node

/**
 * Railway Environment Configuration Checker
 * Run this to verify which environment variables are configured
 */

const MUGSYWEBSITE_HEALTH = 'https://mugsywebsite-production-b065.up.railway.app/health';
const PERFECT_INTEGRITY_HEALTH = 'https://web-production-8c2c8.up.railway.app/health';

const REQUIRED_ENV_MUGSYWEBSITE = [
  'DATABASE_URL',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS',
  'ADMIN_EMAIL', 'ADMIN_PASSWORD',
  'JWT_SECRET', 'CORS_ORIGINS',
  'TURNSTILE_SITEKEY_CONTACT', 'TURNSTILE_SITEKEY_CLAIMS',
  'TURNSTILE_SECRET_CONTACT', 'TURNSTILE_SECRET_CLAIMS',
  'MAIL_FROM'
];

const REQUIRED_ENV_PERFECT_INTEGRITY = [
  'DATABASE_URL',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS',
  'MAIL_FROM', 'ADMIN_EMAIL', 'FRONTEND_URL',
  'JWT_SECRET', 'CORS_ORIGINS',
  'TURNSTILE_SITEKEY_COMMUNITY', 'TURNSTILE_SECRET_COMMUNITY'
];

async function checkHealthEndpoint(url, serviceName) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.ok) {
      console.log(`✅ ${serviceName}: Health check passed`);
      return true;
    } else {
      console.log(`❌ ${serviceName}: Health check failed`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${serviceName}: Health check error - ${error.message}`);
    return false;
  }
}

async function checkCaptchaEndpoint(baseUrl, endpoint, serviceName) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();
    
    if (data.type === 'turnstile' && data.sitekey) {
      console.log(`✅ ${serviceName}: Turnstile configured (${data.sitekey})`);
      return true;
    } else {
      console.log(`❌ ${serviceName}: Turnstile not configured`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${serviceName}: Turnstile check error - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Railway Environment Configuration Checker\n');
  
  // Check health endpoints
  console.log('📊 Health Check Status:');
  const mugsyHealthy = await checkHealthEndpoint(MUGSYWEBSITE_HEALTH, 'mugsywebsite');
  const perfectHealthy = await checkHealthEndpoint(PERFECT_INTEGRITY_HEALTH, 'Perfect Integrity');
  
  console.log('\n🔐 Turnstile Configuration:');
  
  // Check Turnstile endpoints
  if (mugsyHealthy) {
    await checkCaptchaEndpoint('https://mugsywebsite-production-b065.up.railway.app', '/api/contact/captcha', 'Contact Us Form');
    await checkCaptchaEndpoint('https://mugsywebsite-production-b065.up.railway.app', '/api/claims/captcha', 'Claims Form');
  }
  
  if (perfectHealthy) {
    await checkCaptchaEndpoint('https://web-production-8c2c8.up.railway.app', '/api/newsletter/captcha', 'Community Newsletter');
  }
  
  console.log('\n📋 Required Environment Variables:');
  console.log('\n🏗️ mugsywebsite Railway App:');
  REQUIRED_ENV_MUGSYWEBSITE.forEach(env => {
    console.log(`   ${env}`);
  });
  
  console.log('\n🎯 Perfect Integrity Railway App:');
  REQUIRED_ENV_PERFECT_INTEGRITY.forEach(env => {
    console.log(`   ${env}`);
  });
  
  console.log('\n📚 Next Steps:');
  if (!mugsyHealthy || !perfectHealthy) {
    console.log('❌ Health checks failing - check Railway app status');
  } else {
    console.log('✅ Both apps are healthy');
    console.log('🔧 Configure environment variables using RAILWAY_ENV_CONFIG.md');
    console.log('🧪 Run end-to-end testing after configuration');
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkHealthEndpoint, checkCaptchaEndpoint };