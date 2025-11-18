import { useEffect, useState } from 'react'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { Turnstile } from './claim/turnstile'
import { TurnstileDebug } from './components/TurnstileDebug'

const DEFAULT_SITEKEY = '0x4AAAAAAB_cZo6l9Vt0npf_' // Community form Turnstile sitekey
const SITEKEY = ((import.meta as any).env?.VITE_TURNSTILE_SITEKEY_COMMUNITY as string) || DEFAULT_SITEKEY
// Use Perfect Integrity API for newsletter subscriptions
const NEWSLETTER_API = ((import.meta as any).env?.VITE_NEWSLETTER_API as string) || 'https://perfect-integrity-production.up.railway.app'
// Fallback to main contact API if newsletter API fails
const CONTACT_API = ((import.meta as any).env?.VITE_API_BASE as string) || 'https://mugsywebsite-production-b065.up.railway.app'

export default function Community() {
  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [sitekey, setSitekey] = useState(SITEKEY)
  const [sitekeyStatus, setSitekeyStatus] = useState<'idle'|'loading'|'ready'|'error'>('idle')
  const [widgetResetKey, setWidgetResetKey] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [captchaNotice, setCaptchaNotice] = useState('')

  // Debug logging
  useEffect(() => {
    console.log('Community component loaded')
    console.log('Current domain:', window.location.hostname)
    console.log('Current protocol:', window.location.protocol)
    console.log('Sitekey from env:', ((import.meta as any).env?.VITE_TURNSTILE_SITEKEY_COMMUNITY))
    console.log('Using sitekey:', sitekey)
    console.log('Newsletter API:', NEWSLETTER_API)
    console.log('Contact API:', CONTACT_API)
  }, [])

  useEffect(() => {
    // Simplified sitekey resolution - use environment variable directly
    const envSitekey = ((import.meta as any).env?.VITE_TURNSTILE_SITEKEY_COMMUNITY as string)
    const resolved = envSitekey || DEFAULT_SITEKEY
    
    console.log('Using Community sitekey:', resolved)
    setSitekey(resolved)
    setSitekeyStatus('ready')
    setCaptchaNotice('')
  }, [])
  }, [NEWSLETTER_API])

  function resetWidget() {
    setWidgetResetKey((n) => n + 1)
    setTurnstileToken('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !turnstileToken) {
      setError('Please fill in your email and complete verification')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Try Perfect Integrity API first for newsletter subscription
      const response = await fetch(`${NEWSLETTER_API}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter Subscriber',
          email: email,
          purpose: 'Newsletter Subscription',
          subject: 'Newsletter Subscription Request',
          message: `Newsletter subscription request from community page.

Email: ${email}
Source: community-page
Timestamp: ${new Date().toISOString()}

This is an automated subscription request from the Red Mugsy community page.`,
          captcha: {
            type: 'turnstile',
            token: turnstileToken
          },
          turnstileToken,
          website: '', // honeypot field
          issuedAt: Date.now(),
          issuedSig: 'community-form'
        })
      })

      if (response.ok) {
        setSubmitted(true)
        setEmail('')
        resetWidget()
        return
      }

      // If newsletter API fails, try using contact API as fallback
      console.warn('Newsletter API failed, trying contact API fallback:', response.status)
      
      const fallbackResponse = await fetch(`${CONTACT_API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Community Newsletter Subscriber',
          email: email,
          company: '',
          phoneCountry: 'US',
          phoneDialCode: '+1',
          phoneNational: '',
          phoneE164: '',
          purpose: 'Newsletter Subscription',
          subject: 'Community Newsletter Subscription',
          message: `Newsletter subscription request from community page.

Email: ${email}
Source: community-page-fallback
Timestamp: ${new Date().toISOString()}

This is a newsletter subscription request submitted through the community page.`,
          walletAddress: '',
          website: '', // honeypot field
          issuedAt: Date.now(),
          issuedSig: 'community-form-fallback',
          turnstileToken,
          captcha: {
            type: 'turnstile',
            token: turnstileToken
          }
        })
      })

      if (fallbackResponse.ok) {
        setSubmitted(true)
        setEmail('')
        resetWidget()
      } else {
        const data = await fallbackResponse.json().catch(() => ({}))
        setError(data.error === 'invalid_captcha' ? 'Please verify you are human' : 'Subscription service temporarily unavailable. Please follow us on social media or email us directly at contact@redmugsy.com')
      }
    } catch (err) {
      console.error('Community form submission error:', err)
      setError('Subscription service temporarily unavailable. Please follow us on social media below or email us directly at contact@redmugsy.com')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-200">
      <SiteHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-white">Join Our Community</h1>
          <p className="text-slate-300 mt-3 max-w-2xl text-base sm:text-lg">
            Stay updated with the latest Red Mugsy news, memes, and community events.
          </p>
        </div>

        {/* Subscription Form */}
        <div className="max-w-md mx-auto mb-16">
          <div className="rounded-xl border border-white/10 bg-black/30 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Subscribe Below</h2>
            
            {submitted ? (
              <div className="text-center">
                <div className="mb-4 text-green-400 text-6xl">✓</div>
                <h3 className="text-xl font-semibold text-white mb-2">Check Your Email!</h3>
                <p className="text-slate-300">
                  We've sent a verification email to confirm your subscription. 
                  Please click the link in the email to complete your signup.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-[#ff1a4b] focus:outline-none"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Verify You're Human
                  </label>
                  <div className="space-y-2">
                    <Turnstile
                      key={`${sitekey}-${widgetResetKey}`}
                      sitekey={sitekey}
                      onToken={(token) => { 
                        setTurnstileToken(token)
                        setError('') 
                        setCaptchaNotice('')
                      }}
                      onExpire={() => { 
                        setError('Verification expired. Please try again.')
                        setTurnstileToken('')
                        resetWidget() 
                      }}
                      onError={() => { 
                        setError('Verification widget failed to load. Please refresh the page.')
                        setTurnstileToken('')
                        setCaptchaNotice('If this problem persists, you can contact us directly at contact@redmugsy.com')
                        resetWidget() 
                      }}
                    />
                    {captchaNotice && (
                      <p className="text-xs text-amber-300">{captchaNotice}</p>
                    )}
                    {sitekeyStatus === 'loading' && (
                      <p className="text-xs text-slate-400">Loading verification widget...</p>
                    )}
                    <TurnstileDebug sitekey={sitekey} />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm text-center">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !email || !turnstileToken || sitekeyStatus === 'loading'}
                  className="w-full bg-[#ff1a4b] hover:bg-[#cc1239] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  title={!turnstileToken ? 'Please complete verification first' : ''}
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Social Communities */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Or Social Communities</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 max-w-5xl mx-auto">
          <a 
            href="https://x.com/RedMugsyToken" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-6 rounded-xl border-2 border-red-500/30 bg-black/20 hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-300"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <img src="img/X logo White Trnsprt.png" alt="X / Twitter" className="w-12 h-12" />
            </div>
            <span className="text-white font-semibold group-hover:text-red-400 transition-colors">X</span>
          </a>

          <a 
            href="https://bsky.app/profile/redmugsy.bsky.social" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-6 rounded-xl border-2 border-red-500/30 bg-black/20 hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-300"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <img src="img/bluesky logo White Trnsprt.png" alt="BlueSky" className="w-12 h-12" />
            </div>
            <span className="text-white font-semibold group-hover:text-red-400 transition-colors">Bluesky</span>
          </a>

          <a 
            href="https://t.me/REDMUGSY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-6 rounded-xl border-2 border-red-500/30 bg-black/20 hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-300"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <img src="img/Telegram logo White Trnsprt.png" alt="Telegram" className="w-12 h-12" />
            </div>
            <span className="text-white font-semibold group-hover:text-red-400 transition-colors">Telegram</span>
          </a>

          <a 
            href="https://discord.gg/9GJcjKhaYj" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-6 rounded-xl border-2 border-red-500/30 bg-black/20 hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-300"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <img src="img/Discord logo White Trnsprt.png" alt="Discord" className="w-12 h-12" />
            </div>
            <span className="text-white font-semibold group-hover:text-red-400 transition-colors">Discord</span>
          </a>

          <a 
            href="https://www.tiktok.com/@redmugsy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-6 rounded-xl border-2 border-red-500/30 bg-black/20 hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-300"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <img src="img/TikTok logo White Trnsprt.png" alt="TikTok" className="w-12 h-12" />
            </div>
            <span className="text-white font-semibold group-hover:text-red-400 transition-colors">TikTok</span>
          </a>

          <a 
            href="https://www.instagram.com/redmugsy/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-6 rounded-xl border-2 border-red-500/30 bg-black/20 hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-300"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <img src="img/Instagram logo White Trnsprt.png" alt="Instagram" className="w-12 h-12" />
            </div>
            <span className="text-white font-semibold group-hover:text-red-400 transition-colors">Instagram</span>
          </a>

          <a 
            href="https://www.reddit.com/user/redmugsy/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-6 rounded-xl border-2 border-red-500/30 bg-black/20 hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-300"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <img src="img/Reddit logo White Trnsprt.png" alt="Reddit" className="w-12 h-12" />
            </div>
            <span className="text-white font-semibold group-hover:text-red-400 transition-colors">Reddit</span>
          </a>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
