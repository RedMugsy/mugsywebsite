import { useEffect, useState } from 'react'
import { checkCookieConsent, savePreferences } from './utils/cookieConsent'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'

export default function CookiePreferences() {
  const [analytics, setAnalytics] = useState(false)
  const [functional, setFunctional] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const c = checkCookieConsent()
    if (c) {
      setAnalytics(!!c.analytics)
      setFunctional(!!c.functional)
    }
  }, [])

  function onSave() {
    savePreferences(true, analytics, functional)
    setSaved(true)
    setTimeout(()=>setSaved(false), 2500)
  }

  function acceptAll() {
    setAnalytics(true); setFunctional(true); onSave()
  }
  function rejectAll() {
    setAnalytics(false); setFunctional(false); onSave()
  }

  return (
    <div className="min-h-dvh bg-[#0a0b0f] text-slate-200">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold text-white">Cookie Preferences</h1>
        <p className="text-slate-400 mt-2">Manage how we use cookies on redmugsy.com</p>

        <section className="mt-6 text-sm text-slate-300">
          <p>Cookies are small text files stored on your device that help us provide and improve our services. You can control which types of cookies you allow below.</p>
          <p className="mt-2">Note: Disabling certain cookies may affect site functionality.</p>
        </section>

        {/* Essential */}
        <section className="mt-8 rounded-2xl border border-[#333] bg-[#111] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-white font-semibold">Essential Cookies (Required)</h2>
              <p className="text-sm text-slate-400 mt-1">These cookies are necessary for the website to function and cannot be disabled.</p>
              <ul className="list-disc pl-5 text-xs text-slate-500 mt-2 space-y-1">
                <li>Session management and security tokens</li>
                <li>Wallet connection state</li>
                <li>CSRF protection</li>
                <li>Language and theme preferences</li>
              </ul>
            </div>
            <div className="shrink-0">
              <label className="inline-flex items-center gap-2 text-xs opacity-70">
                <input type="checkbox" checked disabled /> Always On
              </label>
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section className="mt-6 rounded-2xl border border-[#333] bg-[#111] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-white font-semibold">Performance & Analytics Cookies (Optional)</h2>
              <p className="text-sm text-slate-400 mt-1">Help us understand how visitors use our website so we can improve it. Data is anonymized and aggregated.</p>
              <ul className="list-disc pl-5 text-xs text-slate-500 mt-2 space-y-1">
                <li>Pages visited, time on site, referrals</li>
                <li>Google Analytics 4 (anonymized IP addresses)</li>
                <li>Examples: _ga (2y), _gid (24h), _ga_* (2y)</li>
              </ul>
            </div>
            <div className="shrink-0">
              <Toggle checked={analytics} onChange={setAnalytics} />
            </div>
          </div>
        </section>

        {/* Functional */}
        <section className="mt-6 rounded-2xl border border-[#333] bg-[#111] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-white font-semibold">Functional Cookies (Optional)</h2>
              <p className="text-sm text-slate-400 mt-1">Enhance your experience by remembering preferences (e.g., theme, language, non-sensitive form inputs).</p>
              <ul className="list-disc pl-5 text-xs text-slate-500 mt-2 space-y-1">
                <li>Examples: mugsy_theme (365d), mugsy_language (365d), mugsy_preferences (365d)</li>
              </ul>
            </div>
            <div className="shrink-0">
              <Toggle checked={functional} onChange={setFunctional} />
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onSave} className="rounded-md px-5 py-2 bg-[#00F0FF] text-black font-semibold hover:brightness-110">Save Preferences</button>
          <button onClick={acceptAll} className="rounded-md px-5 py-2 border border-white/80 text-white font-semibold hover:bg-white/10">Accept All</button>
          <button onClick={rejectAll} className="rounded-md px-5 py-2 text-[#ff8fa0] font-semibold hover:underline">Reject All</button>
        </div>

        {saved && <p className="mt-3 text-sm text-[#00F0FF]">Preferences saved.</p>}

        <div className="mt-10 flex flex-wrap gap-4 text-sm text-slate-400">
          <a href="/cookie-policy" className="underline decoration-[#00F0FF]">View Full Cookie Policy</a>
          <a href="/Public%20Documents/Privacy%20Policy.pdf" className="underline decoration-[#00F0FF]" target="_blank" rel="noopener noreferrer">View Privacy Policy</a>
          <a href="mailto:privacy@redmugsy.com" className="underline decoration-[#00F0FF]">Contact Us</a>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${checked ? 'bg-[#00F0FF]' : 'bg-[#444]'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}


