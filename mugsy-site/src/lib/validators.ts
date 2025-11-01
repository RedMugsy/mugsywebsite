// Simple, pragmatic validators shared by the app
// Keep messages concise and ARIA-friendly

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(inputRaw: string): string | null {
  const input = (inputRaw ?? '').trim()
  if (!input) return 'Enter a valid email (e.g., name@domain.com).'
  if (!EMAIL_RE.test(input)) return 'Enter a valid email (e.g., name@domain.com).'
  return null
}

// Normalize phone: keep digits and a single leading +
export function normalizePhone(raw: string): string {
  const input = (raw ?? '').trim()
  // remove everything except digits and +
  const kept = input.replace(/[^\d+]/g, '')
  // If multiple pluses, keep only the first if it is leading
  const hasLeadingPlus = kept.startsWith('+')
  const digitsOnly = kept.replace(/\+/g, '')
  return (hasLeadingPlus ? '+' : '') + digitsOnly
}

const PHONE_RE = /^\+?\d{6,15}$/

export function validatePhone(raw: string): { error: string | null; normalized: string } {
  const normalized = normalizePhone(raw)
  if (!normalized) {
    return { normalized, error: 'Phone must be digits only (optionally starting with +) and 6–15 digits long.' }
  }
  if (!PHONE_RE.test(normalized)) {
    return { normalized, error: 'Phone must be digits only (optionally starting with +) and 6–15 digits long.' }
  }
  return { normalized, error: null }
}

export const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/
const LETTER_COUNT_RE = /[A-Za-zÀ-ÖØ-öø-ÿ]/g

export function validateName(inputRaw: string): string | null {
  const input = (inputRaw ?? '').trim()
  if (!input) return "Name must be letters only (spaces, ’ and - allowed) and contain at least 3 letters."
  if (!NAME_RE.test(input)) return "Name must be letters only (spaces, ’ and - allowed) and contain at least 3 letters."
  const letters = (input.match(LETTER_COUNT_RE) ?? []).length
  if (letters < 3) return "Name must be letters only (spaces, ’ and - allowed) and contain at least 3 letters."
  return null
}

