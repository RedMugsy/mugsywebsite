import { type FormEvent, useState } from 'react'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { Turnstile } from '@marsidev/react-turnstile'

// Cloudflare Turnstile Site Key for Promoter Sign-in
const TURNSTILE_SITE_KEY_PROMOTER_SIGNIN = '0x4AAAAAACCjPAPEx1KF6so2' // Using promoter registration key temporarily

type FormErrors = {
  email?: string
  password?: string
  login?: string
  captcha?: string
}

export default function PromoterSignin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')

  const validate = () => {
    const next: FormErrors = {}
    if (!email.trim()) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Please enter a valid email address'
    }
    if (!password.trim()) {
      next.password = 'Password is required'
    } else if (password.trim().length < 6) {
      next.password = 'Password must be at least 6 characters'
    }
    if (!turnstileToken) {
      next.captcha = 'Please complete the security verification'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    setErrors({})

    try {
      console.log('===== PROMOTER SIGN IN SUBMISSION =====')
      console.log('Turnstile Token:', turnstileToken)
      console.log('Form Data:', { email: email.trim() })
      console.log('Note: Token must be verified server-side with secret key')
      console.log('=============================================')

      await new Promise((resolve) => setTimeout(resolve, 800))

      if (email.trim().toLowerCase() === 'demo@redmugsy.com' && password === 'demo123') {
        localStorage.setItem('promoterAuthenticated', 'true')
        localStorage.setItem('promoterEmail', email.trim().toLowerCase())
        window.location.hash = '#/treasure-hunt/promoters'
        return
      }
      setErrors({ login: 'Invalid email or password. Please try again.' })
    } catch (err) {
      console.error(err)
      setErrors({ login: 'Unable to sign in right now. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 antialiased flex flex-col">
      <SiteHeader />

      <main className="flex-1 relative px-6 sm:px-10 py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-80 w-80 bg-[#ff1a4b]/20 blur-3xl rounded-full animate-[blob_16s_ease-in-out_infinite]" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 bg-[#00F0FF]/20 blur-3xl rounded-full animate-[blob_18s_ease-in-out_infinite]" />
        </div>

        <div className="relative max-w-4xl mx-auto grid lg:grid-cols-2 gap-10">
          <section className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Promoter Portal</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Sign in to your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff1a4b] to-[#00F0FF]">
                Treasure Hunt Dashboard
              </span>
            </h1>
            <p className="text-lg text-slate-300">
              Track referrals, monitor paid participants, and pull rewards straight from your personal dashboard.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="text-[#ff1a4b] mt-0.5">✓</span>
                <p>Monitor live Pathfinder + Key Master signups tied to your referral code.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#ff1a4b] mt-0.5">✓</span>
                <p>Download payout statements for each 2,000 paid-participant milestone.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#ff1a4b] mt-0.5">✓</span>
                <p>Access Mugsy-approved marketing assets and unique tracking links.</p>
              </div>
            </div>
          </section>

          <section className="bg-[#0b0c10]/90 border border-white/10 rounded-2xl p-6 backdrop-blur flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Promoter Sign In</h2>
              <p className="text-sm text-slate-400 mt-1">
                Need access?{' '}
                <a href="#/treasure-hunt/promoter-register" className="text-[#00F0FF] hover:text-[#ff1a4b] underline">
                  Request it here.
                </a>
              </p>
            </div>

            {errors.login && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {errors.login}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                <input
                  type="email"
                  className={`w-full rounded-lg border px-4 py-3 bg-black/40 text-white focus:outline-none focus:border-[#00F0FF] ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/15'
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
                {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Password</label>
                <input
                  type="password"
                  className={`w-full rounded-lg border px-4 py-3 bg-black/40 text-white focus:outline-none focus:border-[#00F0FF] ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'border-white/15'
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-neo text-lg py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing In…' : 'Access Dashboard'}
              </button>
            </form>

            {/* Turnstile Widget */}
            <div className="flex justify-center">
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY_PROMOTER_SIGNIN}
                onSuccess={(token) => {
                  setTurnstileToken(token)
                  setErrors(prev => ({ ...prev, captcha: undefined }))
                }}
                onError={() => {
                  setTurnstileToken('')
                  setErrors(prev => ({ ...prev, captcha: 'Security verification failed' }))
                }}
                onExpire={() => {
                  setTurnstileToken('')
                  setErrors(prev => ({ ...prev, captcha: 'Security verification expired' }))
                }}
                
              />
            </div>
            {errors.captcha && <p className="text-sm text-red-400 text-center">{errors.captcha}</p>}

            <p className="text-sm text-slate-400">
              Forgot your password? Email{' '}
              <a href="mailto:promoters@redmugsy.com" className="text-[#00F0FF] hover:text-[#ff1a4b]">
                promoters@redmugsy.com
              </a>{' '}
              from your registered account.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
