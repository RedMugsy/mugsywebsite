import { useState, useEffect } from 'react'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function TreasureHuntPromoters() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  // Wallet connection state
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [connectingWallet, setConnectingWallet] = useState(false)

  // Terms & Conditions state
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Check if user has already accepted terms (using localStorage for demo)
  useEffect(() => {
    const accepted = localStorage.getItem('promoterTermsAccepted')
    if (accepted === 'true') {
      setTermsAccepted(true)
    } else {
      // Show terms modal on first login
      setShowTermsModal(true)
    }
  }, [])

  const handleConnectWallet = async () => {
    setConnectingWallet(true)
    try {
      // Check if Terms are accepted first
      if (!termsAccepted) {
        alert('Please accept the Terms & Conditions first.')
        setShowTermsModal(true)
        setConnectingWallet(false)
        return
      }

      // Phantom wallet integration (example)
      if ('solana' in window) {
        const provider = (window as any).solana
        if (provider?.isPhantom) {
          const resp = await provider.connect()
          setWalletAddress(resp.publicKey.toString())
          setWalletConnected(true)
        } else {
          alert('Phantom wallet not found. Please install Phantom wallet extension.')
        }
      } else {
        alert('Please install a Solana wallet (Phantom, Backpack, or Trust Wallet).')
      }
    } catch (err) {
      console.error('Wallet connection error:', err)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setConnectingWallet(false)
    }
  }

  const handleAcceptTerms = () => {
    localStorage.setItem('promoterTermsAccepted', 'true')
    setTermsAccepted(true)
    setShowTermsModal(false)
  }

  // Sample data for demonstration - in production, this would come from an API
  const referralCode = 'PROMO123'
  const totalReferrals = 487

  // Pie chart data
  const tierData = [
    { name: 'Free Loader', value: 145, color: '#888888' },
    { name: 'Pathfinder', value: 212, color: '#ff1a4b' },
    { name: 'Key Master', value: 130, color: '#00F0FF' }
  ]

  // Stacked bar chart data (last 7 days)
  const dailySignups = [
    { date: 'Nov 17', free: 12, pathfinder: 18, keymaster: 9 },
    { date: 'Nov 18', free: 15, pathfinder: 22, keymaster: 11 },
    { date: 'Nov 19', free: 19, pathfinder: 28, keymaster: 15 },
    { date: 'Nov 20', free: 21, pathfinder: 31, keymaster: 18 },
    { date: 'Nov 21', free: 17, pathfinder: 25, keymaster: 13 },
    { date: 'Nov 22', free: 23, pathfinder: 35, keymaster: 21 },
    { date: 'Nov 23', free: 38, pathfinder: 53, keymaster: 43 }
  ]

  // Calculate earnings
  const paidHunters = tierData[1].value + tierData[2].value // Pathfinder + Key Master
  const milestones = Math.floor(paidHunters / 2000)
  const earnings = milestones * 1000
  const nextMilestone = ((milestones + 1) * 2000) - paidHunters

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form submitted:', contactForm)
    alert('Your inquiry has been submitted! We\'ll get back to you soon.')
    setContactForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 antialiased relative overflow-x-hidden">
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="relative pt-8 pb-24 sm:pt-12 sm:pb-32 overflow-visible min-h-[70vh] px-6 sm:px-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-80 w-80 bg-[#ff1a4b]/20 blur-3xl rounded-full animate-[blob_16s_ease-in-out_infinite]" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 bg-[#00F0FF]/20 blur-3xl rounded-full animate-[blob_18s_ease-in-out_infinite]" />
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight"
          >
            Welcome to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff1a4b] to-[#00F0FF]">
              Red Mugsy Treasure Hunt
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto"
          >
            Promoters Dashboard
          </motion.p>

          {/* Wallet Connection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6"
          >
            {!walletConnected ? (
              <button
                onClick={handleConnectWallet}
                disabled={connectingWallet}
                className="btn-neo text-lg sm:text-xl px-8 py-4 inline-block"
              >
                {connectingWallet ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="card inline-block bg-gradient-to-r from-[#ff1a4b]/20 to-[#00F0FF]/20 border-[#00F0FF]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#00F0FF] rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm text-slate-400">Connected Wallet</p>
                    <p className="text-white font-mono text-sm">
                      {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* DASHBOARD SECTION */}
      <section className="relative min-h-[60vh] pt-8 pb-20 sm:pt-12 sm:pb-24 px-6 sm:px-10 max-w-7xl mx-auto">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-6xl font-bold text-white">Your Dashboard</h2>
            <p className="text-xl text-slate-300">
              Track your impact and earnings
            </p>
          </div>

          {/* Referral Code & Key Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card bg-gradient-to-br from-[#ff1a4b]/20 to-[#ff1a4b]/5 border-[#ff1a4b]"
            >
              <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Your Referral Code</h3>
              <p className="text-3xl font-bold text-white font-mono mb-3">{referralCode}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralCode)
                  alert('Referral code copied!')
                }}
                className="text-sm text-[#00F0FF] hover:underline"
              >
                Copy Code
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Total Referrals</h3>
              <p className="text-5xl font-bold text-white mb-2">{totalReferrals}</p>
              <p className="text-sm text-slate-400">Treasure Hunters using your code</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card bg-gradient-to-br from-[#00F0FF]/20 to-[#00F0FF]/5 border-[#00F0FF]"
            >
              <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Your Earnings</h3>
              <p className="text-5xl font-bold text-white mb-2">${earnings.toLocaleString()}</p>
              <p className="text-sm text-slate-400">{nextMilestone} paid hunters to next $1K</p>
            </motion.div>
          </div>

          {/* Earnings Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card bg-gradient-to-br from-[#ff1a4b]/10 to-[#00F0FF]/10 border-[#ff1a4b]/30"
          >
            <h3 className="text-xl font-bold text-white mb-3">💰 How Promoter Earnings Work</h3>
            <p className="text-slate-300 mb-4">
              For every <strong className="text-white">2,000 paid Treasure Hunters</strong> (Pathfinders + Key Masters) who use your referral code,
              you earn <strong className="text-[#00F0FF]">$1,000</strong>.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-2">Current Progress:</p>
                <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-semibold">Paid Hunters: {paidHunters}</p>
                  <p className="text-slate-400">Free Loaders: {tierData[0].value} (don't count)</p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 mb-2">Milestone Status:</p>
                <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-semibold">Milestones Hit: {milestones}</p>
                  <p className="text-[#00F0FF] font-semibold">Total Earned: ${earnings.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pie Chart - Tier Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Hunter Tier Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f1115', border: '1px solid #333', borderRadius: 8, color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-2">
                {tierData.map((tier, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: tier.color }} />
                      <span className="text-slate-300">{tier.name}</span>
                    </div>
                    <span className="text-white font-semibold">{tier.value} hunters</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bar Chart - Daily Signups */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Daily Signups (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySignups}>
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#0f1115', border: '1px solid #333', borderRadius: 8, color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="free" stackId="a" fill="#888888" name="Free Loader" />
                  <Bar dataKey="pathfinder" stackId="a" fill="#ff1a4b" name="Pathfinder" />
                  <Bar dataKey="keymaster" stackId="a" fill="#00F0FF" name="Key Master" />
                </BarChart>
              </ResponsiveContainer>

              <p className="text-sm text-slate-400 mt-4">
                Total signups this week: <span className="text-white font-semibold">
                  {dailySignups.reduce((sum, day) => sum + day.free + day.pathfinder + day.keymaster, 0)}
                </span>
              </p>
            </motion.div>
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-[#ff1a4b]/40 to-transparent" />
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative min-h-[60vh] pt-8 pb-20 sm:pt-12 sm:pb-24 px-6 sm:px-10 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-slate-400">PROMOTERS</p>
            <h2 className="text-4xl sm:text-6xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-8">
            {[
              {
                q: "How do I get my referral code?",
                a: "Your unique referral code is assigned when you sign up as a promoter. Share it with your audience to start earning."
              },
              {
                q: "When do I get paid?",
                a: "Payments are processed automatically every time you hit a 2,000 paid hunter milestone. Earnings are sent within 7 business days."
              },
              {
                q: "Do Free Loaders count toward my earnings?",
                a: "No. Only paid tiers (Pathfinder and Key Master) count toward your 2,000 hunter milestones."
              },
              {
                q: "How can I track my referrals?",
                a: "Your dashboard shows real-time stats including total referrals, tier breakdown, daily signups, and earnings progress."
              },
              {
                q: "Can I promote on any platform?",
                a: "Yes! Share your referral code on X, Telegram, Discord, YouTube, or any other platform where your audience is."
              },
              {
                q: "Is there a limit to how much I can earn?",
                a: "No. You earn $1,000 for every 2,000 paid hunters — there's no cap on your earnings."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card"
              >
                <details className="group cursor-pointer">
                  <summary className="font-semibold text-white flex items-center justify-between list-none">
                    <span className="text-lg">{faq.q}</span>
                    <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform text-2xl">⌄</span>
                  </summary>
                  <p className="mt-4 text-slate-300 text-base leading-relaxed">{faq.a}</p>
                </details>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-[#ff1a4b]/40 to-transparent" />
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="relative pt-8 pb-20 sm:pt-12 sm:pb-24 px-6 sm:px-10 max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-6xl font-bold text-white">Submit Inquiries</h2>
            <p className="text-xl text-slate-300">
              Have questions? We're here to help.
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleContactSubmit}
            className="card space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Name <span className="text-[#ff1a4b]">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email <span className="text-[#ff1a4b]">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                Subject <span className="text-[#ff1a4b]">*</span>
              </label>
              <input
                id="subject"
                type="text"
                required
                className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Message <span className="text-[#ff1a4b]">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={6}
                className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:border-[#ff1a4b] focus:outline-none resize-none"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full btn-neo text-lg py-4"
            >
              Send Inquiry
            </button>
          </motion.form>
        </div>
      </section>

      <SiteFooter />

      {/* TERMS & CONDITIONS MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-black border border-[#ff1a4b]/30 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
          >
            <div className="p-6 sm:p-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Terms & Conditions
              </h2>
              <p className="text-slate-300 mb-6">
                Red Mugsy Treasure Hunt - Promoter Agreement
              </p>

              <div className="bg-black/40 border border-white/10 rounded-lg p-6 max-h-96 overflow-y-auto space-y-4 text-slate-300 text-sm">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">1. Promoter Responsibilities</h3>
                  <p>
                    As a Red Mugsy Treasure Hunt Promoter, you agree to promote the treasure hunt in good faith and comply with all applicable laws and regulations. You are responsible for accurately representing the treasure hunt and its terms to potential participants.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">2. Commission Structure</h3>
                  <p>
                    Promoters earn $1,000 USD for every 2,000 paid participants (Pathfinder and Key Master tiers only) who register using their unique referral code. Free Loader tier participants do not count toward commission milestones.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">3. Payment Terms</h3>
                  <p>
                    Commissions are paid within 7 business days after reaching each 2,000 paid participant milestone. Payments will be sent to your connected wallet address. You are responsible for maintaining accurate wallet information.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">4. Prohibited Activities</h3>
                  <p>
                    Promoters may not engage in fraudulent activities, spam, misleading advertising, or any practices that violate platform terms of service. Red Mugsy reserves the right to terminate promoter accounts and withhold commissions for violations.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">5. Code of Conduct</h3>
                  <p>
                    Promoters must maintain professional conduct and may not make false claims about prizes, odds, or treasure hunt mechanics. All promotional materials must be truthful and comply with advertising standards.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">6. Data Privacy</h3>
                  <p>
                    You acknowledge that Red Mugsy will collect and process data related to referrals and commissions. This data will be used solely for program administration and will be handled in accordance with our Privacy Policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">7. Termination</h3>
                  <p>
                    Either party may terminate this agreement at any time. Upon termination, you will receive payment for all qualified commissions earned up to the termination date. Pending commissions that have not reached the 2,000 participant threshold may be forfeited.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">8. Modifications</h3>
                  <p>
                    Red Mugsy reserves the right to modify these terms at any time. Promoters will be notified of material changes and continued participation constitutes acceptance of updated terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">9. Liability Limitation</h3>
                  <p>
                    Red Mugsy is not liable for any indirect, incidental, or consequential damages arising from participation in the promoter program. Your sole remedy is termination of this agreement.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">10. Agreement</h3>
                  <p className="text-white font-medium">
                    By clicking "I Accept," you confirm that you have read, understood, and agree to be bound by these Terms & Conditions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAcceptTerms}
                  className="flex-1 btn-neo text-lg py-3"
                >
                  I Accept
                </button>
                <button
                  onClick={() => {
                    alert('You must accept the Terms & Conditions to use the Promoters Dashboard.')
                  }}
                  className="px-6 py-3 rounded-lg border border-white/20 text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
