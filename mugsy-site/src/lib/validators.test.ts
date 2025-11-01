import { describe, it, expect } from 'vitest'
import { validateEmail, validatePhone, validateName, normalizePhone } from './validators'

describe('validateEmail', () => {
  it('accepts common valid emails', () => {
    expect(validateEmail('a.b+tag@domain.co')).toBeNull()
    expect(validateEmail('first_last@sub.domain.info')).toBeNull()
  })
  it('trims whitespace', () => {
    expect(validateEmail('  user@example.com  ')).toBeNull()
  })
  it('rejects invalid formats', () => {
    for (const v of ['user@', '@domain.com', 'user@domain', 'user@@domain.com', 'user domain.com']) {
      expect(validateEmail(v)).not.toBeNull()
    }
  })
})

describe('validatePhone', () => {
  it('normalizes separators and validates length', () => {
    const r = validatePhone('(070) 123-456')
    expect(r.error).toBeNull()
    expect(normalizePhone('(070) 123-456')).toBe('070123456')
  })
  it('accepts optional leading +', () => {
    expect(validatePhone('+96170123456').error).toBeNull()
  })
  it('rejects letters and bad plus usage', () => {
    expect(validatePhone('07012A456').error).not.toBeNull()
    expect(validatePhone('++70123456').error).not.toBeNull()
  })
  it('enforces 6-15 digits', () => {
    expect(validatePhone('123').error).not.toBeNull()
  })
})

describe('validateName', () => {
  it('accepts accents/apostrophes/hyphens/spaces', () => {
    expect(validateName('Ali')).toBeNull()
    expect(validateName('Jean-Paul')).toBeNull()
    expect(validateName("O’Connor")).toBeNull()
    expect(validateName('Ana María')).toBeNull()
  })
  it('rejects digits and requires ≥3 letters', () => {
    expect(validateName('Al')).not.toBeNull()
    expect(validateName('J0hn')).not.toBeNull()
    expect(validateName('--')).not.toBeNull()
    expect(validateName('A-')).not.toBeNull()
    expect(validateName('A B')).not.toBeNull()
    expect(validateName('A Bc')).toBeNull()
  })
})

