Red Mugsy — Deployment Guide

This guide walks you through launching the site on your domain (purchased on GoDaddy). Pick a hosting option for the static frontend and one for the Node.js API.

Overview
- Frontend (static): mugsy-site (Vite + React) → host on Netlify, Vercel, or Cloudflare Pages
- Backend API: contact-api (Node.js + Express) → host on Render, Railway, Fly.io, or a VPS
- Domain: managed on GoDaddy — update DNS to point to your hosts

What You’ll Need
- GoDaddy account access (to update DNS)
- A hosting account (Netlify/Vercel/Cloudflare for frontend; Render/Railway/Fly/your VPS for backend)
- Backend environment variables (see below)
- Frontend environment variables (see below)

Frontend (mugsy-site)
1) Environment
   Create mugsy-site/.env.production with the following keys:
   - VITE_API_BASE=           # leave empty if using same-origin proxy; else https://api.redmugsy.com
   - VITE_TURNSTILE_SITEKEY=  # Cloudflare Turnstile site key (prod)
   - VITE_FEATURE_CLAIM=false # or true if launching the claim page
   - VITE_CLAIM_CONTRACT=     # 0x… (if claim enabled)
   - VITE_CLAIM_CHAIN_ID=     # e.g., 1 (Ethereum), 8453 (Base)
   - VITE_CLAIM_RPC_URL=      # public RPC; required if claim enabled
   - VITE_MAX_UPLOAD_MB=10
   - VITE_GA_ID=              # optional; Google Analytics 4 ID

2) Build locally
   cd mugsy-site
   npm ci
   npm run build
   # Output: mugsy-site/dist

3) Host options
   - Netlify: New Site → Build command: "npm run build"; Publish dir: "mugsy-site/dist"; Base dir: "mugsy-site".
   - Vercel: Import → Framework: Vite; Root directory: mugsy-site; Build: npm run build; Output: dist.
   - Cloudflare Pages: Project root: mugsy-site; Build command: npm run build; Output: dist.

4) Rewrites (SPA + API proxy)
   Ensure SPA fallback and /api proxy to backend:
   - Netlify _redirects example (put in mugsy-site/_redirects):
     /*                /index.html   200
     /api/*            https://api.redmugsy.com/:splat   200

   - Vercel vercel.json example (put in mugsy-site/vercel.json):
     {
       "rewrites": [
         { "source": "/api/:path*", "destination": "https://api.redmugsy.com/:path*" }
       ]
     }

Backend (contact-api)
1) Environment (.env)
   - PORT=4000
   - APP_BASE_URL=https://redmugsy.com       # Frontend origin for CORS
   - SESSION_SECRET=your-strong-secret
   - SMTP_HOST=…
   - SMTP_PORT=587
   - SMTP_USER=…
   - SMTP_PASS=…
   - SMTP_FROM="Red Mugsy <no-reply@redmugsy.com>"
   - CAPTCHA_PROVIDER=turnstile
   - TURNSTILE_SECRET=…                      # Cloudflare Turnstile secret key
   - FEATURE_CLAIM=false                     # or true, plus rate limits
   - RATE_LIMIT_PER_MINUTE=5
   - RATE_LIMIT_PER_DAY=50
   - RATE_EMAIL_PER_HOUR=3
   - MAX_UPLOAD_MB=10
   - ALLOWED_UPLOAD_MIME=application/pdf,image/png,image/jpeg,image/webp,text/plain
   - (Optional) REDIS_URL=…                  # enables stronger rate-limiting/session cache

2) Build & run
   cd contact-api
   npm ci
   npm run build
   npm start  # serves on PORT

3) Hosted options
   - Render: New Web Service → Build: npm run build, Start: npm start
   - Railway/Fly.io: similar (Docker optional)
   - VPS (Nginx reverse proxy): point /api to http://127.0.0.1:4000

DNS (GoDaddy)
1) Frontend host
   - If Netlify: add a CNAME for "www" to your Netlify subdomain. Set root A record via Netlify DNS or ANAME/ALIAS if supported. Enable HTTPS.
   - If Vercel: add domain; Vercel provides CNAME/A/AAAA targets. Enable HTTPS.
   - If Cloudflare Pages: set CNAME, enable SSL.

2) Backend host (optional custom api subdomain)
   - Add A/AAAA or CNAME for api.redmugsy.com to your backend provider.
   - Update frontend rewrite target to https://api.redmugsy.com.

Go‑Live Checklist
- Frontend renders at https://redmugsy.com and https://www.redmugsy.com
- /api/geo, /api/contact/csrf, /api/contact health check OK from the browser
- Contact form end‑to‑end: captcha verifies, emails send/receive
- Footer/legal links open
- Cookie pages display
- HTTPS and redirects (http→https, apex→www or vice versa) working
- Performance: fast on mobile (Lighthouse acceptable)

Notes
- Language selector is currently hidden per request; translations default to English.
- When ready, re‑enable translations and QA coverage before exposing.

