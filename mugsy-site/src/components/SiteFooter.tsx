import { useTranslation } from 'react-i18next'

export default function SiteFooter() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-12 gap-8 mb-8">
          <div className="md:col-span-6">
            <div className="flex items-center gap-2 mb-3">
              <img src="/img/mugsy-logo-red.png" alt="RED $MUGSY logo" className="h-16 w-auto" />
              <span className="font-extrabold text-white tracking-tight text-lg">
                <span className="text-white">RED</span> <span className="text-[#ff1a4b]">$MUGSY</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {t('footer.tagline')}
            </p>
            
            {/* Social links moved directly under logo */}
            <div className="flex items-center gap-3 mt-4 mb-6">
              <a href="https://x.com/RedMugsyToken" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="X / Twitter" title="X / Twitter">
                <img src="/img/X logo White Trnsprt.png" alt="X logo" className="h-5 w-5" />
              </a>
              <a href="https://bsky.app/profile/redmugsy.bsky.social" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="BlueSky" title="BlueSky">
                <img src="/img/bluesky logo White Trnsprt.png" alt="BlueSky logo" className="h-5 w-5" />
              </a>
              <a href="https://t.me/REDMUGSY" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="Telegram" title="Telegram">
                <img src="/img/Telegram logo White Trnsprt.png" alt="Telegram logo" className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/9GJcjKhaYj" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="Discord" title="Discord">
                <img src="/img/Discord logo White Trnsprt.png" alt="Discord logo" className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@redmugsy" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="TikTok" title="TikTok">
                <img src="/img/TikTok logo White Trnsprt.png" alt="TikTok logo" className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/redmugsy/" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="Instagram" title="Instagram">
                <img src="/img/Instagram logo White Trnsprt.png" alt="Instagram logo" className="h-5 w-5" />
              </a>
              <a href="https://www.reddit.com/user/redmugsy/" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="Reddit" title="Reddit">
                <img src="/img/Reddit logo White Trnsprt.png" alt="Reddit logo" className="h-5 w-5" />
              </a>
            </div>
            
            {/* Legal links moved below social */}
            <div className="mt-3 space-y-2 text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <a href="/Public%20Documents/Privacy%20Policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">{t('footer.privacy')}</a>
                <span className="opacity-50">•</span>
                <a href="#/privacy-request" className="hover:text-white">{t('footer.privacyRequest')}</a>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a href="/Public%20Documents/Terms%20of%20Services.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">{t('footer.terms')}</a>
                <span className="opacity-50">•</span>
                <a href="#/cookie-policy" className="hover:text-white">{t('footer.cookiePolicy')}</a>
                <span className="opacity-50">•</span>
                <a href="#/cookie-preferences" className="hover:text-white">{t('footer.cookiePreferences')}</a>
                <span className="opacity-50">•</span>
                <a href="/Public%20Documents/Disclaimer%20Risk.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">{t('footer.disclaimer')}</a>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <h3 className="font-bold text-white mb-3">Resources</h3>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <a href="/Public%20Documents/Whitepaper.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">Whitepaper</a>
              <a href="/Public%20Documents/Audit%20Report.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">Audit Report</a>
              <a href="https://github.com/redmugsy" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>
            </div>
          </div>
          <div className="md:col-span-3">
            <h3 className="font-bold text-white mb-3">Exchanges</h3>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <a href="https://www.mexc.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">MEXC</a>
              <a href="https://www.coinex.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">CoinEx</a>
              <a href="https://www.biconomy.io" target="_blank" rel="noopener noreferrer" className="hover:text-white">Biconomy</a>
              <a href="https://www.binance.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Binance</a>
              <a href="https://coinmarketcap.com/currencies/red-mugsy/" target="_blank" rel="noopener noreferrer" className="hover:text-white">MarketCap</a>
              <a href="https://www.coinbase.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">CoinBase</a>
              <a href="https://www.coingecko.com/en/coins/red-mugsy" target="_blank" rel="noopener noreferrer" className="hover:text-white">Gecko</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-sm text-slate-400 text-center">
          <p className="mb-2">© {new Date().getFullYear()} RED $MUGSY — {t('footer.disclaimerShort')}</p>
          <p className="text-xs">{t('footer.disclaimerLong')}</p>
        </div>
      </div>
    </footer>
  )
}

