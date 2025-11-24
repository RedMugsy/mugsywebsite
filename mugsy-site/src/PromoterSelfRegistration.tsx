import { useState } from 'react'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { motion } from 'framer-motion'

type PromoterType = 'individual' | 'company'

export default function PromoterSelfRegistration() {
  const [promoterType, setPromoterType] = useState<PromoterType>('individual')
  const [formData, setFormData] = useState({
    // Individual fields
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    xAccount: '',
    telegramAccount: '',
    discordAccount: '',

    // Company fields
    companyName: '',
    companyLicense: '',
    companyAddress: '',
    companyWebsite: '',
    companyX: '',
    companyTelegram: '',
    companyDiscord: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',

    // Common fields
    forecastedParticipants: 0,
    walletAddress: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // In production: Send to API, notify admin
    console.log('Promoter registration submitted:', {
      type: promoterType,
      ...formData
    })

    // Send email to admin (in production)
    console.log('Email sent to admin: New promoter registration request')

    setShowSuccess(true)
    setIsSubmitting(false)
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-black text-slate-200 antialiased relative overflow-x-hidden">
        <SiteHeader />

        <main className="relative pt-8 pb-24 sm:pt-12 sm:pb-32 px-6 sm:px-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="card bg-gradient-to-br from-[#ff1a4b]/20 to-[#00F0FF]/20 border-[#ff1a4b] text-center space-y-8"
            >
              <div className="text-6xl">✅</div>

              <h1 className="text-4xl sm:text-6xl font-bold text-white">
                Registration Submitted!
              </h1>

              <div className="space-y-4 text-lg text-slate-300">
                <p className="text-xl text-white font-semibold">
                  Thank you for your interest in becoming a Red Mugsy Treasure Hunt Promoter.
                </p>
                <p>
                  Your application has been submitted successfully and is now under review by our admin team.
                </p>
              </div>

              <div className="card bg-black/40 text-left space-y-4">
                <h2 className="text-2xl font-bold text-white">What Happens Next?</h2>

                <ul className="space-y-3 text-slate-300">
                  <li>✓ Our team will review your application within 24-48 hours</li>
                  <li>✓ You'll receive an email notification with the decision</li>
                  <li>✓ If approved, you'll receive your unique referral code and login credentials</li>
                  <li>✓ You can then start promoting and earning from referrals</li>
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href="#/treasure-hunt"
                  className="btn-neo px-8 py-4 inline-block"
                >
                  Return to Treasure Hunt
                </a>
              </div>
            </motion.div>
          </div>
        </main>

        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 antialiased relative overflow-x-hidden">
      <SiteHeader />

      <main className="relative pt-8 pb-24 sm:pt-12 sm:pb-32 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              Become a Promoter
            </h1>
            <p className="text-xl text-slate-300">
              Join the Red Mugsy Treasure Hunt as a promoter and earn rewards
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="card space-y-8">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Registration Type <span className="text-[#ff1a4b]">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="promoterType"
                    value="individual"
                    checked={promoterType === 'individual'}
                    onChange={(e) => setPromoterType(e.target.value as PromoterType)}
                    className="text-[#ff1a4b]"
                  />
                  <span className="text-white">Individual</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="promoterType"
                    value="company"
                    checked={promoterType === 'company'}
                    onChange={(e) => setPromoterType(e.target.value as PromoterType)}
                    className="text-[#ff1a4b]"
                  />
                  <span className="text-white">Company</span>
                </label>
              </div>
            </div>

            {/* Individual Fields */}
            {promoterType === 'individual' && (
              <div className="space-y-6 border-t border-white/10 pt-6">
                <h2 className="text-2xl font-bold text-white">Your Information</h2>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">First Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Middle Name</label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">X Account</label>
                    <input
                      type="text"
                      placeholder="@username"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.xAccount}
                      onChange={(e) => setFormData({ ...formData, xAccount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Telegram Account</label>
                    <input
                      type="text"
                      placeholder="@username"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.telegramAccount}
                      onChange={(e) => setFormData({ ...formData, telegramAccount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Discord</label>
                    <input
                      type="text"
                      placeholder="username#0000"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.discordAccount}
                      onChange={(e) => setFormData({ ...formData, discordAccount: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Company Fields */}
            {promoterType === 'company' && (
              <div className="space-y-6 border-t border-white/10 pt-6">
                <h2 className="text-2xl font-bold text-white">Company Information</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Company License</label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.companyLicense}
                      onChange={(e) => setFormData({ ...formData, companyLicense: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Company Address</label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Company Website</label>
                    <input
                      type="url"
                      placeholder="https://"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.companyWebsite}
                      onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Company X Account</label>
                    <input
                      type="text"
                      placeholder="@company"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.companyX}
                      onChange={(e) => setFormData({ ...formData, companyX: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Company Telegram</label>
                    <input
                      type="text"
                      placeholder="@company"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.companyTelegram}
                      onChange={(e) => setFormData({ ...formData, companyTelegram: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Company Discord</label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.companyDiscord}
                      onChange={(e) => setFormData({ ...formData, companyDiscord: e.target.value })}
                    />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white pt-4">Contact Person</h3>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.contactPersonName}
                      onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.contactPersonEmail}
                      onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                      value={formData.contactPersonPhone}
                      onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div className="space-y-6 border-t border-white/10 pt-6">
              <h2 className="text-2xl font-bold text-white">Additional Information</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Forecasted Number of Participants *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                    value={formData.forecastedParticipants || ''}
                    onChange={(e) => setFormData({ ...formData, forecastedParticipants: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-slate-400 mt-1">Estimated participants you can bring to the hunt</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Wallet Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="Solana wallet address"
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white font-mono"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  />
                  <p className="text-xs text-slate-400 mt-1">You can connect your wallet after approval</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-neo text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
