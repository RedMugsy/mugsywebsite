# Cloudflare Turnstile Setup Documentation

## Overview
Cloudflare Turnstile provides bot protection for the registration forms without requiring users to solve CAPTCHAs. This implementation protects both the Participant Registration and Promoter Self-Registration forms.

## Site Keys (Public - Safe to commit)

### Participant Registration Form
- **Site Key**: `0x4AAAAAACCjOLDn-vMrwViE`
- **Location**: `src/TreasureHuntRegistration.tsx`

### Promoter Registration Form
- **Site Key**: `0x4AAAAAACCjPAPEx1KF6so2`
- **Location**: `src/PromoterSelfRegistration.tsx`

## Secret Keys (MUST be kept secure - NEVER commit)

### ⚠️ CRITICAL SECURITY REQUIREMENTS

**The secret keys MUST be handled through CI/CD secret management and injected as environment variables at runtime.**

### Participant Registration Form
- **Secret Key**: `0x4AAAAAACCjOKcMasWMf4LaJRbGmMfkIvc`
- **Environment Variable**: `TURNSTILE_SECRET_PARTICIPANT`

### Promoter Registration Form
- **Secret Key**: `0x4AAAAAACCjPAYKmLx3VnQK4daBnIlTgZA`
- **Environment Variable**: `TURNSTILE_SECRET_PROMOTER`

## Backend Implementation Required

### Token Verification Flow

1. **Frontend** (Already implemented):
   - User completes Turnstile challenge
   - Token is generated and stored in component state
   - Token is sent to backend with form submission

2. **Backend** (Must be implemented):
   - Receive turnstile token from frontend
   - Verify token with Cloudflare using secret key
   - Only process form if verification succeeds

### Backend Verification Example (Node.js/Express)

```javascript
const verifyTurnstileToken = async (token, secretKey) => {
  const formData = new FormData()
  formData.append('secret', secretKey)
  formData.append('response', token)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData
  })

  const data = await response.json()
  return data.success
}

// Participant Registration Endpoint
app.post('/api/participant-registration', async (req, res) => {
  const { turnstileToken, formData } = req.body

  // Verify turnstile token
  const isValid = await verifyTurnstileToken(
    turnstileToken,
    process.env.TURNSTILE_SECRET_PARTICIPANT
  )

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid captcha' })
  }

  // Process registration...
})

// Promoter Registration Endpoint
app.post('/api/promoter-registration', async (req, res) => {
  const { turnstileToken, formData } = req.body

  // Verify turnstile token
  const isValid = await verifyTurnstileToken(
    turnstileToken,
    process.env.TURNSTILE_SECRET_PROMOTER
  )

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid captcha' })
  }

  // Process registration...
})
```

### Python/Flask Example

```python
import os
import requests

def verify_turnstile_token(token, secret_key):
    response = requests.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        data={
            'secret': secret_key,
            'response': token
        }
    )
    return response.json().get('success', False)

@app.route('/api/participant-registration', methods=['POST'])
def participant_registration():
    data = request.json
    turnstile_token = data.get('turnstileToken')

    # Verify turnstile token
    is_valid = verify_turnstile_token(
        turnstile_token,
        os.environ['TURNSTILE_SECRET_PARTICIPANT']
    )

    if not is_valid:
        return jsonify({'error': 'Invalid captcha'}), 400

    # Process registration...
```

## Environment Variable Setup

### Development (.env file - DO NOT COMMIT)

Create a `.env` file in your backend directory:

```env
# Cloudflare Turnstile Secret Keys
TURNSTILE_SECRET_PARTICIPANT=0x4AAAAAACCjOKcMasWMf4LaJRbGmMfkIvc
TURNSTILE_SECRET_PROMOTER=0x4AAAAAACCjPAYKmLx3VnQK4daBnIlTgZA
```

Add `.env` to your `.gitignore`:

```
.env
.env.local
.env.*.local
```

### Production (CI/CD Secret Management)

#### GitHub Actions
1. Go to Repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `TURNSTILE_SECRET_PARTICIPANT`
   - `TURNSTILE_SECRET_PROMOTER`

3. In your workflow file:
```yaml
env:
  TURNSTILE_SECRET_PARTICIPANT: ${{ secrets.TURNSTILE_SECRET_PARTICIPANT }}
  TURNSTILE_SECRET_PROMOTER: ${{ secrets.TURNSTILE_SECRET_PROMOTER }}
```

#### Vercel
```bash
vercel env add TURNSTILE_SECRET_PARTICIPANT production
vercel env add TURNSTILE_SECRET_PROMOTER production
```

#### Netlify
```bash
netlify env:set TURNSTILE_SECRET_PARTICIPANT "0x4AAAAAACCjOKcMasWMf4LaJRbGmMfkIvc"
netlify env:set TURNSTILE_SECRET_PROMOTER "0x4AAAAAACCjPAYKmLx3VnQK4daBnIlTgZA"
```

#### AWS / Heroku
Use their respective secret management systems to inject environment variables at runtime.

## Testing

### Test Mode (Development)
Cloudflare Turnstile provides test site keys that always pass verification:
- **Test Site Key**: `1x00000000000000000000AA`
- **Test Secret Key**: `1x0000000000000000000000000000000AA`

To test in development, temporarily replace the site keys in the code with the test keys.

### Production Testing Checklist
1. ✅ Site keys are correctly configured in frontend
2. ✅ Secret keys are stored in environment variables
3. ✅ Secret keys are NOT in codebase or version control
4. ✅ Backend endpoint verifies token before processing
5. ✅ Failed verification returns appropriate error
6. ✅ Frontend displays error when verification fails
7. ✅ Token expiry is handled (user must re-verify)

## Frontend Implementation Details

### Participant Registration (`TreasureHuntRegistration.tsx`)
- Widget appears before submit button
- Dark theme to match site aesthetic
- Validates token exists before form submission
- Clears error when verification succeeds
- Shows error message if verification fails/expires

### Promoter Registration (`PromoterSelfRegistration.tsx`)
- Same implementation as participant form
- Separate site key for better analytics
- Consistent dark theme and error handling

### Console Logging
When forms are submitted, the turnstile token is logged to console:
```
===== PARTICIPANT REGISTRATION SUBMISSION =====
Turnstile Token: [token-value]
Form Data: {...}
Note: Token must be verified server-side with secret key
=============================================
```

This helps developers verify the token is being captured correctly.

## Security Best Practices

1. **NEVER commit secret keys**
   - Use `.gitignore` for local `.env` files
   - Use CI/CD secret management for production

2. **Always verify server-side**
   - Frontend validation can be bypassed
   - Backend MUST verify token with Cloudflare

3. **Token is single-use**
   - Each token can only be verified once
   - Don't reuse tokens for multiple requests

4. **Handle token expiry**
   - Tokens expire after a few minutes
   - User must complete verification again if expired

5. **Rate limiting**
   - Implement rate limiting on backend endpoints
   - Turnstile helps but doesn't replace rate limiting

## Troubleshooting

### "Verification failed" error
- Check site key matches the one from Cloudflare dashboard
- Ensure domain is authorized in Cloudflare Turnstile settings
- Check browser console for JavaScript errors

### Backend verification always fails
- Verify secret key environment variable is set correctly
- Check secret key matches the site key being used
- Ensure you're using the correct endpoint URL
- Verify your server can make HTTPS requests to Cloudflare

### Widget not loading
- Check internet connectivity
- Verify site key is correct
- Check browser console for errors
- Ensure Turnstile scripts aren't blocked by ad blockers

## Support

For Cloudflare Turnstile documentation and support:
- https://developers.cloudflare.com/turnstile/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
