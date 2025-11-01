# Integration Guide

This package provides both plain HTML/JS and React integration.

## Plain HTML/JS

1. Add CSS in your base layout:

   <link rel="stylesheet" href="/path/to/css/cookie-consent.css">

2. Add JS before </body>:

   <script src="/path/to/js/cookie-consent.js"></script>
   <script src="/path/to/js/cookie-banner.js"></script>

3. Paste banner HTML (from html/cookie-banner.html) into your base layout, just before </body>.

4. Create cookie preference and policy pages using `html/cookie-preferences.html` and `html/cookie-policy.html`.

5. Replace GA ID in `js/cookie-consent.js` if you plan to use GA.

## React (existing Vite app)

Already wired in this repo:
- Banner component: `mugsy-site/src/components/CookieBanner.tsx`
- Utils: `mugsy-site/src/utils/cookieConsent.ts`
- Pages: `mugsy-site/src/CookiePreferences.tsx`, `mugsy-site/src/CookiePolicy.tsx`
- Router: `mugsy-site/src/main.tsx` includes routes and conditional GA load.

Steps if reusing elsewhere:
- Mount `<CookieBanner />` near the root so it appears on all routes.
- Add routes for `/cookie-preferences` and `/cookie-policy`.
- Set `VITE_GA_ID` in your environment to enable conditional GA loading.

## Notes
- Consent cookie name: `mugsy_cookie_consent`
- Format: {"essential":true,"analytics":bool,"functional":bool}
- Expiry: 365 days, Path=/, SameSite=Lax, Secure on HTTPS

