import { useEffect, useState } from 'react'
import { setCookieConsent, shouldShowBanner } from '../utils/cookieConsent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(shouldShowBanner())
  }, [])

  if (!visible) return null

  function acceptAll() {
    setCookieConsent({ analytics: true, functional: true })
    setVisible(false)
  }

  function rejectNonEssential() {
    setCookieConsent({ analytics: false, functional: false })
    setVisible(false)
  }

  function customize() {
    window.location.assign('/cookie-preferences')
  }

  return (
    <div role="dialog" aria-live="polite" aria-label="Cookie consent" className="fixed inset-x-0 bottom-0 z-[9999]">
      <div className="mx-auto max-w-5xl m-4 rounded-xl border-2 border-[#00F0FF] bg-black/95 backdrop-blur px-5 py-4 text-white shadow-[0_-10px_30px_rgba(0,240,255,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm leading-relaxed">
            We use cookies to improve your experience and analyze site traffic. Essential cookies are required for the site to function. Optional cookies help us understand how you use the site. <a href="/cookie-policy" className="underline decoration-[#00F0FF] text-[#00F0FF] hover:brightness-110">Learn more</a>
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:shrink-0">
            <button onClick={acceptAll} className="uppercase text-sm font-bold rounded-md px-4 py-2 bg-[#00F0FF] text-black hover:brightness-110">
              Accept All
            </button>
            <button onClick={rejectNonEssential} className="uppercase text-sm font-bold rounded-md px-4 py-2 border border-white/80 hover:bg-white/10">
              Reject Non-Essential
            </button>
            <button onClick={customize} className="uppercase text-sm font-bold rounded-md px-4 py-2 text-[#00F0FF] hover:underline">
              Customize Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
