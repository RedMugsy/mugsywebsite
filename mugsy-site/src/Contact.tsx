import { useEffect, useRef, useState } from 'react'
import { initAntiSpam } from './lib/antiSpam'
import PhoneField, { type PhoneValue } from './components/PhoneField'
import { validateEmail, validateName, validatePhone, normalizePhone } from './lib/validators'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'

type Locale = 'en' | 'ar'
const PURPOSES = [
  'Partnership','Press/Media','Support','Security Disclosure','Legal/Compliance','Feature Request','Bug Report','Listing/Exchange','Investment/BD','Other'
] as const

function isWallet(v: string) {
  if (!v) return true
  return /^0x[a-fA-F0-9]{40}$/.test(v) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v)
}

export default function Contact() {
  const [locale, setLocale] = useState<Locale>('en')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  // Phone (split inputs)
  const [phone, setPhone] = useState<PhoneValue>({ country: 'lb', dialCode: '+961', national: '', e164: '' })
  const [purpose, setPurpose] = useState<typeof PURPOSES[number] | ''>('')
  const [otherReason, setOtherReason] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [wallet, setWallet] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittedId, setSubmittedId] = useState('')
  const [error, setError] = useState('')
  // Inline validation state (client-side)
  const [nameErr, setNameErr] = useState<string>('')
  const [emailErr, setEmailErr] = useState<string>('')
  const [phoneErr, setPhoneErr] = useState<string>('')
  const [nameTouched, setNameTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const phoneAnchorRef = useRef<HTMLDivElement | null>(null)

  // Anti-spam
  const [ts, setTs] = useState('')
  const [issuedSig, setIssuedSig] = useState('')
  const honeypotRef = useRef<HTMLInputElement | null>(null)
  useEffect(()=>{ setTs(String(Date.now())) },[])

  // Use mugsywebsite Railway app for contact forms
  const CONTACT_API = (import.meta as any).env?.VITE_CONTACT_API || 'https://mugsywebsite-production-b065.up.railway.app'
  const [csrf, setCsrf] = useState('')
  const [captcha, setCaptcha] = useState<any>(null)
  // PoW solution state
  const [powSolution, setPowSolution] = useState<number | null>(null)

  useEffect(()=>{
    (async () => {
      try {
        const a = await initAntiSpam(CONTACT_API, { computePow: false })
        setCsrf(a.csrf)
        setTs(String(a.issuedAt))
        setIssuedSig(String(a.issuedSig))
        setCaptcha(a.captcha)
        if (typeof a.powSolution === 'number') setPowSolution(a.powSolution)
      } catch {}
    })()
  }, [CONTACT_API])

  // Low-CPU path removed (not used)

  // Purpose -> Subject auto-sync with user override
  const SUBJECT_BY_PURPOSE: Record<string,string> = {
    'Support': 'Support request',
    'Partnership': 'Partnership inquiry',
    'Press/Media': 'Press / Media inquiry',
    'Security Disclosure': 'Security disclosure',
    'Legal/Compliance': 'Legal / Compliance inquiry',
    'Feature Request': 'Feature request',
    'Bug Report': 'Bug report',
    'Listing/Exchange': 'Listing / Exchange inquiry',
    'Investment/BD': 'Investment / Business development',
    'Other': ''
  }
  const [subjectTouched, setSubjectTouched] = useState(false)
  useEffect(()=>{
    if (!purpose) return
    if (purpose === 'Other') return
    if (!subjectTouched) setSubject(SUBJECT_BY_PURPOSE[purpose] || '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[purpose])

  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const t = (en: string, ar: string) => (locale==='ar'? ar : en)
  const LANG_OPTIONS: Array<{ code: string; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'Arabic' },
    { code: 'de', label: 'German' },
    { code: 'fr', label: 'French' },
    { code: 'it', label: 'Italian' },
    { code: 'es', label: 'Spanish' },
    { code: 'zh', label: 'Mandarin' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'hi', label: 'Indian' },
    { code: 'ru', label: 'Russian' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'South Korean' },
    { code: 'sw', label: 'Swahili' },
    { code: 'pl', label: 'Polish' },
  ]

  function validate(): string | null {
    // Name
    const nErr = validateName(name)
    setNameErr(nErr || '')
    // Email
    const eErr = validateEmail(email)
    setEmailErr(eErr || '')
    // Phone: validate if user typed any digits
    const rawPhone = `${phone.dialCode || ''}${(phone.national || '').replace(/\D+/g, '')}`
    const normalized = normalizePhone(rawPhone)
    const hasDigits = normalized.replace(/^\+/, '').length > 0
    const pRes = hasDigits ? validatePhone(rawPhone) : { error: null, normalized }
    setPhoneErr(pRes.error || '')
    
    if (nErr) return nErr
    if (eErr) return eErr
    if (pRes.error) return 'Phone must be digits only (optionally starting with +) and 6�15 digits long.'
    if (!purpose) return t('Please select a purpose','?????? ?????? ?????')
    if (purpose === 'Other' && !otherReason.trim()) return t('Please provide a reason for Other','???? ????? ??? ?????? ????')
    if (message.trim().length < 50 || message.trim().length > 3000) return t('Message must be 50-3000 characters','??? ?? ???? ??????? ??? 50 ? 3000 ???')
    if (!isWallet(wallet)) return t('Wallet address format not recognized','???? ????? ??? ??????')
    if (!consent) return t('You must agree to the Privacy Policy','??? ???????? ??? ????? ????????')
    if (file) {
      const allowed = ['application/pdf','image/png','image/jpeg','image/webp','text/plain']
      if (!allowed.includes(file.type)) return t('Attachment must be PDF/PNG/JPG/WEBP/TXT','????? ??? ?? ????')
      const maxMb = Number((import.meta as any).env?.VITE_MAX_UPLOAD_MB || 10)
      if (file.size > maxMb * 1024 * 1024) return t('Attachment too large','???? ??????') + ` (>${maxMb}MB)`
    }
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    // mark all fields touched so errors display
    setNameTouched(true); setEmailTouched(true); setPhoneTouched(true)
    const hp = honeypotRef.current?.value || ''
    if (hp) { setError('Spam detected.'); return }
    const err = validate()
    if (err) {
      // focus first invalid
      if (nameErr) nameRef.current?.focus()
      else if (emailErr) emailRef.current?.focus()
      else phoneAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setError(err)
      return
    }
    // Minimum dwell time heuristic (1.5s)
    if (ts && Date.now() - Number(ts) < 1500) { setError('Form submitted too quickly.'); return }

    setSubmitting(true)
    try {
      if (!captcha) throw new Error('Captcha not ready')
      const isPowType = (captcha as any)?.type === 'pow' || (captcha as any)?.type === 'altcha-pow'
      if (isPowType && typeof (captcha as any).difficulty === 'number' && powSolution == null) throw new Error('Solving captcha, please wait?')

      const body = {
        locale,
        name, email, company,
        // structured phone fields
        phoneCountry: phone.country.toUpperCase(),
        phoneDialCode: phone.dialCode,
        phoneNational: phone.national.replace(/\D+/g,''),
        phoneE164: phone.e164,
        purpose,
        otherReason: purpose==='Other' ? otherReason : undefined,
        subject,
        message,
        walletAddress: wallet,
        fileMeta: file ? { name: file.name, mime: file.type, size: file.size } : undefined,
        website: '',
        issuedAt: Number(ts),
        issuedSig,
        captcha: ((captcha as any)?.type === 'pow' || (captcha as any)?.type === 'altcha-pow')
          ? { type: 'pow', nonce: powSolution ?? '', token: (captcha as any).token }
          : ((captcha as any)?.type === 'turnstile')
            ? { type: 'turnstile', token: (captcha as any)?.token }
            : { type: 'image', nonce: (captcha as any)?.nonce, solution: '' },
      }
      const post = fetch(`${CONTACT_API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const delay = new Promise(r=>setTimeout(r, 500))
      const resp = await Promise.all([post, delay]).then(([r])=>r as Response)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Submit failed')
      setSubmittedId(String(data.requestId || ''))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e:any) {
      setError(e?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0a0b0f] text-slate-200" dir={dir}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-end mb-2 gap-3">
          <label className="text-sm text-slate-300" htmlFor="langSel">Language</label>
          <select
            id="langSel"
            className="bg-black/50 border border-white/10 rounded px-2 py-1 text-sm"
            value={locale}
            onChange={(e)=> setLocale(e.target.value as any)}
          >
            {LANG_OPTIONS.map(o=> <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </div>
        <h1 className="text-3xl font-extrabold text-white">{t('Contact Us','???? ???')}</h1>
        <p className="text-slate-400 mt-2">{t('We typically respond within 2-3 business days.','????? ?? ??? ???? 2-3 ???? ???.')}</p>

        {submittedId && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/60 p-4">
            <h2 className="text-xl font-bold text-white">{t('Thanks! We received your message.','?????! ?? ?????? ??????.')}</h2>
            <p className="mt-2 text-sm text-slate-300">{t('Your Request ID:','???? ?????:')} <span className="font-semibold">{submittedId}</span></p>
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={onSubmit} noValidate>
          <input type="text" name="website" ref={honeypotRef} className="hidden" tabIndex={-1} aria-hidden defaultValue="" />
          <input type="hidden" name="ts" value={ts} />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold">{t('Full Name','????? ??????')}</label>
              <input
                id="contact-name"
                ref={nameRef}
                className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2"
                value={name}
                onChange={e=>{ setName(e.target.value); if (nameTouched) setNameErr(validateName(e.target.value) || '') }}
                onBlur={e=>{ setNameTouched(true); setNameErr(validateName(e.target.value) || '') }}
                aria-invalid={!!nameErr}
                aria-describedby={nameErr ? 'contact-name-error' : undefined}
                autoComplete="name"
                required
              />
              {nameErr && nameTouched && (
                <p id="contact-name-error" role="alert" className="mt-1 text-xs text-[#ff8fa0]">
                  Name must be letters only (spaces, � and - allowed) and contain at least 3 letters.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold">{t('Email','?????? ??????????')}</label>
              <input
                id="contact-email"
                ref={emailRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2"
                value={email}
                onChange={e=>{ setEmail(e.target.value); if (emailTouched) setEmailErr(validateEmail(e.target.value) || '') }}
                onBlur={e=>{ setEmailTouched(true); setEmailErr(validateEmail(e.target.value) || '') }}
                aria-invalid={!!emailErr}
                aria-describedby={emailErr ? 'contact-email-error' : undefined}
                required
              />
              {emailErr && emailTouched && (
                <p id="contact-email-error" role="alert" className="mt-1 text-xs text-[#ff8fa0]">
                  Enter a valid email (e.g., name@domain.com).
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold">{t('Company/Project (optional)','??????/??????? (???????)')}</label>
              <input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={company} onChange={e=>setCompany(e.target.value)} />
            </div>
            <div ref={phoneAnchorRef}>
              <label className="block text-sm font-semibold">{t('Phone (optional)','?????? (???????)')}</label>
              <PhoneField
                value={phone}
                onChange={(v)=>{
                  setPhone(v)
                  if (phoneTouched) {
                    const raw = `${v.dialCode || ''}${(v.national || '').replace(/\D+/g,'')}`
                    const hasDigits = normalizePhone(raw).replace(/^\+/,'').length>0
                    const res = hasDigits ? validatePhone(raw) : { error: null }
                    setPhoneErr(res.error || '')
                    
                  }
                }}
              />
              <div className="sr-only" aria-live="polite">{phoneErr ? 'Phone invalid' : ''}</div>
              {phoneErr && phoneTouched && (
                <p id="contact-phone-error" role="alert" className="mt-1 text-xs text-[#ff8fa0]">
                  Phone must be digits only (optionally starting with +) and 6�15 digits long.
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold">{t('Purpose','?????')}</label>
              <select className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={purpose} onChange={e=>setPurpose(e.target.value as any)} required>
                <option value="">{t('Select...','????...')}</option>
                {PURPOSES.map(p=> <option key={p} value={p}>{t(p,p)}</option>)}
              </select>
              {purpose==='Other' && (
                <div className="mt-2">
                  <label className="block text-sm font-semibold">{t('Tell us more','?????? ??????')}</label>
                  <input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={otherReason} onChange={e=>setOtherReason(e.target.value)} placeholder={t('Reason for Other','??? ?????? ????')} />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold">{t('Subject','???????')}</label>
                <button type="button" className="text-xs underline text-slate-400 hover:text-slate-200" onClick={()=>{ setSubjectTouched(false); if (purpose!=='Other') setSubject(SUBJECT_BY_PURPOSE[purpose]||'') }}>
                  ? {t('Reset subject to purpose','???? ?????? ??????')}
                </button>
              </div>
              <input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={subject} onChange={e=>{ setSubject(e.target.value); if (!subjectTouched) setSubjectTouched(true) }} placeholder={t('Auto-suggested from Purpose','????? ????????')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold">{t('Message','???????')}</label>
            <textarea className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" rows={7} value={message} onChange={e=>setMessage(e.target.value)} placeholder={t('50-3000 characters','?? 50 ??? 3000 ???')} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold">{t('Wallet Address (optional)','????? (???????)')}</label>
              <input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={wallet} onChange={e=>setWallet(e.target.value)} placeholder="0x..." />
            </div>
            <div>
              <label className="block text-sm font-semibold">{t('File Attachment (optional)','???? (???????)')}</label>
              <div className="mt-1">
                <input id="fileHidden" type="file" accept=".pdf,image/png,image/jpeg,image/webp,text/plain" className="hidden" onChange={e=>setFile(e.target.files?.[0] || null)} />
                <button type="button" onClick={()=>document.getElementById('fileHidden')?.click()} className="rounded-md px-4 py-2 bg-[#00F0FF] text-black font-semibold disabled:opacity-60">{t('Upload document','????? ?????')}</button>
                <div role="status" className="mt-2 text-xs text-slate-400">
                  {file ? `${file.name} (${Math.ceil(file.size/1024)} KB)` : t('No file selected','?? ???? ?????')}
                  {file && (
                    <button type="button" className="ml-2 text-[#ff8fa0] underline" onClick={()=>setFile(null)}>� {t('Remove','????')}</button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">PDF/PNG/JPG/WEBP/TXT, = {(import.meta as any).env?.VITE_MAX_UPLOAD_MB || 10}MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} />
              <span>{t('I agree to the','????? ???')} <a href="/Public%20Documents/Privacy%20Policy.pdf" target="_blank" rel="noopener noreferrer" className="underline decoration-[#00F0FF]">{t('Privacy Policy','????? ????????')}</a></span>
            </label>
          </div>

          <HumanCheck
            apiBase={CONTACT_API}
            onReady={({ csrf, captcha, nonce })=>{ setCsrf(csrf); setCaptcha(captcha); setPowSolution(nonce) }}
          />

          {error && <p role="alert" className="text-[#ff8fa0] text-sm">{error}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={(() => {
                const c: any = captcha || {}
                const isPow = c?.type==='pow' || c?.type==='altcha-pow'
                const isTurnstile = c?.type==='turnstile'
                const clientInvalid = !!(validateName(name) || validateEmail(email) || (normalizePhone(`${phone.dialCode||''}${(phone.national||'').replace(/\D+/g,'')}`).replace(/^\+/, '').length>0 && validatePhone(`${phone.dialCode||''}${(phone.national||'').replace(/\D+/g,'')}`).error))
                const hasCaptcha = !!captcha && (isPow ? powSolution!=null : isTurnstile ? !!c?.token : true)
                return submitting || !hasCaptcha || clientInvalid
              })()}
              className="btn-neo px-6 py-3 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              title={(() => {
                const c: any = captcha || {}
                const isPow = c?.type==='pow' || c?.type==='altcha-pow'
                const isTurnstile = c?.type==='turnstile'
                const has = !!captcha && (isPow ? powSolution!=null : isTurnstile ? !!c?.token : true)
                return has ? '' : t("Please verify you're human",'????? ??? ?? ?????')
              })()}
            >
              {submitting ? t('Submitting...','???? ???????...') : t('Submit','?????')}
            </button>
            <a href="mailto:contact@redmugsy.com" className="btn-ghost btn-ghost--red px-6 py-3 text-sm">{t('Or email us','?? ?????? ???????')}</a>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  )
}

// Visible human-check over PoW
function HumanCheck({ apiBase, onReady }:{ apiBase: string; onReady: (v:{ csrf: string; captcha: any; nonce: number|null })=>void }) {
  const [state, setState] = useState<'idle'|'issuing'|'solving'|'verified'|'expired'|'error'>('idle')
  const [msg, setMsg] = useState('')
  const [checked, setChecked] = useState(false)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<any>(null)
  const sitekey = (import.meta as any).env?.VITE_TURNSTILE_SITEKEY || ''

  async function begin() {
    setState('issuing'); setMsg('Issuing challenge...')
    try {
      const a = await initAntiSpam(apiBase, { computePow: false })
      const ctype = String((a.captcha as any)?.type || '')
      const isPow = ctype === 'pow' || ctype === 'altcha-pow'
      const isTurn = ctype === 'turnstile'
      if (isPow && typeof (a.captcha as any).difficulty === 'number' && (a.captcha as any).prefix) {
        setState('solving'); setMsg('Verifying�')
        const start = performance.now()
        // Solve on main thread (worker optional)
        const { solvePow } = await import('./lib/pow')
        const n = await solvePow((a.captcha as any).prefix, (a.captcha as any).difficulty)
        const ms = performance.now() - start
        if (Date.now() > Number((a.captcha as any).expiresAt || 0)) { setState('expired'); setMsg('Challenge expired. Please retry.'); setChecked(false); return }
        setState('verified'); setMsg(`Verified in ${Math.round(ms)} ms`)
        onReady({ csrf: a.csrf, captcha: { ...(a.captcha as any), type: 'pow', token: (a as any).captcha?.token }, nonce: n })
      } else if (isTurn) {
        setMsg('Solve the captcha')
        const ensureTurnstile = async (): Promise<any> => {
          const w: any = window as any
          if (w && w.turnstile && typeof w.turnstile.render === 'function') return w.turnstile
          await new Promise(res => setTimeout(res, 100))
          return ensureTurnstile()
        }
        const t = await ensureTurnstile()
        if (widgetIdRef.current) {
          try { t.reset(widgetIdRef.current) } catch {}
        }
        const id = t.render(widgetRef.current!, {
          sitekey,
          theme: 'dark',
          callback: (token: string) => {
            setState('verified'); setMsg('Verified')
            onReady({ csrf: a.csrf, captcha: { type: 'turnstile', token }, nonce: null })
          },
          'expired-callback': () => {
            setState('expired'); setMsg('Expired. Please verify again.')
            onReady({ csrf: a.csrf, captcha: { type: 'turnstile' }, nonce: null })
          },
          'error-callback': () => {
            setState('error'); setMsg('Captcha error. Please retry.')
          },
        })
        widgetIdRef.current = id
        onReady({ csrf: a.csrf, captcha: { type: 'turnstile' }, nonce: null })
      } else {
        setState('verified'); setMsg('Verified')
        onReady({ csrf: a.csrf, captcha: a.captcha, nonce: null })
      }
    } catch (e:any) {
      setState('error'); setMsg(e?.message || 'Failed to verify')
      setChecked(false)
    }
  }

  useEffect(()=>{
    let t: any
    if (state==='verified') {
      // auto-expire in 2 minutes to match server default (configurable)
      t = setTimeout(()=>{ setState('expired'); setMsg('Expired. Please verify again.'); setChecked(false) }, 120000)
    }
    return ()=>{ if (t) clearTimeout(t) }
  },[state])

  return (
    <div className="rounded-lg border border-white/10 p-3 text-sm">
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={checked} disabled={state==='issuing' || state==='solving' || state==='verified'} onChange={e=>{ const v=e.target.checked; setChecked(v); if (v) begin() }} />
        <span>{state==='verified' ? '? Verified' : 'I am human'}</span>
      </label>
      <div aria-live="polite" className="text-xs text-slate-400 mt-1">{msg}</div>
      <div ref={widgetRef} className="mt-2"></div>
      {state==='expired' && (
        <button type="button" className="mt-2 text-xs underline text-[#00F0FF]" onClick={()=>{ setState('idle'); setMsg(''); setChecked(false) }}>Re-issue</button>
      )}
    </div>
  )
}

















