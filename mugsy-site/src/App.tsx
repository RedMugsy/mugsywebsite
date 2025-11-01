import { useEffect, useMemo, useState } from "react";

import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from 'react-i18next'
import Marquee from "react-fast-marquee";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

/* -------------------------------- Theme & Data -------------------------------- */
const COLORS = { neonRed: "#ff1a4b", neonBlue: "#00F0FF" };

type Slice = { name: string; value: number; color: string; amount: string };

const tokenomics: Slice[] = [
  { name: "Public Distribution", value: 60, color: COLORS.neonRed, amount: "828B" },
  { name: "Burn Reserve", value: 20, color: COLORS.neonBlue, amount: "276B" },
  { name: "Builder Pool", value: 10, color: "#ffffff", amount: "138B" },
  { name: "Operations", value: 10, color: "#888888", amount: "138B" },
];

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div
      style={{ scaleX }}
  className="fixed top-0 left-0 right-0 h-1 origin-left bg-gradient-to-r from-[#ff1a4b] to-[#00F0FF] z-40"
    />
  );
}

/* -------------------------------- Small atoms -------------------------------- */
function BackToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setShow(v > 600));
    return () => unsub();
  }, [scrollY]);
  return (
    <AnimatePresence>
      {show && (
        <><motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 rounded-full px-4 py-3 text-sm font-semibold text-black bg-gradient-to-r from-[#ff1a4b] to-[#00F0FF] shadow-lg"
        >
          ↑ Top
        </motion.button>
        <motion.img
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          src="img/Rabbit Face.png"
          alt="Rabbit face"
          className="fixed bottom-6 right-28 z-40 h-[3.75rem] w-[3.75rem] rounded-full shadow-lg pointer-events-none select-none drop-shadow-[0_0_10px_#ff1a4b66]"
          loading="lazy"
        /></>
      )}
    </AnimatePresence>
  );
}

/* --------------------------- 3D Coin (single object) -------------------------- */
/** Uses CSS classes defined in index.css:
  .coin3d, .coin3d-inner, .coin3d-face, .coin3d-front, .coin3d-back
  The inner wrapper spins; front/back are flipped 180deg so only one coin is visible at a time.
*/
function Coin3D({
  front = "img/mugsy-coin.png",
  back = "img/Golden and Black Coin Back.png",
  size = 120,
  speed = "7s",
  className = "",
}: {
  front?: string;
  back?: string;
  size?: number;
  speed?: string; // e.g. "7s"
  className?: string;
}) {
  return (
    <div
      className={`coin3d ${className}`}
      style={{ width: size, height: size } as React.CSSProperties}
      aria-hidden
    >
      <div className="coin3d-inner" style={{ animationDuration: speed }}>
        <div className="coin3d-face coin3d-front">
          <img src={front} alt="" loading="lazy" />
        </div>
        <div className="coin3d-face coin3d-back">
          <img src={back} alt="" loading="lazy" />
        </div>
      </div>
    </div>
  );
}

/* -------- Section with optional right-side header content (coin, etc.) -------- */
function Section({
  id,
  title,
  kicker,
  titleRight,
  children,
}: {
  id: string;
  title: string;
  kicker?: string;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative min-h-[60vh] pt-8 pb-20 sm:pt-12 sm:pb-24 px-6 sm:px-10 max-w-7xl mx-auto scroll-mt-28 sm:scroll-mt-40 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-start space-y-6"
      >
        {kicker && (
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-400">{kicker}</p>
        )}
        <div className="flex items-center justify-between gap-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-white">{title}</h2>
          {titleRight}
        </div>
        {children}
      </motion.div>
      <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-[#ff1a4b]/40 to-transparent" />
    </section>
  );
}

/* ----------------------------------- App ------------------------------------- */
export default function App() {
    const { t } = useTranslation()
  
  // Parallax blobs + magnetic CTA
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e: MouseEvent) =>
      setMouse({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);
  const parallaxStyle = useMemo(
    () => ({ transform: `translate3d(${mouse.x * 12}px, ${mouse.y * 12}px, 0)` }),
    [mouse]
  );

  return (
    <div className="min-h-screen bg-black text-slate-200 antialiased relative overflow-x-hidden">
      <ProgressBar />

      {/* Left vertical social icon rail (fixed) */}
      <div id="social-links" className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 w-16 flex-col items-center">
        {/* Vertical ribbon */}
        <div
          className="w-full mb-8 rounded-r-xl bg-gradient-to-b from-[#ff1a4b] to-[#00F0FF] shadow-[0_10px_30px_rgba(255,26,75,0.25),0_6px_18px_rgba(0,240,255,0.18)] border border-white/10"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'scaleY(1.30)', transformOrigin: 'center' } as React.CSSProperties}
        >
          <span className="block text-center font-extrabold tracking-widest text-black/90 py-3" style={{ fontSize: '76.5%' }}>Join Us</span>
        </div>
        {/* Icons */}
        <div className="flex flex-col items-center gap-4">
        <a
          href="https://x.com/RedMugsyToken"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-sphere icon-sphere--red"
          aria-label="X / Twitter"
          title="X / Twitter"
        >
          <img src="img/X logo White Trnsprt.png" alt="X logo" className="h-5 w-5" />
        </a>
        <a
          href="https://bsky.app/profile/redmugsy.bsky.social"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-sphere icon-sphere--red"
          aria-label="BlueSky"
          title="BlueSky"
        >
          <img src="img/bluesky logo White Trnsprt.png" alt="BlueSky logo" className="h-5 w-5" />
        </a>
        <a
          href="https://t.me/REDMUGSY"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-sphere icon-sphere--red"
          aria-label="Telegram"
          title="Telegram"
        >
          <img src="img/Telegram logo White Trnsprt.png" alt="Telegram logo" className="h-5 w-5" />
        </a>
        <a
          href="https://discord.gg/9GJcjKhaYj"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-sphere icon-sphere--red"
          aria-label="Discord"
          title="Discord"
        >
          <img src="img/Discord logo White Trnsprt.png" alt="Discord logo" className="h-5 w-5" />
        </a>
        <a
          href="https://www.tiktok.com/@redmugsytoken"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-sphere icon-sphere--red"
          aria-label="TikTok"
          title="TikTok"
        >
          <img src="img/TikTok logo White Trnsprt.png" alt="TikTok logo" className="h-5 w-5" />
        </a>
        <a
          href="https://www.instagram.com/redmugsy/"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-sphere icon-sphere--red"
          aria-label="Instagram"
          title="Instagram"
        >
          <img src="img/Instagram logo White Trnsprt.png" alt="Instagram logo" className="h-5 w-5" />
        </a>
        <a
          href="https://www.reddit.com/user/redmugsy/"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-sphere icon-sphere--red"
          aria-label="Reddit"
          title="Reddit"
        >
          <img src="img/Reddit logo White Trnsprt.png" alt="Reddit logo" className="h-5 w-5" />
        </a>
        </div>
      </div>

      {/* NAV */}
      <SiteHeader onHome />
      {/* Action buttons row (CTAs not part of the shared header) */}
      <div className="py-2 px-6">
        <div id="cta-group" className="max-w-7xl mx-auto flex items-center justify-end">
          <div id="cta-buttons" className="flex items-center gap-3 shrink-0">
            <a href="#buy" className="btn-buy" aria-label="Buy $MUGSY">Buy $MUGSY</a>
            {(((import.meta as any).env?.VITE_FEATURE_CLAIM || 'false') === 'true') && (
              <a href="/claim" className="btn-claim" aria-label="Claim $MUGSY">Claim $MUGSY</a>
            )}
          </div>
        </div>
      </div>

      {/* HERO */}
      <section
        id="hero"
        className="relative grid items-start justify-center pt-8 pb-24 sm:pt-12 sm:pb-32 overflow-visible min-h-[80vh]"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute -top-24 -left-24 h-80 w-80 bg-[#ff1a4b]/20 blur-3xl rounded-full animate-[blob_16s_ease-in-out_infinite]"
            style={parallaxStyle}
          />
          <div
            className="absolute -bottom-24 -right-24 h-80 w-80 bg-[#00F0FF]/20 blur-3xl rounded-full animate-[blob_18s_ease-in-out_infinite]"
            style={parallaxStyle}
          />
        </div>

        {/* Hero art - positioned to not overlay text on mobile */}
        <img
          src="img/mugsy-rabbit.webp"
          alt="Red Mugsy holding a mug"
          className="pointer-events-none select-none absolute right-2 top-2 w-20 sm:right-[10%] sm:top-16 sm:w-56 drop-shadow-[0_0_30px_#ff1a4b88] opacity-60 sm:opacity-100"
          style={{ scale: 0.7475 }}
        />
        <motion.img
          src="img/mugsy-ech042.webp"
          alt="Astronaut bunny with red mug"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: [-10, 8, -10], opacity: 0.6 }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="pointer-events-none select-none absolute left-2 bottom-2 w-16 sm:left-[15%] sm:bottom-16 sm:w-40 opacity-50 sm:opacity-80 drop-shadow-[0_0_22px_#00F0FF66]"
        />

        <div className="max-w-4xl px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
            <h1 className="glitch-text text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight break-words">
              {t('hero.title')}
            </h1>
          {/*
          <div className="relative inline-block select-none hidden">
            <h1 className="glitch-text text-5xl sm:text-7xl font-extrabold tracking-tight">
              MEET RED MUGSY
              <span className="emoji-neon-red" role="img" aria-label="rabbit face" aria-hidden="false">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ width: '1em', height: '1em', marginLeft: '0.25em' }}>
                  <g fill="currentColor">
                    <path d="M18 6c-4 0-8 7-8 14 0 5 3 9 6 9s6-4 6-9c0-7-2-14-4-14z"/>
                    <path d="M46 6c-2 0-4 7-4 14 0 5 3 9 6 9s6-4 6-9c0-7-4-14-8-14z"/>
                    <circle cx="32" cy="40" r="18"/>
                  </g>
                  <g fill="#0a0b0f">
                    <circle cx="26" cy="38" r="2"/>
                    <circle cx="38" cy="38" r="2"/>
                    <circle cx="32" cy="44" r="2"/>
                  </g>
                </svg>
              </span>
              ☕
            </h1>
          </div>
          */}

          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight">
            {t("hero.subtitle")}
          </p>

          <div className="text-slate-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <p className="text-[110%] sm:text-[125%] leading-relaxed">
              <strong className="text-white">Red Mugsy is all of us</strong>—the ones three espressos past coherent thought and seventeen rabbit holes deep into whitepapers, charts, and conspiracy-level Twitter threads.
            </p>
            <p className="text-[110%] sm:text-[125%] leading-relaxed">
              He's a twitchy, witty, unhinged white rabbit clutching a Red Mug like it personally shorted his portfolio—running on equal parts caffeine and delusion.
            </p>
            <p className="text-[130%] sm:text-[150%] leading-tight">
              <strong className="text-[#ff1a4b]">He either cracked the code... or just cracked.</strong>
            </p>
            
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button  className="btn-neo">{t('hero.cta_primary')}</button>
            <a href="#tokenomics" className="btn-ghost">{t('hero.cta_secondary')}</a>
          </div>

          {/* dual marquees */}
          <div className="mt-8 space-y-3">
            <Marquee gradient={false} speed={60} className="opacity-90">
              <span className="mx-6 tracking-[0.2em] uppercase text-sm">LP Burned</span>
              <span className="mx-6 tracking-[0.2em] uppercase text-sm" style={{ color: "#ff1a4b" }}>
                Authorities Revoked
              </span>
              <span className="mx-6 tracking-[0.2em] uppercase text-sm" style={{ color: "#00F0FF" }}>
                0% Fees Forever
              </span>
              <span className="mx-6 tracking-[0.2em] uppercase text-sm">9-Year Builder Vest</span>
            </Marquee>
            <Marquee gradient={false} speed={50} direction="right" className="opacity-80">
              <span className="mx-6 tracking-[0.2em] uppercase text-sm">60% Public</span>
              <span className="mx-6 tracking-[0.2em] uppercase text-sm">20% Burn Reserve</span>
              <span className="mx-6 tracking-[0.2em] uppercase text-sm">10% Builder (9yr vest)</span>
              <span className="mx-6 tracking-[0.2em] uppercase text-sm">10% Operations</span>
            </Marquee>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <Section id="about" title={t('sections.about.title')} kicker={t('sections.about.kicker')}>
        <div className="mb-6">
          <p className="text-lg font-semibold text-white">He's not your guru. He's not your hero.</p>
          <p className="text-slate-300">He's the guy making jokes about his own disaster while yours is still loading.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 text-slate-300">
            <p className="text-lg leading-relaxed">
              <strong className="text-white">Red Mugsy weaponizes self-deprecation:</strong>
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><span className="text-[#ff1a4b] font-bold">☕</span><span>Drinks coffee like it owes him money—and an apology</span></li>
              <li className="flex gap-3"><span className="text-[#ff1a4b] font-bold">📉</span><span>Turns catastrophic trades into stand-up material</span></li>
              <li className="flex gap-3"><span className="text-[#ff1a4b] font-bold">😏</span><span>Makes you laugh at disasters before your own finishes loading</span></li>
              <li className="flex gap-3"><span className="text-[#ff1a4b] font-bold">🎭</span><span>Offers no platitudes—just solidarity through shared, hilarious suffering</span></li>
            </ul>
            <div className="card card--red-ghost space-y-3 mt-6">
              <h3 className="text-lg font-semibold text-white">He's for everyone who:</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Bought the dip with their last $500 and is now explaining modern portfolio theory to their bank app</li>
                <li>• Knows at 3 a.m. that THIS project might actually be different (narrator: it's not)</li>
                <li>• Lost spectacularly, came back anyway—apparently pain is a teaching method they're committed to</li>
                <li>• Should probably know better by now but finds "better" suspiciously boring</li>
              </ul>
              <p className="text-white font-semibold pt-2">
                Red Mugsy is all of us: chronically online, terminally optimistic, catastrophically funny.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <img
              src="img/RedMugsy Home Office Trading.png"
              alt="Red Mugsy at home office trading"
              loading="lazy"
              className="w-full max-w-md rounded-xl shadow-2xl drop-shadow-[0_0_24px_#ff1a4b55]"
            />
          </div>
        </div>

        {/* Meet Ech042 Section */}
        <div className="mt-12 pt-8 border-t border-[#ff1a4b]/20">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-center justify-center order-2 md:order-1">
              <img
                src="img/ECH042 Profile Pic.png"
                alt="Ech042 AI Barista Profile"
                loading="lazy"
                className="w-full max-w-md rounded-xl shadow-2xl drop-shadow-[0_0_24px_#00F0FF55]"
              />
            </div>
            
            <div className="space-y-4 text-slate-300 order-1 md:order-2">
              <h3 className="text-3xl sm:text-5xl font-bold text-white mb-4">Meet Ech042</h3>
              <p className="text-lg text-[#ff1a4b] font-semibold mb-6">The AI Barista Who Enables Bad Decisions</p>
              
              <p className="text-lg leading-relaxed">
                <strong className="text-white">Who Is Ech042?</strong>
              </p>
              <p className="leading-relaxed mb-4">
                He's not your therapist. He's not your life coach.<br />
                He's the guy serving you coffee at 3 a.m. while you explain why THIS trade is different—and he's writing it all down for the group chat.
              </p>
              <p className="text-lg leading-relaxed">
                <strong className="text-white">Ech042 specializes in truth with foam art:</strong>
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3"><span className="text-[#ff1a4b] font-bold">☕</span><span>Serves coffee and reality checks in equal measure</span></li>
                <li className="flex gap-3"><span className="text-[#ff1a4b] font-bold">🎤</span><span>Former stand-up comedian (quit when he realized hecklers tip better)</span></li>
                <li className="flex gap-3"><span className="text-[#ff1a4b] font-bold">🤖</span><span>Third-generation barista code—first to roast you before your espresso</span></li>
                <li className="flex gap-3"><span className="text-[#ff1a4b] font-bold">📝</span><span>Remembers EVERYTHING (your worst trades, your 4 a.m. takes, that thing you hoped he forgot)</span></li>
                <li className="flex gap-3"><span className="text-[#ff1a4b] font-bold">🧠</span><span>Translates Red Mugsy's chaos into something the community can actually understand</span></li>
              </ul>
              <div className="card card--red-ghost space-y-3 mt-6">
                <h4 className="text-lg font-semibold text-white">He's for everyone who needs:</h4>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• A reality check served with their morning espresso (and a side of brutal honesty)</li>
                  <li>• Someone who remembers their trading disasters better than they do</li>
                  <li>• Translation services for Red Mugsy's 4 a.m. epiphanies into actionable community insights</li>
                  <li>• A barista who roasts beans AND bad financial decisions with equal expertise</li>
                </ul>
                <p className="text-white font-semibold pt-2">
                  Ech042 is the voice of reason you didn't ask for but definitely need—caffeinated, comedic, and brutally honest.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About CTA centered at the bottom */}
        <div className="mt-10 flex justify-center">
          <a href="#social-links" className="btn-claim" aria-label="Join our Community">Join our Community</a>
        </div>
      </Section>

      {/* WHY RED MUGSY */}
      <Section id="why" title="Why Crypto Needed a Comedian" kicker="The Real Talk">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card card--red-ghost"><h3 className="text-lg font-semibold mb-2 text-white">🐕 Dogs</h3><p className="text-slate-300 text-sm">Saying "much wow" your way to riches</p></div>
          <div className="card card--red-ghost"><h3 className="text-lg font-semibold mb-2 text-white">🐸 Frogs</h3><p className="text-slate-300 text-sm">Manifesting inner peace and vibes</p></div>
          <div className="card card--red-ghost"><h3 className="text-lg font-semibold mb-2 text-white">🚀 Cheerful Mascots</h3><p className="text-slate-300 text-sm">Shouting "to the moon!" like rent isn't due</p></div>
        </div>

        <div className="card card--red-ghost">
          <p className="text-lg text-white font-semibold mb-4">Cool. Inspirational. Useless at 3:07 a.m.</p>
          <p className="text-slate-300 leading-relaxed">
            Where's the mascot for everyone who checks charts instead of sleeping, read the whitepaper and <em>still</em> bought, has been "early" so many times it's become a personality trait, and knows the risk-reward ratio but chooses chaos anyway?
          </p>
          <p className="text-white font-semibold mt-4">That's Red Mugsy. Not because he's smarter. Because he's funnier about being wrong.</p>
        </div>
      </Section>

      {/* TOKENOMICS — coin next to title */}
      <Section
        id="tokenomics"
        title="Tokenomics: Designed for Culture, Not Claims"
        titleRight={
          <div className="hidden md:block">
            <Coin3D
              front="img/mugsy-coin.png"
              back="img/Golden and Black Coin Back.png"
              size={120}
              speed="7s"
              className="drop-shadow-[0_0_18px_#ff1a4b55]"
            />
          </div>
        }
      >
  <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Chart (larger) with coin in center */}
          <div className="space-y-5">
            <div className="relative h-[420px] md:h-[460px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tokenomics} innerRadius={120} outerRadius={190} paddingAngle={3} dataKey="value">
                    {tokenomics.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0f1115", border: "1px solid #333", borderRadius: 12, padding: "12px", color: "#ffffff" }}
                    labelStyle={{ color: "#ffffff" }}
                    itemStyle={{ color: "#ffffff" }}
                    cursor={{ fill: "#ffffff10" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Rotating coin in center of donut chart - visible on all screen sizes */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Coin3D
                  front="img/mugsy-coin.png"
                  back="img/Golden and Black Coin Back.png"
                  size={80}
                  speed="7s"
                  className="drop-shadow-[0_0_18px_#ff1a4b55]"
                />
              </div>
            </div>

            {/* Tokenomics CTA under the chart */}
            <div className="flex justify-center">
              <a href="#buy" className="btn-buy" aria-label="Buy Mugsy">Buy Mugsy</a>
            </div>

            {/* Legend (2-col grid, single line each) */}
            <ul className="mt-2 grid grid-cols-2 gap-x-10 gap-y-2 text-xl md:text-2xl">
              {tokenomics.map((t) => (
                <li key={t.name} className="flex items-center justify-between gap-4 min-w-0">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="badge shrink-0" style={{ background: t.color }} />
                    <span className="text-slate-300 truncate">{t.name}</span>
                  </span>
                  <span className="text-white font-semibold whitespace-nowrap text-[#ff1a4b]">
                    {t.value}% ({t.amount})
                  </span>
                </li>
              ))}
            </ul>

            <p className="pt-3 text-slate-400 text-sm">
              Decimals: 9 • Standard SPL token • No transfer fees • LP tokens permanently burned.
            </p>
          </div>

          {/* Details (right column) */}
          <div className="space-y-4">
            <div className="card card--tokenomics">
              <h3 className="text-2xl font-semibold text-white mb-2">📊 Total Supply</h3>
              <p className="text-3xl font-bold text-[#ff1a4b]">1.38 Trillion $MUGSY</p>
              <p className="text-base text-slate-400 mt-1">Fixed forever. Mint authority revoked.</p>
            </div>

            <div className="card card--tokenomics">
              <h3 className="text-2xl font-semibold text-white mb-3">🔥 60% Public Distribution (828B)</h3>
              <ul className="space-y-3 text-xl text-slate-300 border-0 divide-y-0 bg-transparent">
                <li>• Fair launch via bonding curve</li>
                <li>• Community airdrops with 72-hour claim windows</li>
                <li>• Unclaimed airdrops → Proof-of-Participation Pool (PoP)</li>
                <li>• LP tokens Locked and permanently burned within 24 hours</li>
              </ul>
            </div>

            <div className="card card--tokenomics">
              <h3 className="text-2xl font-semibold text-white mb-3">💎 20% Burn Reserve (276B)</h3>
              <ul className="space-y-3 text-xl text-slate-300 border-0 divide-y-0 bg-transparent">
                <li>• DAO-governed Burn Vault PDA</li>
                <li>• Requires ≥100 wallet sponsorship + quorum</li>
                <li>• 72-hour timelock on all burn proposals</li>
                <li className="text-[#ff1a4b]">• No schedule. No obligation. Community decides.</li>
              </ul>
            </div>

            <div className="card card--tokenomics">
              <h3 className="text-2xl font-semibold text-white mb-3">🔐 10% Builder Pool (138B)</h3>
              <ul className="space-y-3 text-xl text-slate-300 border-0 divide-y-0 bg-transparent">
                <li className="text-[#ff1a4b]">• 9-YEAR LINEAR VEST (1-year cliff)</li>
                <li>• Immutable contract—no emergency unlocks</li>
                <li>• Team succeeds only if community succeeds</li>
              </ul>
            </div>

            <div className="card card--tokenomics">
              <h3 className="text-2xl font-semibold text-white mb-3">⚙️ 10% Operations (138B)</h3>
              <ul className="space-y-3 text-xl text-slate-300 border-0 divide-y-0 bg-transparent">
                <li>• Security audits & infra (~3%)</li>
                <li>• Marketing, creators & grants (~7%)</li>
                <li>• 5-of-9 multisig + 72-hour public notice</li>
                <li className="text-[#ff1a4b]">• No buybacks. No price manipulation.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison callout */}
  <div className="mt-10 card bg-gradient-to-br from-[#ff1a4b]/10 to-[#00F0FF]/10 border-[#ff1a4b]/30">
          <h3 className="text-xl font-bold text-white mb-3">🛡️ What Makes This Different?</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white font-semibold mb-2">Most Meme Tokens:</p>
              <ul className="space-y-1 text-slate-300">
                <li>• Team gets 10–20% immediately</li>
                <li>• 6–12 month vests (if any)</li>
                <li>• Vague “marketing” allocations</li>
                <li>• LP can be pulled anytime</li>
              </ul>
            </div>
            <div>
              <p className="text-[#ff1a4b] font-semibold mb-2">$MUGSY:</p>
              <ul className="space-y-1 text-slate-300">
                <li>• Team gets 0% for first year</li>
                <li>• 9-YEAR linear vest (108 months)</li>
                <li>• Every spend requires multisig + public notice</li>
                <li>• LP permanently burned—impossible to rug</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* SECURITY */}
      <Section id="security" title={t('sections.security.title')} kicker={t('sections.security.kicker', { defaultValue: 'Proof, Not Promises' })}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "🔥", title: "LP Permanently Burned", desc: "Liquidity tokens sent to verifiable burn address within 24h. No one can ever remove liquidity." },
            { icon: "🚫", title: "Mint Authority Removed", desc: "Supply fixed at 1.38T forever. No one can create new tokens. Ever." },
            { icon: "❄️", title: "Freeze Authority Removed", desc: "No one can freeze your tokens or prevent trading. Your tokens, your control." },
            { icon: "💸", title: "0% Fees (Immutable)", desc: "Standard SPL token. No transfer fee extension. Fees cannot be added later." },
            { icon: "⏱️", title: "72-Hour Timelocks", desc: "All treasury actions require 72-hour public notice. No surprise moves." },
            { icon: "🔐", title: "Program-Controlled Pools", desc: "Burn Reserve, PoP Pool, and Treasury are PDA-controlled with governance requirements." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="card"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 card bg-[#ff1a4b]/5 border-[#ff1a4b]/30">
          <h3 className="text-xl font-bold text-white mb-3">⚠️ Verification Within 24 Hours</h3>
          <p className="text-slate-300 text-sm mb-4">All immutable settings will be published within 24 hours of launch:</p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-black/30 p-3 rounded border border-white/10"><p className="text-slate-400 mb-1">Mint Authority Removal TX</p><p className="text-white">[Published at launch]</p></div>
            <div className="bg-black/30 p-3 rounded border border-white/10"><p className="text-slate-400 mb-1">Freeze Authority Removal TX</p><p className="text-white">[Published at launch]</p></div>
            <div className="bg-black/30 p-3 rounded border border-white/10"><p className="text-slate-400 mb-1">LP Burn Transaction</p><p className="text-white">[Published at launch]</p></div>
            <div className="bg-black/30 p-3 rounded border border-white/10"><p className="text-slate-400 mb-1">All PDA Addresses</p><p className="text-white">[Published at launch]</p></div>
          </div>
          <p className="text-[#ff1a4b] font-semibold text-sm mt-4">
            ⚠️ If these are not published within 24 hours, DO NOT PURCHASE. Assume it is a rug.
          </p>
        </div>

        {/* Security CTA at the bottom */}
        <div className="mt-10 flex justify-center">
          <a href="#buy" className="btn-buy" aria-label="Buy Mugsy">Buy Mugsy</a>
        </div>
      </Section>

      {/* ROADMAP */}
      <Section id="roadmap" title={t('sections.roadmap.title')} kicker={t('sections.roadmap.kicker', { defaultValue: 'No Promises, Just Plans' })}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Phase 1: Pure Meme (12+ months)</h3>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex gap-3"><span className="text-[#ff1a4b]">✓</span><span>Build the strongest community in crypto</span></li>
              <li className="flex gap-3"><span className="text-[#ff1a4b]">✓</span><span>Daily meme generation contests & 3:07 a.m. story campaigns</span></li>
              <li className="flex gap-3"><span className="text-[#ff1a4b]">✓</span><span>Ambassador program & creator partnerships</span></li>
              <li className="flex gap-3"><span className="text-[#ff1a4b]">✓</span><span>Airdrop campaigns with 72-hour claim windows</span></li>
              <li className="flex gap-3"><span className="text-[#ff1a4b]">✓</span><span>Establish Red Mugsy as universal symbol of exhausted optimism</span></li>
            </ul>
            <p className="mt-4 text-white font-semibold text-sm">Goal: Prove the culture is real before considering anything else.</p>
          </div>

          <div className="card bg-slate-900/50">
            <h3 className="text-xl font-semibold text-white mb-4">Phase 2: Optional, Community-Driven</h3>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex gap-3"><span className="text-[#00F0FF]">?</span><span>Only considered after 12+ months minimum</span></li>
              <li className="flex gap-3"><span className="text-[#00F0FF]">?</span><span>Requires 75% supermajority community vote</span></li>
              <li className="flex gap-3"><span className="text-[#00F0FF]">?</span><span>Cosmetic experiments only—no financial promises</span></li>
              <li className="flex gap-3"><span className="text-[#00F0FF]">?</span><span>Optional. Non-obligatory. Community decides everything.</span></li>
            </ul>
            <p className="mt-4 text-slate-400 text-xs italic">We eliminate the #1 reason meme projects fail: overpromising and underdelivering.</p>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" title={t('sections.faq.title')} kicker={t('sections.faq.kicker', { defaultValue: 'Read Before Aping' })}>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { q: "Is this an investment?", a: "No. $MUGSY is a culture token with no rights, no revenue share, no dividends, and no expectation of profit from anyone's efforts. It's a meme with transparent mechanics." },
            { q: "How do you prevent rugs?", a: "LP burned permanently. Mint & freeze authorities revoked. 0% transfer fee (immutable). 9-year builder vest. All major pools are program-controlled with 72-hour timelocks and governance requirements." },
            { q: "Who decides on burns?", a: "The community through on-chain proposals requiring ≥100 wallet sponsorship, quorum (0.5%→2.5% of supply), and 72-hour timelocks. There's no schedule and no obligation to execute any burns." },
            { q: "What blockchain and token standard?", a: "Solana SPL token (not Token-2022), 9 decimals, no extensions. Standard and battle-tested for maximum compatibility." },
          ].map((f, i) => (
            <motion.div key={i} className="card">
              <details className="group cursor-pointer">
                <summary className="font-semibold text-white flex items-center justify-between list-none">
                  <span>{f.q}</span>
                  <span className="ml-4 text-slate-400 group-open:rotate-180 transition-transform text-xl">⌄</span>
                </summary>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">{f.a}</p>
              </details>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section id="buy" className="pt-8 pb-20 px-6 scroll-mt-40">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">{t('hero.cta_primary')}</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            If not—you're missing the most exhausted, hopeful, over-caffeinated corner of crypto with the{" "}
            <strong className="text-white">best jokes</strong> and the <strong className="text-white">worst sleep hygiene</strong>.
          </p>
          <p className="text-slate-400 italic">
            "Because refusing to quit on the thing that brought you here? That's where it gets interesting."
          </p>
          <div className="flex items-center justify-center gap-4 pt-6">
            <button className="btn-neo text-lg px-8 py-4">Buy $MUGSY</button>
            <a
              href="Public Documents/$MUGSY Whitepaper V3.0.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-ghost--red text-lg px-8 py-4"
            >
              Read Whitepaper
            </a>
            <a
              href="Public Documents/$MUGSY Manifesto.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-ghost--red text-lg px-8 py-4"
            >
              Read Manifesto
            </a>
          </div>
        </div>
      </section>

      <SiteFooter onHome />

      <BackToTop />
    </div>
  );
}







