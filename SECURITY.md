## ALTCHA PoW Integration (Self‑Hosted)

This site uses a self‑hosted proof‑of‑work (PoW) challenge for Contact submissions — no third‑party CAPTCHA vendors.

### Flow (high‑level)

1) Client requests a challenge: `GET /api/contact/captcha`
   - Server generates payload: `{ prefix, difficulty, issuedAt, expiresAt, resourceId, ipHint, uaHash }`
   - Signs token = `HMAC_SHA256(ALTCHA_SECRET, JSON.stringify(payload))` (base64url)
   - Stores `altcha:issued:{resourceId}` and `altcha:token:{token}` in Redis with TTL
   - Responds: `{ type:'altcha-pow', prefix, difficulty, resourceId, issuedAt, expiresAt, token }`

2) Client solves PoW in a Web Worker
   - Finds `nonce` such that `sha256(prefix + nonce)` has ≥ `difficulty` leading zero bits
   - UI stays responsive; accessible status messaging provided

3) Client submits the form: `POST /api/contact/submit`
   - Body includes `captcha: { nonce, token }`, `ts` (timestamp), and form fields
   - Server verifies:
     - CSRF, timestamp window (≥2s, ≤20m), IP and email rate limits
     - Token signature + expiry
     - Bind to IP (masked /24 or /64) and `uaHash` (best effort)
     - Replay: resourceId must be "issued", then consumed
     - PoW: leading‑zero check passes
   - On pass: persists submission and returns `{ requestId }`

### Threat Model

- Replay attacks: prevented by token/resourceId single‑use and TTL
- Token forgery: prevented by HMAC over payload with `ALTCHA_SECRET`
- Off‑origin posts: CSRF protection + CORS lock
- Bot farms: PoW + IP/email rate limits + IP/UA binding + honeypot/timestamp
- Accessibility: text‑only fallback challenge (no images) available
- Privacy: No external CAPTCHA scripts, no trackers

### Diagrams

```
Client                     API (Server)
  |   GET /captcha            |
  |-------------------------->|
  |   {prefix,diff,token}     |
  |<--------------------------|
  |  (solve PoW in worker)    |
  |   POST /submit            |
  |   { nonce, token, ... }   |
  |-------------------------->|
  |   201 { requestId }       |
  |<--------------------------|
```

### Env

- `ALTCHA_SECRET`, `ALTCHA_DEFAULT_DIFFICULTY`, `ALTCHA_EXPIRY_SECONDS`
- `RATE_IP_PER_MIN`, `RATE_IP_PER_DAY`, `RATE_EMAIL_PER_HOUR`

