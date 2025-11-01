// Cookie Consent utilities for Red $Mugsy
// Stores a JSON string in cookie name: mugsy_cookie_consent

export type Consent = {
  essential: true
  analytics: boolean
  functional: boolean
}

const COOKIE_NAME = 'mugsy_cookie_consent'

function getDomainForCookie() {
  if (typeof window === 'undefined') return undefined
  const host = window.location.hostname
  if (host.endsWith('redmugsy.com')) return '.redmugsy.com'
  return undefined // avoid domain attr on localhost/dev
}

export function daysFromNow(days: number) {
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  return d
}

export function readConsentCookie(): Consent | null {
  if (typeof document === 'undefined') return null
  const raw = document.cookie.split('; ').find((r) => r.startsWith(COOKIE_NAME + '='))
  if (!raw) return null
  try {
    const val = decodeURIComponent(raw.split('=')[1])
    const parsed = JSON.parse(val)
    if (parsed && typeof parsed === 'object') {
      return {
        essential: true,
        analytics: !!parsed.analytics,
        functional: !!parsed.functional,
      }
    }
  } catch (_) {
    return null
  }
  return null
}

export function setConsentCookie(preferences: Consent) {
  if (typeof document === 'undefined') return
  const value = encodeURIComponent(JSON.stringify(preferences))
  const expires = daysFromNow(365).toUTCString()
  const parts = [
    `${COOKIE_NAME}=${value}`,
    `Expires=${expires}`,
    'Path=/',
    'SameSite=Lax',
  ]
  const dom = getDomainForCookie()
  if (dom) parts.push(`Domain=${dom}`)
  if (window.location.protocol === 'https:') parts.push('Secure')
  document.cookie = parts.join('; ')
}

export function checkCookieConsent(): Consent | null {
  return readConsentCookie()
}

export function setCookieConsent(prefs: { analytics: boolean; functional: boolean }) {
  const consent: Consent = { essential: true, analytics: !!prefs.analytics, functional: !!prefs.functional }
  setConsentCookie(consent)
  if (consent.analytics) loadAnalytics()
}

export function shouldShowBanner(): boolean {
  return !checkCookieConsent()
}

// Google Analytics loader (only runs if consent.analytics = true)
export function loadAnalytics() {
  if (typeof window === 'undefined') return
  // Prevent duplicate injection
  if ((window as any)._mugsyGAInjected) return
  const GA_ID = (import.meta as any).env?.VITE_GA_ID || 'G-XXXXXXXXXX'
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return // no ID provided

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  ;(window as any).dataLayer = (window as any).dataLayer || []
  function gtag(...args: any[]) { ;(window as any).dataLayer.push(args) }
  ;(window as any).gtag = gtag
  gtag('js', new Date())
  gtag('config', GA_ID, { anonymize_ip: true, cookie_flags: 'SameSite=None;Secure' })
  ;(window as any)._mugsyGAInjected = true
}

export function savePreferences(_essential: boolean, analytics: boolean, functional: boolean) {
  // essential is always true logically
  setCookieConsent({ analytics, functional })
}
