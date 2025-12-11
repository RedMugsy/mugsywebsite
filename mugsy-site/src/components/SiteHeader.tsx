import TubeNavbar from './TubeNavbar'
import { useTranslation } from 'react-i18next'
import React from 'react'

type Props = {
  onHome?: boolean
  className?: string
}

/**
 * Site-wide header: sticky, shows logo and TubeNavbar only (no CTAs).
 * - When `onHome` is true (homepage), uses section anchors like `#about`.
 * - When `onHome` is false (subpages), uses absolute links like `/#about`.
 */
export default function SiteHeader({ onHome = false, className = '' }: Props) {
  const { t } = useTranslation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const participantSignInHref = onHome ? '#/treasure-hunt/register' : '/#/treasure-hunt/register'
  const promoterSignInHref = onHome ? '#/treasure-hunt/promoter-signin' : '/#/treasure-hunt/promoter-signin'
  const links = onHome
    ? [
        { label: t('nav.home').toUpperCase(), href: '#hero' },
        { label: t('nav.about').toUpperCase(), href: '#about' },
        { label: t('nav.tokenomics').toUpperCase(), href: '#tokenomics' },
        { label: t('nav.security').toUpperCase(), href: '#security' },
        { label: t('nav.roadmap').toUpperCase(), href: '#roadmap' },
        { label: t('nav.faq').toUpperCase(), href: '#faq' },
        { label: 'TREASURE HUNT', href: '#/treasure-hunt', hasDropdown: true },
        { label: t('nav.contact').toUpperCase(), href: '#/contact' },
      ]
    : [
        { label: t('nav.home').toUpperCase(), href: '/#' },
        { label: t('nav.about').toUpperCase(), href: '/#about' },
        { label: t('nav.tokenomics').toUpperCase(), href: '/#tokenomics' },
        { label: t('nav.security').toUpperCase(), href: '/#security' },
        { label: t('nav.roadmap').toUpperCase(), href: '/#roadmap' },
        { label: t('nav.faq').toUpperCase(), href: '/#faq' },
        { label: 'TREASURE HUNT', href: '/#/treasure-hunt', hasDropdown: true },
        { label: t('nav.contact').toUpperCase(), href: '/#/contact' },
      ]

  return (
    <div className={`sticky top-0 z-[60] ${className}`}>
      <div className="relative z-50 bg-black/80 border-b border-white/10 px-4 sm:px-6 py-1 flex justify-end overflow-visible">
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href={promoterSignInHref}
            className="group relative inline-flex items-center text-[11px] sm:text-xs font-semibold tracking-wide text-white/70 hover:text-[#ff1a4b] transition-colors"
          >
            Promoter Sign In
            <span className="pointer-events-none absolute right-0 bottom-full translate-y-[-4px] mb-2 w-64 rounded-lg border border-white/10 bg-black/90 px-3 py-2 text-[11px] text-slate-100 shadow-xl opacity-0 group-hover:opacity-100">
              Registered Promoters sign in here to access their dashboard.
            </span>
          </a>
          <a
            href={`${participantSignInHref}?mode=signin`}
            className="inline-flex items-center text-[11px] sm:text-xs font-semibold tracking-wide text-white/70 hover:text-white transition-colors"
          >
            Participant Sign In
          </a>
        </div>
      </div>
      <header className="transition-all header-rabbit backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10 overflow-visible py-3">
        <nav className="max-w-7xl mx-auto flex items-center gap-6 py-3 px-6">
          {/* Logo */}
          <a
            href={onHome ? '#hero' : '/#'}
            className="flex items-center gap-2 font-extrabold text-white tracking-tight text-lg shrink-0"
          >
            <img src="/img/mugsy-logo-red.png" alt="RED $MUGSY logo" className="h-9 md:h-24 w-auto" />
            <span className="hidden sm:inline-flex flex-col leading-tight text-3xl md:text-4xl">
              <span className="text-white">RED</span>
              <span className="text-[#ff1a4b]">$MUGSY</span>
            </span>
          </a>

          {/* Desktop TubeNavbar */}
          <div className="hidden md:flex flex-1 justify-start pl-4">
            <TubeNavbar links={links} />
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex md:hidden flex-1 justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-[#ff1a4b] transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span
                  className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
                ></span>
                <span
                  className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}
                ></span>
                <span
                  className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
                ></span>
              </div>
            </button>
          </div>
        </nav>
      
      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0b0c10]/95 backdrop-blur border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col space-y-3">
              <a
                href={promoterSignInHref}
                className="text-white font-semibold py-2 border-b border-white/10 hover:text-[#ff1a4b]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Promoter Sign In
              </a>
              <a
                href={participantSignInHref}
                className="text-white font-semibold py-2 border-b border-white/10 hover:text-[#ff1a4b]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Participant Sign In
              </a>
              {links.map((link) => (
                <a 
                  key={link.href} 
                  href={link.href} 
                  className="text-slate-300 hover:text-white transition-colors py-2 border-b border-white/10 last:border-b-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Language selector hidden per request */}
    </header>
    </div>
  )
}
