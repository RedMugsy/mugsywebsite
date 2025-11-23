import { useState } from 'react'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { motion } from 'framer-motion'

type Tier = 'free' | 'pathfinder' | 'keymaster'

export default function TreasureHuntRegistration() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    referralCode: ''
  })
  const [selectedTier, setSelectedTier] = useState<Tier>('free')
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  const tierPricing = {
    free: { sol: 0, label: 'Free' },
    pathfinder: { sol: 0.055, label: '0.055 SOL' },
    keymaster: { sol: 0.11, label: '0.11 SOL' }
  }

  const getDiscountedPrice = (tier: Tier) => {
    const basePrice = tierPricing[tier].sol
    if (formData.referralCode.trim() && tier !== 'free') {
      return basePrice * 0.75 // 25% discount
    }
    return basePrice
  }

  const connectWallet = async () => {
    // Placeholder for wallet connection
    // In production, integrate with @solana/wallet-adapter-react
    try {
      if ((window as any).solana?.isPhantom) {
        const response = await (window as any).solana.connect()
        setWalletAddress(response.publicKey.toString())
        setWalletConnected(true)
      } else {
        alert('Please install a Solana wallet (Phantom, Backpack, Trust Wallet, etc.)')
      }
    } catch (err) {
      console.error('Wallet connection failed:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields')
      return
    }

    if (selectedTier !== 'free' && !walletConnected) {
      alert('Please connect your wallet to continue with a paid tier')
      return
    }

    // Handle payment and submission
    console.log('Form submitted:', { ...formData, selectedTier, walletAddress })

    // In production: Send to API, process payment, etc.
    alert(`Registration submitted! ${selectedTier !== 'free' ? `Payment of ${getDiscountedPrice(selectedTier)} SOL will be processed.` : 'Welcome to the free tier!'}`)
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 antialiased relative overflow-x-hidden">
      <SiteHeader />

      <main className="relative pt-8 pb-24 sm:pt-12 sm:pb-32 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              Join the Hunt
            </h1>
            <p className="text-xl text-slate-300">
              Fill in your details and choose your path
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Registration Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="card space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Your Details</h2>

                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                    First Name <span className="text-[#ff1a4b]">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name <span className="text-[#ff1a4b]">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address <span className="text-[#ff1a4b]">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                    Mobile Phone Number <span className="text-[#ff1a4b]">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Connect Your Wallet {selectedTier !== 'free' && <span className="text-[#ff1a4b]">*</span>}
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    Backpack, Phantom, Trust Wallet, or any compatible Solana wallet
                  </p>
                  {walletConnected ? (
                    <div className="rounded-lg bg-green-900/20 border border-green-500/30 px-4 py-3">
                      <p className="text-green-400 text-sm">
                        ✓ Wallet Connected
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-mono truncate">
                        {walletAddress}
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={connectWallet}
                      className="w-full rounded-lg bg-gradient-to-r from-[#ff1a4b] to-[#00F0FF] px-4 py-3 font-semibold text-black hover:opacity-90 transition"
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor="referralCode" className="block text-sm font-medium text-slate-300 mb-2">
                    Referral Code (Optional)
                  </label>
                  <p className="text-xs text-green-400 mb-2">
                    Enter a referral code for 25% discount on paid tiers
                  </p>
                  <input
                    id="referralCode"
                    type="text"
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#00F0FF] focus:outline-none"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-neo text-lg py-4 mt-6"
                >
                  Submit Registration
                </button>
              </form>
            </motion.div>

            {/* Tier Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="card">
                <h2 className="text-3xl font-bold text-white mb-2">Choose Your Path</h2>
                <p className="text-slate-300 mb-6">
                  Pick your role in the Hunt.<br />
                  More risk, more edge, more power.
                </p>

                {/* Tier Options */}
                <div className="space-y-4">
                  {/* Free Loader */}
                  <div
                    onClick={() => setSelectedTier('free')}
                    className={`cursor-pointer rounded-lg border-2 p-5 transition ${
                      selectedTier === 'free'
                        ? 'border-[#ff1a4b] bg-[#ff1a4b]/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🪫</span>
                        <h3 className="text-xl font-bold text-white">Free Loader</h3>
                      </div>
                      <span className="text-lg font-bold text-[#00F0FF]">Free</span>
                    </div>
                    <p className="text-sm text-slate-400 italic mb-3">
                      For the purists. No crutches. No mercy.
                    </p>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• 0 Minutes Head Start</li>
                      <li>• No Mugsy Whispers (no hints)</li>
                      <li>• 1 Try per clue</li>
                      <li>• Free entry</li>
                    </ul>
                  </div>

                  {/* Pathfinder */}
                  <div
                    onClick={() => setSelectedTier('pathfinder')}
                    className={`cursor-pointer rounded-lg border-2 p-5 transition ${
                      selectedTier === 'pathfinder'
                        ? 'border-[#ff1a4b] bg-[#ff1a4b]/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🧭</span>
                        <h3 className="text-xl font-bold text-white">Pathfinder</h3>
                      </div>
                      <div className="text-right">
                        {formData.referralCode.trim() && (
                          <div className="text-xs text-slate-400 line-through">0.055 SOL</div>
                        )}
                        <span className="text-lg font-bold text-[#00F0FF]">
                          {getDiscountedPrice('pathfinder')} SOL
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 italic mb-3">
                      For the ones who want an edge, not a cheat code.
                    </p>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• 12 Hours Head Start on the Hunt</li>
                      <li>• 3 Mugsy Whispers for the entire Hunt</li>
                      <li>• 3 Tries per clue</li>
                    </ul>
                  </div>

                  {/* Key Master */}
                  <div
                    onClick={() => setSelectedTier('keymaster')}
                    className={`cursor-pointer rounded-lg border-2 p-5 transition ${
                      selectedTier === 'keymaster'
                        ? 'border-[#ff1a4b] bg-[#ff1a4b]/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🔑</span>
                        <h3 className="text-xl font-bold text-white">Key Master</h3>
                      </div>
                      <div className="text-right">
                        {formData.referralCode.trim() && (
                          <div className="text-xs text-slate-400 line-through">0.11 SOL</div>
                        )}
                        <span className="text-lg font-bold text-[#00F0FF]">
                          {getDiscountedPrice('keymaster')} SOL
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 italic mb-3">
                      For the ones who want every possible advantage.
                    </p>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• 36 Hours Head Start on the Hunt</li>
                      <li>• 1 Mugsy Whisper per Cipher (10 total)</li>
                      <li>• Unlimited Tries per clue</li>
                      <li>• Skip up to 3 clues during the Hunt</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="card overflow-x-auto">
                <h3 className="text-xl font-bold text-white mb-4">Feature Comparison</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-2 text-slate-300 font-semibold">Feature</th>
                      <th className="text-center py-3 px-2 text-slate-300 font-semibold">🪫 Free</th>
                      <th className="text-center py-3 px-2 text-slate-300 font-semibold">🧭 Path</th>
                      <th className="text-center py-3 px-2 text-slate-300 font-semibold">🔑 Master</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-2">Head Start</td>
                      <td className="text-center py-3 px-2">0 min</td>
                      <td className="text-center py-3 px-2">12 hrs</td>
                      <td className="text-center py-3 px-2">36 hrs</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-2">Mugsy Whispers</td>
                      <td className="text-center py-3 px-2">0</td>
                      <td className="text-center py-3 px-2">3 total</td>
                      <td className="text-center py-3 px-2">1 per cipher</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-2">Attempts per Clue</td>
                      <td className="text-center py-3 px-2">1</td>
                      <td className="text-center py-3 px-2">3</td>
                      <td className="text-center py-3 px-2">Unlimited</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-2">Clue Skips</td>
                      <td className="text-center py-3 px-2">None</td>
                      <td className="text-center py-3 px-2">None</td>
                      <td className="text-center py-3 px-2">3 skips</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-2">Difficulty</td>
                      <td className="text-center py-3 px-2">Brutal</td>
                      <td className="text-center py-3 px-2">Sharp</td>
                      <td className="text-center py-3 px-2">Optimized</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 font-semibold">Cost</td>
                      <td className="text-center py-3 px-2 font-bold text-[#00F0FF]">Free</td>
                      <td className="text-center py-3 px-2 font-bold text-[#00F0FF]">0.055 SOL</td>
                      <td className="text-center py-3 px-2 font-bold text-[#00F0FF]">0.11 SOL</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
