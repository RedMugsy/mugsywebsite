import { useMemo, useState } from 'react'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'

type Check = Record<string, boolean>

const REQUEST_GROUPS: { title: string; items: { key: string; label: string }[] }[] = [
  {
    title: 'Access & Transparency',
    items: [
      { key: 'access', label: 'Right to Access' },
      { key: 'portability', label: 'Data Portability' },
    ],
  },
  {
    title: 'Correction',
    items: [{ key: 'correction', label: 'Right to Correction' }],
  },
  {
    title: 'Deletion',
    items: [
      { key: 'deletion', label: 'Right to Deletion' },
      { key: 'deletionMinor', label: 'Deletion for Minors' },
    ],
  },
  {
    title: 'Consent & Preferences',
    items: [
      { key: 'withdrawConsent', label: 'Withdraw Consent' },
      { key: 'doNotSellShare', label: 'Do Not Sell/Share' },
      { key: 'limitSensitive', label: 'Limit Sensitive Data' },
      { key: 'optOutMarketing', label: 'Opt-Out of Marketing' },
    ],
  },
  {
    title: 'Objection & Restriction',
    items: [{ key: 'objectProcessing', label: 'Object to Processing' }],
  },
  {
    title: 'Appeal & Other',
    items: [
      { key: 'appeal', label: 'Appeal a Previous Denial' },
      { key: 'other', label: 'Other (specify)' },
    ],
  },
]

const DATA_GROUPS: { title: string; items: { key: string; label: string }[] }[] = [
  {
    title: 'Account & Profile',
    items: [
      { key: 'accountProfile', label: 'Account profile' },
      { key: 'accountDeletion', label: 'Account deletion / deactivation' },
    ],
  },
  {
    title: 'Comms & Subscriptions',
    items: [
      { key: 'commsNewsletter', label: 'Newsletter subscription history' },
      { key: 'commsEmails', label: 'Email communication history' },
      { key: 'commsMarketing', label: 'Marketing messages & promos' },
    ],
  },
  {
    title: 'Support & Forms',
    items: [
      { key: 'supportForms', label: 'Contact form submissions' },
      { key: 'supportTickets', label: 'Support tickets' },
    ],
  },
  {
    title: 'Crypto & Blockchain',
    items: [
      { key: 'cryptoWallet', label: 'Wallet address (if connected)' },
      { key: 'cryptoAirdrop', label: 'Airdrop/whitelist & claim records' },
      { key: 'cryptoReferral', label: 'Referral / affiliate data' },
      { key: 'cryptoTx', label: 'Token transaction records' },
    ],
  },
  {
    title: 'Transactions & Payments',
    items: [
      { key: 'txOrders', label: 'Merch orders & purchase history' },
      { key: 'txPaymentConfirm', label: 'Payment confirmations (Stripe/PayPal)' },
    ],
  },
  {
    title: 'Technical & Behavioral',
    items: [
      { key: 'techAnalytics', label: 'Website analytics' },
      { key: 'techCookies', label: 'Cookies & tracking data' },
      { key: 'techFingerprint', label: 'Device/browser fingerprint' },
      { key: 'techIPGeo', label: 'IP address & geolocation' },
    ],
  },
  {
    title: 'Community & Third-Party',
    items: [
      { key: 'communityDiscord', label: 'Discord bot interactions' },
      { key: 'communityTelegram', label: 'Telegram bot interactions' },
      { key: 'communityGA', label: 'Google Analytics data' },
      { key: 'communityOther', label: 'Other third-party platform data' },
    ],
  },
  {
    title: 'All Data',
    items: [{ key: 'allData', label: 'I want ALL personal data' }],
  },
]

export default function PrivacyRequestForm() {
  const [identity, setIdentity] = useState({
    fullName: '',
    email: '',
    country: '',
    wallet: '',
    phone: '',
    language: '',
    pref: '' as '' | 'email' | 'discord' | 'telegram',
    telegram: '',
  })
  const [requests, setRequests] = useState<Check>({})
  const [dataScope, setDataScope] = useState<Check>({})
  const [verify, setVerify] = useState('' as '' | 'email' | 'wallet' | 'account' | 'payment' | 'alt')
  const [desc, setDesc] = useState('')
  const [agent, setAgent] = useState<'no' | 'yes'>('no')
  const [agentInfo, setAgentInfo] = useState({ name: '', relation: '', proofs: [] as string[] })
  const [ack, setAck] = useState<Check>({})
  const [submitted, setSubmitted] = useState(false)
  const submissionDate = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [requestId, setRequestId] = useState('')

  const genRequestId = () => `REQ-${submissionDate.replace(/-/g, '')}-${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`

  function toggle(setter: (v: any)=>void, key: string) {
    setter((prev: Check) => ({ ...prev, [key]: !prev[key] }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const required = identity.fullName && identity.email && identity.country
    const hasReq = Object.values(requests).some(Boolean)
    const hasVerify = !!verify
    const acks = ['isSubject', 'accurate', 'verify', 'retain', 'timeline', 'moreInfo', 'appeal', 'walletPublic']
      .every(k => !!ack[k])
    if (!required) return alert('Complete Step 1 (Full Name, Email, Country).')
    if (!hasReq) return alert('Select at least one item in Step 2.')
    if (!hasVerify) return alert('Choose one method in Step 4.')
    if (!acks) return alert('Acknowledge all items in Step 7.')
    setRequestId(genRequestId())
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-dvh bg-[#0a0b0f] text-slate-200">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">RED $MUGSY — PRIVACY REQUEST FORM</h1>
        <p className="text-xs text-slate-400 mt-2">Controller: Red Mugsy Foundation (Bahrain) • Last Updated: October 2025 • Compliance: GDPR (EU/UK), CCPA/CPRA, Bahrain PDPL, VCCPA/CCCPA/CTDPA • Contact: privacy@redmugsy.com • Response Time: 30–45 days</p>

        {submitted && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/60 p-4">
            <h2 className="text-xl font-bold text-white">Request Submitted</h2>
            <p className="mt-1 text-slate-300">Thank you. Your request has been received.</p>
            <p className="mt-2 text-slate-300"><span className="font-semibold text-white">Request ID:</span> {requestId}</p>
            <p className="text-slate-400 text-xs mt-2">Confirmation within 10 business days. Verification in 5–10 business days. Processing 30–45 days after verification.</p>
          </div>
        )}

        <section className="mt-8 rounded-xl border border-[#ff1a4b]/30 bg-black/50 p-4">
          <h2 className="text-lg font-bold text-white">IMPORTANT: Data Minimization & Security</h2>
          <p className="text-sm text-slate-300 mt-2">Do NOT send private keys, seed phrases, recovery phrases; full payment details; passport/ID documents; passwords or auth codes. We will never ask for these.</p>
        </section>

        <form onSubmit={onSubmit} className="mt-8 space-y-10">
          {/* STEP 1 */}
          <section className="rounded-xl border border-white/10 bg-black/40 p-6">
            <h3 className="text-xl font-bold text-white">STEP 1: YOUR IDENTITY</h3>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold">Full Name *</label><input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={identity.fullName} onChange={e=>setIdentity({...identity, fullName: e.target.value})} required placeholder="Name on your account" /></div>
              <div><label className="block text-sm font-semibold">Email Address *</label><input type="email" className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={identity.email} onChange={e=>setIdentity({...identity, email: e.target.value})} required placeholder="you@example.com" /></div>
              <div><label className="block text-sm font-semibold">Country / Region *</label><input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={identity.country} onChange={e=>setIdentity({...identity, country: e.target.value})} required placeholder="Your residence" /></div>
              <div><label className="block text-sm font-semibold">Wallet Address (optional)</label><input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={identity.wallet} onChange={e=>setIdentity({...identity, wallet: e.target.value})} placeholder="0x... if relevant" /></div>
              <div><label className="block text-sm font-semibold">Phone (optional)</label><input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={identity.phone} onChange={e=>setIdentity({...identity, phone: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold">Preferred Language (optional)</label><input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={identity.language} onChange={e=>setIdentity({...identity, language: e.target.value})} placeholder="English, Français, العربية, Español" /></div>
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-4 items-end text-sm">
              <div className="sm:col-span-2">
                <span className="block text-sm font-semibold">Preferred Contact (optional)</span>
                <div className="mt-2 flex gap-4">
                  {['email','discord','telegram'].map(p => (
                    <label key={p} className="inline-flex items-center gap-2"><input type="radio" name="pref" checked={identity.pref===p} onChange={()=>setIdentity({...identity, pref: p as any})} /> {p[0].toUpperCase()+p.slice(1)}</label>
                  ))}
                </div>
              </div>
              {identity.pref==='telegram' && (
                <div>
                  <label className="block text-sm font-semibold">Telegram handle</label>
                  <input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={identity.telegram} onChange={e=>setIdentity({...identity, telegram: e.target.value})} placeholder="@username" />
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-400">We DO NOT collect Date of Birth. Alternative non-sensitive proof may be requested if needed.</p>
          </section>

          {/* STEP 2 */}
          <section className="rounded-xl border border-white/10 bg-black/40 p-6">
            <h3 className="text-xl font-bold text-white">STEP 2: WHAT IS YOUR REQUEST?</h3>
            <div className="mt-4 grid md:grid-cols-2 gap-6 text-sm">
              {REQUEST_GROUPS.map(group => (
                <div key={group.title}>
                  <h4 className="font-semibold text-white">{group.title}</h4>
                  <div className="mt-2 space-y-1">
                    {group.items.map(it => (
                      <label key={it.key} className="block"><input type="checkbox" checked={!!requests[it.key]} onChange={()=>toggle(setRequests, it.key)} /> <span className="ml-2">{it.label}</span></label>
                    ))}
                    {group.items.some(x=>x.key==='other') && !!requests['other'] && (
                      <input className="mt-2 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" placeholder="Describe other request" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* STEP 3 */}
          <section className="rounded-xl border border-white/10 bg-black/40 p-6">
            <h3 className="text-xl font-bold text-white">STEP 3: WHAT DATA IS YOUR REQUEST ABOUT?</h3>
            <div className="mt-4 grid md:grid-cols-3 gap-6 text-sm">
              {DATA_GROUPS.map(group => (
                <div key={group.title}>
                  <h4 className="font-semibold text-white">{group.title}</h4>
                  <div className="mt-2 space-y-1">
                    {group.items.map(it => (
                      <label key={it.key} className="block"><input type="checkbox" checked={!!dataScope[it.key]} onChange={()=>toggle(setDataScope, it.key)} /> <span className="ml-2">{it.label}</span></label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* STEP 4 */}
          <section className="rounded-xl border border-white/10 bg-black/40 p-6">
            <h3 className="text-xl font-bold text-white">STEP 4: VERIFY YOUR IDENTITY</h3>
            <div className="mt-3 grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                {[
                  {k:'email', l:'Option A: Email Verification (recommended)'},
                  {k:'wallet', l:'Option B: Wallet Signature (wallet-linked requests)'},
                  {k:'account', l:'Option C: Account Details (if email unavailable)'},
                  {k:'payment', l:'Option D: Payment Details (merchandise requests)'},
                  {k:'alt', l:'Option E: Alternative Verification'},
                ].map(o => (
                  <label key={o.k} className="flex items-center gap-2">
                    <input type="radio" name="verify" checked={verify===o.k} onChange={()=>setVerify(o.k as any)} /> {o.l}
                  </label>
                ))}
              </div>
              <div className="text-slate-400">
                <p className="text-xs">⚠️ Provide ONLY the last 4 digits for payment. We never store full card details.</p>
                <p className="text-xs mt-2">Wallet signature is recommended for wallet/airdrop related requests.</p>
              </div>
            </div>
          </section>

          {/* STEP 5 */}
          <section className="rounded-xl border border-white/10 bg-black/40 p-6">
            <h3 className="text-xl font-bold text-white">STEP 5: DESCRIBE YOUR REQUEST</h3>
            <p className="text-sm text-slate-400 mt-1">In 50–150 words, describe the outcome you want.</p>
            <textarea rows={6} className="mt-3 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g., Export all my personal data in CSV format" />
          </section>

          {/* STEP 6 */}
          <section className="rounded-xl border border-white/10 bg-black/40 p-6">
            <h3 className="text-xl font-bold text-white">STEP 6: AUTHORIZED AGENT (If Applicable)</h3>
            <div className="mt-3 flex gap-6 text-sm">
              <label className="inline-flex items-center gap-2"><input type="radio" name="agent" checked={agent==='no'} onChange={()=>setAgent('no')} /> No, I am the data subject</label>
              <label className="inline-flex items-center gap-2"><input type="radio" name="agent" checked={agent==='yes'} onChange={()=>setAgent('yes')} /> Yes, I am an authorized agent</label>
            </div>
            {agent==='yes' && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold">Full name of person you represent</label><input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={agentInfo.name} onChange={e=>setAgentInfo({...agentInfo, name: e.target.value})} /></div>
                <div><label className="block text-sm font-semibold">Your relationship to them</label><input className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2" value={agentInfo.relation} onChange={e=>setAgentInfo({...agentInfo, relation: e.target.value})} /></div>
              </div>
            )}
          </section>

          {/* STEP 7 */}
          <section className="rounded-xl border border-white/10 bg-black/40 p-6">
            <h3 className="text-xl font-bold text-white">STEP 7: TERMS & ACKNOWLEDGMENT</h3>
            <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
              {[
                {k:'isSubject', l:'I am the data subject (or authorized)'} ,
                {k:'accurate', l:'All information I provided is true and accurate'},
                {k:'verify', l:'I understand identity verification (5–10 business days)'},
                {k:'retain', l:'Some data must be retained for legal compliance'},
                {k:'timeline', l:'Response timelines: GDPR/UK 30d; CPRA 45d'},
                {k:'moreInfo', l:'Additional information may be requested if needed'},
                {k:'appeal', l:'I can appeal a denial'},
                {k:'walletPublic', l:'Blockchain wallet addresses are public and immutable'},
              ].map(o => (
                <label key={o.k} className="inline-flex items-start gap-2"><input type="checkbox" checked={!!ack[o.k]} onChange={()=>toggle(setAck, o.k)} /> <span>{o.l}</span></label>
              ))}
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
              <div><label className="block text-slate-400">Submission Date</label><input readOnly value={submissionDate} className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-slate-300" /></div>
              <div><label className="block text-slate-400">Request ID (auto-generated)</label><input readOnly value={requestId || '—'} className="mt-1 w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-slate-300" /></div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button type="submit" className="btn-neo px-8 py-3 text-lg">Submit Request</button>
            <a href="mailto:privacy@redmugsy.com" className="btn-ghost btn-ghost--red px-6 py-3 text-sm">Or email privacy@redmugsy.com</a>
          </div>
        </form>

        <section className="mt-12 rounded-xl border border-white/10 bg-black/30 p-6 text-sm text-slate-300">
          <h3 className="text-lg font-bold text-white">What Happens Next</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Confirmation within 10 business days</li>
            <li>Verification in 5–10 business days</li>
            <li>Processing 30–45 days after verification</li>
            <li>Delivery by secure, expiring link (7 days)</li>
          </ul>
          <p className="mt-3 text-slate-400">We do NOT sell personal data. We honor Global Privacy Control (GPC) browser signals. See Privacy Policy for details.</p>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}


