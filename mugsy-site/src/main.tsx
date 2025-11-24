import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/tube-navbar.css'
import 'flag-icons/css/flag-icons.min.css'
import PrivacyRequestForm from './PrivacyRequestForm.tsx'
import CookiePreferences from './CookiePreferences.tsx'
import CookiePolicy from './CookiePolicy.tsx'
import CookieBanner from './components/CookieBanner.tsx'
import { checkCookieConsent, loadAnalytics } from './utils/cookieConsent'
import Contact from './Contact.tsx'
import Admin from './Admin.tsx'
import TreasureHunt from './TreasureHunt.tsx'
import TreasureHuntRegistration from './TreasureHuntRegistration.tsx'
import TreasureHuntPromoters from './TreasureHuntPromoters.tsx'
import TreasureHuntAdmin from './TreasureHuntAdmin.tsx'
import PromoterSelfRegistration from './PromoterSelfRegistration.tsx'
import { SolanaWalletProvider } from './components/SolanaWalletProvider.tsx'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/config'

function RootRouter() {
  // Use hash for routing to avoid 404 issues on GitHub Pages
  const getPath = () => {
    const h = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
    return h || (typeof window !== 'undefined' ? window.location.pathname : '/')
  }
  const [path, setPath] = useState<string>(getPath())
  useEffect(() => {
    const onHash = () => setPath(getPath())
    const onPop = () => setPath(getPath())
    window.addEventListener('hashchange', onHash)
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('popstate', onPop)
    }
  }, [])
  const FEATURE_CLAIM = ((import.meta as any).env?.VITE_FEATURE_CLAIM || 'false') === 'true'
  const [ClaimComp, setClaimComp] = useState<React.ComponentType | null>(null)
  useEffect(()=>{
    if (FEATURE_CLAIM && (path === '/mugsywebsite/claim' || path === '/mugsywebsite/claim/' || path === '/claim' || path === '/claim/')) {
      import('./claim/ClaimPage').then(mod => setClaimComp(()=>mod.default)).catch(()=>setClaimComp(()=>(()=>
        <div className="max-w-xl mx-auto p-6"><h1 className="text-xl font-bold">Claim</h1><p className="text-slate-400 mt-2">Module not available.</p></div>
      )))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[path])
  if (path === '/mugsywebsite/cookie-preferences' || path === '/mugsywebsite/cookie-preferences/' || path === '/cookie-preferences' || path === '/cookie-preferences/') {
    return <CookiePreferences />
  }
  if (path === '/mugsywebsite/cookie-policy' || path === '/mugsywebsite/cookie-policy/' || path === '/cookie-policy' || path === '/cookie-policy/') {
    return <CookiePolicy />
  }
  if (path === '/mugsywebsite/contact' || path === '/mugsywebsite/contact/' || path === '/contact' || path === '/contact/') {
    return <Contact />
  }
  if (path === '/mugsywebsite/admin' || path === '/mugsywebsite/admin/' || path === '/admin' || path === '/admin/') {
    return <Admin />
  }
  if (path === '/mugsywebsite/treasure-hunt' || path === '/mugsywebsite/treasure-hunt/' || path === '/treasure-hunt' || path === '/treasure-hunt/') {
    return <TreasureHunt />
  }
  if (path === '/mugsywebsite/treasure-hunt/register' || path === '/mugsywebsite/treasure-hunt/register/' || path === '/treasure-hunt/register' || path === '/treasure-hunt/register/') {
    return <TreasureHuntRegistration />
  }
  if (path === '/mugsywebsite/treasure-hunt/promoters' || path === '/mugsywebsite/treasure-hunt/promoters/' || path === '/treasure-hunt/promoters' || path === '/treasure-hunt/promoters/') {
    return (
      <SolanaWalletProvider>
        <TreasureHuntPromoters />
      </SolanaWalletProvider>
    )
  }
  if (path === '/mugsywebsite/treasure-hunt/admin' || path === '/mugsywebsite/treasure-hunt/admin/' || path === '/treasure-hunt/admin' || path === '/treasure-hunt/admin/') {
    return <TreasureHuntAdmin />
  }
  if (path === '/mugsywebsite/treasure-hunt/promoter-register' || path === '/mugsywebsite/treasure-hunt/promoter-register/' || path === '/treasure-hunt/promoter-register' || path === '/treasure-hunt/promoter-register/') {
    return <PromoterSelfRegistration />
  }
  if (path === '/mugsywebsite/privacy-request' || path === '/mugsywebsite/privacy-request/' || path === '/privacy-request' || path === '/privacy-request/') {
    return <PrivacyRequestForm />
  }
  if (path === '/mugsywebsite/claim' || path === '/mugsywebsite/claim/' || path === '/claim' || path === '/claim/') {
    if (!FEATURE_CLAIM) {
      return <div className="max-w-xl mx-auto p-6"><h1 className="text-xl font-bold">Claim is not enabled</h1><p className="text-slate-400 mt-2">Set VITE_FEATURE_CLAIM=true to enable.</p></div>
    }
    if (ClaimComp) return <ClaimComp />
    return <div className="max-w-xl mx-auto p-6"><p className="text-slate-400">Loading…</p></div>
  }
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <AppBoot>
        <RootRouter />
        <CookieBanner />
      </AppBoot>
    </I18nextProvider>
  </React.StrictMode>,
)

function AppBoot({ children }: { children: React.ReactNode }) {
  // Initialize analytics if consent already granted
  const consent = checkCookieConsent()
  if (consent?.analytics) {
    // Load GA only once
    loadAnalytics()
  }
  // Sync document direction for RTL languages
  useEffect(() => {
    const lang = i18n.language
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [])
  return <>{children}</>
}
