import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCountries,
  getCountryCallingCode,
  AsYouType,
  isValidPhoneNumber,
} from 'libphonenumber-js'

export type PhoneValue = {
  country: string // 'lb'
  dialCode: string // '+961'
  national: string // formatted national number
  e164: string // '+96170123456'
}

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })
// Remove Ascension Island (AC) from the selectable list
const BASE_CODES = getCountries().filter((CC) => CC.toUpperCase() !== 'AC')
const COUNTRIES = BASE_CODES.map((CC) => {
  const codeLower = CC.toLowerCase()
  const dial = '+' + getCountryCallingCode(CC)
  const name = displayNames.of(CC) || CC
  return { code: codeLower, dial, name }
})

export default function PhoneField({
  value,
  onChange,
}: {
  value?: PhoneValue
  onChange: (v: PhoneValue, valid: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [preferred, setPreferred] = useState<string | null>(null)
  const didAutoSelect = useRef(false)

  const current =
    COUNTRIES.find((c) => c.code === (value?.country || 'lb')) ||
    COUNTRIES.find((c) => c.code === 'lb')!

  function select(code: string) {
    const c = COUNTRIES.find((x) => x.code === code)!
    const digits = (value?.national || '').replace(/\D+/g, '')
    const formatted = new AsYouType(code.toUpperCase() as any).input(digits)
    const e164 = c.dial + digits
    onChange(
      { country: c.code, dialCode: c.dial, national: formatted, e164 },
      isValidPhoneNumber(e164)
    )
    setOpen(false)
  }

  function handleInput(n: string) {
    const digits = n.replace(/\D+/g, '')
    const formatted = new AsYouType(current.code.toUpperCase() as any).input(digits)
    const e164 = current.dial + digits
    onChange(
      {
        country: current.code,
        dialCode: current.dial,
        national: formatted,
        e164,
      },
      isValidPhoneNumber(e164)
    )
  }

  const list = useMemo(() => {
    const f = q.trim().toLowerCase()
    const base = !f ? COUNTRIES : COUNTRIES.filter((c) =>
      c.code.includes(f) ||
      c.dial.replace('+','').includes(f.replace('+','')) ||
      (c.name || '').toLowerCase().includes(f)
    )
    if (!preferred) return base
    const p = base.find(c => c.code === preferred)
    if (!p) return base
    return [p, ...base.filter(c => c.code !== preferred)]
  }, [q, preferred])

  useEffect(() => {
    // Try to detect country from backend (IP-based) and prioritize it in the list
    let cancelled = false
    fetch('/api/geo', { headers: { 'Accept': 'application/json' } })
      .then(async r => {
        const ct = r.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return null
        return r.json()
      })
      .then(j => {
        if (cancelled || !j) return
        const iso = String(j.country || '').toLowerCase()
        if (iso && COUNTRIES.some(c => c.code === iso)) setPreferred(iso)
        // Auto-select detected country once if user hasn't typed/changed yet
        const hasUserInput = !!(value?.national && value.national.trim())
        const isDefault = (value?.country || 'lb') === 'lb'
        if (!didAutoSelect.current && iso && isDefault && !hasUserInput) {
          didAutoSelect.current = true
          // Reuse selection logic to set dial code and formatted national
          const c = COUNTRIES.find(x => x.code === iso)
          if (c) {
            const digits = (value?.national || '').replace(/\D+/g, '')
            const formatted = new AsYouType(iso.toUpperCase() as any).input(digits)
            const e164 = c.dial + digits
            onChange(
              { country: c.code, dialCode: c.dial, national: formatted, e164 },
              isValidPhoneNumber(e164)
            )
          }
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [value?.country, value?.national, onChange])

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 border border-white/10 rounded px-2 py-2 bg-black/50"
          aria-label={`Country ${current.code.toUpperCase()} ${current.dial}`}
          title={`${current.code.toUpperCase()} ${current.dial}`}
        >
          <span className={`fi fi-${current.code} w-[20px] h-[15px] rounded`} />
          <span className="uppercase">{current.code}</span>
        </button>

        <input
          className="border border-white/10 rounded px-3 py-2 w-20 text-center bg-black/40 text-slate-300"
          value={current.dial}
          readOnly
        />

        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          className="flex-1 border border-white/10 rounded px-3 py-2 bg-black/50"
          placeholder="Phone number"
          value={value?.national || ''}
          onChange={(e) => handleInput(e.target.value)}
        />
      </div>

      {open && (
        <div className="border border-white/10 rounded max-h-72 overflow-auto p-2 bg-black/70 backdrop-blur">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ISO, +code, or country"
            className="mb-2 w-full border border-white/10 rounded px-3 py-2 bg-black/50"
          />
          <div className="flex flex-col gap-1">
            {list.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => select(c.code)}
                className="flex items-center gap-2 border border-white/10 rounded px-2 py-2 hover:bg-white/5 text-left"
                aria-label={`${c.name} ${c.dial}`}
                title={`${c.name} ${c.dial}`}
              >
                <span className={`fi fi-${c.code} w-[20px] h-[15px] rounded`} />
                <span className="uppercase">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


