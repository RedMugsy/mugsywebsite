import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { motion } from 'framer-motion'

export default function TreasureHunt() {
  return (
    <div className="min-h-screen bg-black text-slate-200 antialiased relative overflow-x-hidden">
      {/* NAV */}
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 overflow-visible min-h-[90vh] px-6 sm:px-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-80 w-80 bg-[#ff1a4b]/20 blur-3xl rounded-full animate-[blob_16s_ease-in-out_infinite]" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 bg-[#00F0FF]/20 blur-3xl rounded-full animate-[blob_18s_ease-in-out_infinite]" />
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight"
          >
            WELCOME TO THE
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff1a4b] to-[#00F0FF]"
            style={{ fontSize: 'clamp(3rem, 14vw, 11rem)', lineHeight: 0.9 }}
          >
            THE RED MUGSY TREASURE HUNT
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <p className="text-xl sm:text-2xl text-white font-semibold">
              Red Mugsy didn't create a treasure hunt —<br />
              he buried a full-on treasure trove.
            </p>

            <div className="text-lg sm:text-xl text-slate-300 space-y-4">
              <p>Think you're a chart-whisperer?</p>
              <p>Staring at candles like you're Nostradamus with a TradingView addiction?</p>
              <p className="text-white font-bold text-2xl">Good. Prove it.</p>
            </div>

            <div className="text-lg text-slate-300 space-y-3 pt-4">
              <p>Join the biggest Treasure Hunt ever on X.</p>
              <p>Sign up, crack the clues, break the ciphers, and fight your way through each level.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto">
              <div className="card card--red-ghost text-center">
                <div className="text-7xl font-bold text-[#ff1a4b]">10</div>
                <div className="text-sm text-slate-300 mt-2">Ciphers</div>
              </div>
              <div className="card card--red-ghost text-center">
                <div className="text-7xl font-bold text-[#00F0FF]">100+</div>
                <div className="text-sm text-slate-300 mt-2">Clues</div>
              </div>
              <div className="card card--red-ghost text-center">
                <div className="text-7xl font-bold text-white">Dozens</div>
                <div className="text-sm text-slate-300 mt-2">Side Challenges</div>
              </div>
            </div>

            <p className="text-xl text-white font-semibold pt-6">
              Only the sharpest make it out with the prize.
            </p>
          </motion.div>

          {/* Hero Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-8"
          >
            <a href="#/treasure-hunt/register" className="btn-neo text-lg sm:text-2xl px-10 py-5 inline-block">
              JOIN THE HUNT
            </a>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 - PRIZES */}
      <section id="prizes" className="relative min-h-[60vh] pt-8 pb-20 sm:pt-12 sm:pb-24 px-6 sm:px-10 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-6xl font-bold text-white">Prizes - For those of you who Survive.</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Every time you successfully solve a Cipher,<br />
              you earn one entry into a draw for <span className="text-[#ff1a4b] font-bold">1,000,000 $MUGSY Tokens</span>.<br />
              The more ciphers you crack, the more chances you get.
            </p>
          </div>

          {/* Prize Cards */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            {/* First Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="card bg-gradient-to-br from-[#ff1a4b]/20 to-[#ff1a4b]/5 border-[#ff1a4b]"
            >
              <div className="text-6xl mb-4">🥇</div>
              <h3 className="text-2xl font-bold text-white mb-4">First Place</h3>
              <ul className="space-y-3 text-slate-200">
                <li className="text-xl font-bold text-[#ff1a4b]">$4,000 USDT (Cash)</li>
                <li className="text-lg">4,000,000 $MUGSY Tokens</li>
                <li>Automatic Admission to Mugsy Hunt II</li>
                <li>1 Year TradingView Premium Subscription</li>
              </ul>
            </motion.div>

            {/* Second Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card bg-gradient-to-br from-[#00F0FF]/20 to-[#00F0FF]/5 border-[#00F0FF]"
            >
              <div className="text-6xl mb-4">🥈</div>
              <h3 className="text-2xl font-bold text-white mb-4">Second Place</h3>
              <ul className="space-y-3 text-slate-200">
                <li className="text-xl font-bold text-[#00F0FF]">$2,500 USDT (Cash)</li>
                <li className="text-lg">2,500,000 $MUGSY Tokens</li>
                <li>Automatic Admission to Mugsy Hunt II</li>
                <li>6 Months TradingView Premium Subscription</li>
              </ul>
            </motion.div>

            {/* Third Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card bg-gradient-to-br from-white/20 to-white/5 border-white/30"
            >
              <div className="text-6xl mb-4">🥉</div>
              <h3 className="text-2xl font-bold text-white mb-4">Third Place</h3>
              <ul className="space-y-3 text-slate-200">
                <li className="text-xl font-bold text-white">$1,000 USDT (Cash)</li>
                <li className="text-lg">1,000,000 $MUGSY Tokens</li>
                <li>Automatic Admission to Mugsy Hunt II</li>
                <li>3 Months TradingView Premium Subscription</li>
              </ul>
            </motion.div>
          </div>

          {/* Additional Prize Tiers */}
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="card"
            >
              <div className="text-5xl mb-3">🏅</div>
              <h3 className="text-xl font-bold text-white mb-3">4th – 10th Place</h3>
              <ul className="space-y-2 text-slate-200">
                <li>50% off Admission to Mugsy Hunt II</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card"
            >
              <div className="text-5xl mb-3">🎖️</div>
              <h3 className="text-xl font-bold text-white mb-3">11th – 20th Place</h3>
              <ul className="space-y-2 text-slate-200">
                <li>25% off Admission to Mugsy Hunt II</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="card"
            >
              <div className="text-5xl mb-3">💎</div>
              <h3 className="text-xl font-bold text-white mb-3">20th – 500th Place</h3>
              <ul className="space-y-2 text-slate-200">
                <li>200,000 $MUGSY Tokens Each</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
            >
              <div className="text-5xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-white mb-3">500th – 2,500th Place</h3>
              <ul className="space-y-2 text-slate-200">
                <li>50,000 $MUGSY Tokens Each</li>
              </ul>
            </motion.div>
          </div>

          {/* Button under prizes */}
          <div className="text-center pt-8">
            <a href="#/treasure-hunt/register" className="btn-buy text-lg sm:text-xl px-8 py-4 inline-block">
              CRACK THE FIRST CIPHER
            </a>
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-[#ff1a4b]/40 to-transparent" />
      </section>

      {/* SECTION 3 - WHY JOIN */}
      <section id="why-join" className="relative min-h-[60vh] pt-8 pb-20 sm:pt-12 sm:pb-24 px-6 sm:px-10 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-6xl font-bold text-white">
              WHY JOIN THE RED MUGSY TREASURE HUNT
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              This isn't just another contest — it's a full-blown mental gauntlet built for traders, puzzle-solvers, and chaos enjoyers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card"
            >
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-2xl font-semibold text-white mb-3">Test Your Skills</h3>
              <p className="text-slate-300">
                Charts, riddles, logic, speed — the Hunt challenges all the instincts that define a real market predator.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-2xl font-semibold text-white mb-3">Win Big (Even If You Don't Win First Place)</h3>
              <p className="text-slate-300">
                Every cipher cracked earns you a shot at 1M $MUGSY Tokens.<br />
                Progress = more entries = more chances.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-2xl font-semibold text-white mb-3">Compete With the Sharpest Minds on X</h3>
              <p className="text-slate-300">
                This isn't for luck players.<br />
                You'll be racing against analysts, coders, meme-lords, and pure-bred degenerates.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-2xl font-semibold text-white mb-3">Earn Your Spot in Mugsy Hunt II</h3>
              <p className="text-slate-300">
                Top-ranking players get automatic admission into the sequel — a flex that sets you apart.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="card md:col-span-2"
            >
              <div className="text-4xl mb-3">🎖</div>
              <h3 className="text-2xl font-semibold text-white mb-3">Unlock Exclusive Rewards</h3>
              <p className="text-slate-300">
                Cash, tokens, premium tools, prestige roles — the Hunt rewards both skill and persistence.
              </p>
            </motion.div>
          </div>

          <div className="text-center pt-8">
            <p className="text-2xl text-white font-bold">
              If you think you've got the brainpower, the instincts, and the guts…<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff1a4b] to-[#00F0FF]">
                Welcome to the arena.
              </span>
            </p>
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-[#ff1a4b]/40 to-transparent" />
      </section>

      {/* SECTION 4 - FAQ */}
      <section id="faq" className="relative min-h-[60vh] pt-8 pb-20 sm:pt-12 sm:pb-24 px-6 sm:px-10 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-slate-400">READ BEFORE DIVING IN</p>
            <h2 className="text-4xl sm:text-6xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-8">
            {[
              {
                q: "How do I join the Red Mugsy Treasure Hunt?",
                a: "Click the Enter the Hunt button at the top of the page, sign up, and you'll receive your first clue."
              },
              {
                q: "Is the Treasure Hunt free to join?",
                a: "Yes. The hunt is completely free — all you need is curiosity, focus, and a willingness to outsmart the competition."
              },
              {
                q: "How do the ciphers and clues work?",
                a: "Each cipher contains multiple clues. Solve the clues to unlock the cipher. Solve the cipher to advance to the next level. There are 10 ciphers total, each progressively harder."
              },
              {
                q: "What happens if I solve only some of the ciphers?",
                a: "Every cipher you solve earns you one entry into a draw for 1,000,000 $MUGSY Tokens. The more you solve, the more chances you have."
              },
              {
                q: "How are the winners chosen?",
                a: "Top 3 winners are determined by speed + accuracy + complete progression. The token draw is separate and based on entries earned."
              },
              {
                q: "What is \"Automatic Admission to Mugsy Hunt II\"?",
                a: "Top winners get guaranteed entry into the next Treasure Hunt — no waitlists, no requirements, instant access."
              },
              {
                q: "When will the winners be announced?",
                a: "Announcements will be published on X and Telegram immediately after all ciphers are completed and validated."
              },
              {
                q: "Do I need TradingView to participate?",
                a: "No — but TradingView Premium is one of the top prizes, so it's a powerful reward for serious traders."
              },
              {
                q: "How hard is the Treasure Hunt?",
                a: "It's challenging by design. But every level is solvable with logic, patience, and attention. This is a battle of wits — not random luck."
              },
              {
                q: "Who can participate?",
                a: "Anyone. Across any country. All you need is an X account and a brain that enjoys a challenge."
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
      </section>

      {/* PROMOTER SECTION */}
      <section className="relative py-12 px-6 sm:px-10 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center space-y-4">
          <p className="text-slate-300 text-lg">
            Want to help grow the Red Mugsy Treasure Hunt?
          </p>
          <a
            href="#/treasure-hunt/promoter-register"
            className="inline-block text-[#ff1a4b] hover:text-[#00F0FF] font-semibold text-xl transition-colors underline"
          >
            Register as a Promoter
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter />
    </div>
  )
}
