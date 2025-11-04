import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'

export default function CookiePolicy() {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className="min-h-dvh bg-[#0a0b0f] text-slate-200">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold text-white">Cookie Policy</h1>
        <p className="text-sm text-slate-400 mt-2">Last Updated: {today} • Effective Date: {today}</p>

        <section className="mt-6 space-y-3 text-slate-300 text-sm">
          <h2 className="text-white font-semibold text-lg">What Are Cookies?</h2>
          <p>Cookies are small text files that are placed on your device when you visit a website. They help websites remember your actions and preferences over time, making your browsing experience more convenient and personalized.</p>
          <p>This Cookie Policy explains what cookies are, how we use them on redmugsy.com, and how you can control them.</p>
        </section>

        <section className="mt-8 text-sm">
          <h2 className="text-white font-semibold text-lg">Types of Cookies We Use</h2>
          <div className="overflow-x-auto mt-3 border border-white/10 rounded-xl">
            <table className="w-full text-left text-slate-200 text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-3 py-2">Cookie Name</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Purpose</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">Third Party?</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['mugsy_session','Essential','Session management and security','Session','No'],
                  ['mugsy_csrf_token','Essential','CSRF protection','Session','No'],
                  ['mugsy_wallet_connected','Essential','Remembers wallet connection state','7 days','No'],
                  ['_ga','Analytics','Google Analytics - anonymous site usage','2 years','Yes (Google)'],
                  ['_gid','Analytics','Google Analytics - session tracking','24 hours','Yes (Google)'],
                  ['mugsy_theme','Functional','Remembers dark/light mode','365 days','No'],
                  ['mugsy_language','Functional','Remembers language preference','365 days','No'],
                ].map((row) => (
                  <tr key={row[0]} className="odd:bg-white/0 even:bg-white/[0.025]">
                    {row.map((c, i) => <td key={i} className="px-3 py-2 align-top">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 space-y-3 text-slate-300 text-sm">
          <h2 className="text-white font-semibold text-lg">How We Use Cookies</h2>
          <p><span className="font-semibold text-white">Essential Cookies:</span> Critical for basic website functionality. Without them, services you've requested (like wallet connection or form submissions) cannot be provided. You cannot opt out of these cookies.</p>
          <p><span className="font-semibold text-white">Performance & Analytics Cookies:</span> We use Google Analytics to understand how visitors interact with our website. This helps us improve content, navigation, and overall user experience. All data is anonymized and we cannot identify individual users. You can opt out of these cookies via Cookie Preferences.</p>
          <p><span className="font-semibold text-white">Functional Cookies:</span> Remember your preferences to make your experience more convenient (e.g., theme and language). You can opt out via Cookie Preferences.</p>
        </section>

        <section className="mt-8 space-y-3 text-slate-300 text-sm">
          <h2 className="text-white font-semibold text-lg">Third-Party Cookies</h2>
          <p><span className="font-semibold text-white">Google Analytics (analytics):</span> Provider: Google LLC — Purpose: Anonymous website analytics — Privacy Policy: https://policies.google.com/privacy — Opt-Out: https://tools.google.com/dlpage/gaoptout</p>
          <p><span className="font-semibold text-white">Cloudflare (security):</span> Provider: Cloudflare Inc. — Purpose: DDoS protection, CDN services — Privacy Policy: https://www.cloudflare.com/privacypolicy/</p>
          <p>We do NOT use advertising cookies or cross-site tracking pixels unless explicitly enabled.</p>
        </section>

        <section className="mt-8 space-y-3 text-slate-300 text-sm">
          <h2 className="text-white font-semibold text-lg">How to Control Cookies</h2>
          <p>On this website: visit <a href="#/cookie-preferences" className="underline decoration-[#2323FF]">Cookie Preferences</a> to enable/disable optional cookies.</p>
          <p>In your browser settings, you can also control cookies. Blocking all cookies may prevent certain features from working.</p>
        </section>

        <section className="mt-8 space-y-3 text-slate-300 text-sm">
          <h2 className="text-white font-semibold text-lg">Cookie Lifespan</h2>
          <ul className="list-disc pl-5">
            <li>Session Cookies: Deleted when you close your browser</li>
            <li>Short-term Cookies: 24 hours to 7 days</li>
            <li>Medium-term Cookies: 30–90 days</li>
            <li>Long-term Cookies: 365 days</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-slate-300 text-sm">
          <h2 className="text-white font-semibold text-lg">Updates to This Policy</h2>
          <p>We may update this Cookie Policy to reflect changes in technology, legal requirements, and user feedback. We will notify you of material changes via our website or social channels.</p>
        </section>

        <section className="mt-8 space-y-3 text-slate-300 text-sm">
          <h2 className="text-white font-semibold text-lg">Contact & Questions</h2>
          <p>Questions? Email <a className="underline decoration-[#2323FF]" href="mailto:privacy@redmugsy.com">privacy@redmugsy.com</a>. For general privacy questions, see our <a className="underline decoration-[#2323FF]" href="/Public%20Documents/Privacy%20Policy.pdf">Privacy Policy</a>.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}


