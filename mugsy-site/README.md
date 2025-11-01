% Mugsy Site Frontend

Vite + React frontend for Red $Mugsy, including Contact form, Admin view, Privacy and Cookie pages.

## Environment

Create `.env` from `.env.example` and set:

- `VITE_API_BASE` – Base URL of the Contact API, e.g. `http://localhost:4000`
- `VITE_CAPTCHA_PROVIDER` – `pow|image|none` (UI hint only)
 - `VITE_TURNSTILE_SITEKEY` – Cloudflare Turnstile sitekey (when Turnstile is enabled on backend)

## Routes

- `/` — Landing site
- `/contact` — Contact form (fetches CSRF, timestamp HMAC, captcha; solves PoW when enabled)
- `/admin` — Minimal admin (request magic link; list submissions; update status; add notes; reply)
- `/cookie-preferences`, `/cookie-policy` — Cookie controls
- `/privacy-request` — Privacy request form

## Dev

- Run backend first (see `contact-api/`)
- Then run frontend: `npm run dev`
- Ensure `VITE_API_BASE` points to the backend origin; frontend sends credentials for session cookies.

## Anti‑spam integration (client)

You can initialize CSRF, timestamp/HMAC, and captcha with a single helper:

```
import { initAntiSpam } from './lib/antiSpam'

const API = import.meta.env.VITE_API_BASE
const a = await initAntiSpam(API, { computePow: true })
// a.csrf, a.issuedAt, a.issuedSig, a.captcha, a.powSolution

await fetch(`${API}/api/contact`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-csrf-token': a.csrf },
  credentials: 'include',
  body: JSON.stringify({
    issuedAt: a.issuedAt,
    issuedSig: a.issuedSig,
    captcha: { nonce: a.captcha.nonce, solution: a.powSolution ?? '' },
    // ...other form fields
  })
})
```
