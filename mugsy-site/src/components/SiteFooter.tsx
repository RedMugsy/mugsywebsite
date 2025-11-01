import { useTranslation } from 'react-i18next'

export default function SiteFooter({ onHome = false }: { onHome?: boolean }) {
  const { t } = useTranslation()
  const anchor = (hash: string) => onHome ? `#${hash}` : `/#${hash}`
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-white mb-3">RED $MUGSY</h3>
            <p className="text-sm text-slate-400">
              {t('footer.tagline')}
            </p>
            <div className="mt-3 space-y-2 text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <a href="/Public%20Documents/Privacy%20Policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">{t('footer.privacy')}</a>
                <span className="opacity-50">•</span>
                <a href="/privacy-request" className="hover:text-white">{t('footer.privacyRequest')}</a>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a href="/Public%20Documents/Terms%20of%20Services.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">{t('footer.terms')}</a>
                <span className="opacity-50">•</span>
                <a href="/cookie-policy" className="hover:text-white">{t('footer.cookiePolicy')}</a>
                <span className="opacity-50">•</span>
                <a href="/Public%20Documents/Disclaimer%20Risk.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white">{t('footer.disclaimer')}</a>
              </div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-white mb-3">{t('footer.quickLinks')}</h3>
            <div className="flex flex-col items-center gap-2 text-sm text-slate-400">
              <a href={anchor('about')} className="hover:text-white">{t('nav.about')}</a>
              <a href={anchor('tokenomics')} className="hover:text-white">{t('nav.tokenomics')}</a>
              <a href={anchor('security')} className="hover:text-white">{t('nav.security')}</a>
              <a href={anchor('faq')} className="hover:text-white">{t('nav.faq')}</a>
              <a href="/cookie-preferences" className="hover:text-white">{t('footer.cookiePreferences')}</a>
              <a href="/contact" className="hover:text-white">{t('nav.contact')}</a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white mb-3">{t('footer.community')}</h3>
            <div className="flex items-center gap-3">
              <a href="https://x.com/RedMugsy85838" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="X / Twitter" title="X / Twitter">
                <img src="/img/X logo White Trnsprt.png" alt="X logo" className="h-5 w-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="BlueSky" title="BlueSky">
                <img src="/img/bluesky logo White Trnsprt.png" alt="BlueSky logo" className="h-5 w-5" />
              </a>
              <a href="https://t.me/REDMUGSY" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="Telegram" title="Telegram">
                <img src="/img/Telegram logo White Trnsprt.png" alt="Telegram logo" className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/9GJcjKhaYj" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="Discord" title="Discord">
                <img src="/img/Discord logo White Trnsprt.png" alt="Discord logo" className="h-5 w-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="TikTok" title="TikTok">
                <img src="/img/TikTok logo White Trnsprt.png" alt="TikTok logo" className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/redmugsy/" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="Instagram" title="Instagram">
                <img src="/img/Instagram logo White Trnsprt.png" alt="Instagram logo" className="h-5 w-5" />
              </a>
              <a href="https://www.reddit.com/user/redmugsy/" target="_blank" rel="noopener noreferrer" className="icon-sphere icon-sphere--red" aria-label="Reddit" title="Reddit">
                <img src="/img/Reddit logo White Trnsprt.png" alt="Reddit logo" className="h-5 w-5" />
              </a>
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


