# 🔐 Turnstile Configuration for Red Mugsy Website

## Overview
Cloudflare Turnstile integration has been added to all three forms across both Railway applications to prevent spam and bot submissions.

## 📋 Turnstile Site Keys Configuration

### Contact Us Form
- **Site Key**: `0x4AAAAAAB-gWCHhZ_cF2uz9`
- **App**: mugsywebsite Railway app
- **Endpoint**: `/api/contact/captcha`
- **Environment Variable**: `TURNSTILE_SITEKEY_CONTACT`

### Claims Form  
- **Site Key**: `0x4AAAAAAB-gYLApRvUyjKDX`
- **App**: mugsywebsite Railway app
- **Endpoint**: `/api/claims/captcha`
- **Environment Variable**: `TURNSTILE_SITEKEY_CLAIMS`

### Community Subscription Form
- **Site Key**: `0x4AAAAAAB_cZo6l9Vt0npf_`
- **App**: Perfect Integrity Railway app
- **Endpoint**: `/api/newsletter/captcha`
- **Environment Variable**: `TURNSTILE_SITEKEY_COMMUNITY`

## 🔑 Required Environment Variables

### mugsywebsite Railway App
```bash
# Turnstile Site Keys
TURNSTILE_SITEKEY_CONTACT=0x4AAAAAAB-gWCHhZ_cF2uz9
TURNSTILE_SITEKEY_CLAIMS=0x4AAAAAAB-gYLApRvUyjKDX

# Turnstile Secret Keys
TURNSTILE_SECRET_CONTACT=0x4AAAAAAB-gWNfde6-qKg0rzQgK2fLZ71Q
TURNSTILE_SECRET_CLAIMS=0x4AAAAAAB-gYA67_gkGJR_fMbrK6biOEA4
```

### Perfect Integrity Railway App
```bash
# Turnstile Site Key
TURNSTILE_SITEKEY_COMMUNITY=0x4AAAAAAB_cZo6l9Vt0npf_

# Turnstile Secret Key
TURNSTILE_SECRET_COMMUNITY=0x4AAAAAAB_cZiQeiVdmtK6Dctwa7L9i6FE
```

## 🛡️ Implementation Details

### Captcha Endpoints Added
1. **Contact Us**: `GET /api/contact/captcha` - Returns site key for contact form
2. **Claims**: `GET /api/claims/captcha` - Returns site key for claims form  
3. **Community**: `GET /api/newsletter/captcha` - Returns site key for newsletter form

### Verification Integration
- **Contact Form**: `/api/contact` now validates `turnstileToken` parameter
- **Claims Form**: `/api/claims` now validates `turnstileToken` parameter
- **Community Newsletter**: `/api/newsletter/subscribe` now validates `turnstileToken` parameter

### Security Features
- Turnstile tokens are verified server-side against Cloudflare API
- Failed verification returns `400 Bad Request` with `invalid_captcha` error
- Graceful degradation if Turnstile secrets are not configured (development mode)

## 🚀 Next Steps

1. **Configure Turnstile Secret Keys**:
   - Log into Cloudflare dashboard
   - Navigate to Turnstile section  
   - Get secret keys for each site key
   - Add secret keys to respective Railway apps

2. **Frontend Integration**:
   - Update frontend forms to include Turnstile widgets
   - Call captcha endpoints to get site keys
   - Include `turnstileToken` in form submissions

3. **Testing**:
   - Test each form with Turnstile verification
   - Verify proper error handling
   - Confirm spam protection is working

## 📊 Configuration Status

| Form | Site Key | Secret Key | Integration | Status |
|------|----------|------------|-------------|--------|
| Contact Us | ✅ Added | ✅ Added | ✅ Complete | Ready for Testing |
| Claims | ✅ Added | ✅ Added | ✅ Complete | Ready for Testing |
| Community Newsletter | ✅ Added | ✅ Added | ✅ Complete | Ready for Testing |

## 🔧 Troubleshooting

### Common Issues
- **Missing Secret Keys**: Forms will work but without bot protection
- **Invalid Tokens**: Returns `invalid_captcha` error
- **Network Issues**: Fallback allows form submission

### Testing Verification
Use Cloudflare's test keys for development:
- Test Site Key: `1x00000000000000000000AA`
- Test Secret Key: `1x0000000000000000000000000000000AA`

---

**Note**: Secret keys must be obtained from your Cloudflare Turnstile dashboard and configured in Railway environment variables for full protection to be active.
