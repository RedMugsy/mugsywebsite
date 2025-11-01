import { useEffect, useMemo, useRef, useState } from 'react'
import countriesData from '../data/countries.json'
import { isoToFlag } from '../utils/flags'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

type Country = { iso2: string; name: string; dialCode: string; alt?: string[] }

export type PhoneValue = {
  country: string
  dialCode: string
  nationalNumber: string
  phoneE164: string
}

export function PhoneInput({ value, onChange, label = 'Phone (optional)' }: {
  value: PhoneValue
  onChange: (v: PhoneValue, err?: string) => void
  label?: string
}) {
  const countries = countriesData as Country[]
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)
  const itemHeight = 36
  const viewport = 240

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return countries
    return countries.filter(c =>
      c.name.toLowerCase().includes(s) ||
      (c.alt || []).some(a => a.toLowerCase().includes(s)) ||
      c.iso2.toLowerCase() === s ||
      c.dialCode.replace('+','').startsWith(s.replace('+',''))
    )
  }, [q, countries])

  const [scrollTop, setScrollTop] = useState(0)
  const total = filtered.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 6)
  const endIndex = Math.min(filtered.length, Math.ceil((scrollTop + viewport) / itemHeight) + 6)
  const slice = filtered.slice(startIndex, endIndex)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const onScroll = () => setScrollTop(el.scrollTop)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function setCountry(iso2: string) {
    const c = countries.find(x => x.iso2 === iso2)
    if (!c) return
    const nn = value.nationalNumber.replace(/\D+/g, '')
    const ph = nn ? parsePhoneNumberFromString(nn, iso2 as any) : null
    const e164 = ph && ph.isValid() ? ph.number : ''
    const next: PhoneValue = { country: iso2, dialCode: c.dialCode, nationalNumber: nn, phoneE164: e164 }
    onChange(next, nn && !e164 ? `Invalid format for ${c.name}` : '')
  }

  function setNN(nnRaw: string) {
    const nn = nnRaw.replace(/\D+/g, '')
    const ph = nn ? parsePhoneNumberFromString(nn, value.country as any) : null
    const e164 = ph && ph.isValid() ? ph.number : ''
    const next: PhoneValue = { ...value, nationalNumber: nn, phoneE164: e164 }
    const c = countries.find(x => x.iso2 === value.country)
    onChange(next, nn && !e164 ? `Invalid format for ${c?.name || value.country}` : '')
  }

  return (
    <div>
      <label className="block text-sm font-semibold">{label}</label>
      <div className="mt-1 grid grid-cols-[auto_auto_1fr] gap-2 items-center">
        <button type="button" className="rounded-lg bg-black/50 border border-white/10 px-3 py-2 min-w-16" aria-label={`Selected ${value.country}`} title={value.country} onClick={()=>setOpen(v=>!v)}>
          <span className="text-lg leading-none">{isoToFlag(value.country)}</span>
        </button>
        <input className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 w-24 text-slate-400" value={value.dialCode} disabled readOnly />
        <input className="rounded-lg bg-black/50 border border-white/10 px-3 py-2" inputMode="numeric" autoComplete="tel-national" value={value.nationalNumber} onChange={e=>setNN(e.target.value)} placeholder="National number" />
      </div>
      {open && (
        <div className="relative mt-2">
          <div className="absolute z-40 w-72 rounded-xl border border-white/10 bg-black/90 backdrop-blur p-2">
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search country or +code" className="w-full rounded-md bg-black/60 border border-white/10 px-3 py-2 text-sm mb-2" />
            <div ref={listRef} className="overflow-auto" style={{ maxHeight: viewport }} role="listbox" aria-label="Countries">
              <div style={{ height: total, position: 'relative' }}>
                {slice.map((c, i) => {
                  const idx = startIndex + i
                  return (
                    <button key={c.iso2} type="button" onClick={()=>{ setCountry(c.iso2); setOpen(false) }} className="absolute left-0 right-0 flex items-center gap-2 px-2 py-2 hover:bg-white/10 rounded-md" style={{ top: idx * itemHeight }} aria-label={`${c.name} ${c.dialCode}`} title={`${c.name} ${c.dialCode}`}>
                      <span className="text-lg leading-none">{isoToFlag(c.iso2)}</span>
                      <span className="text-xs text-slate-400">{c.dialCode}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


