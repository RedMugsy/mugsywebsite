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
  const links = onHome
    ? [
        { label: t('nav.home').toUpperCase(), href: '#hero' },
        { label: t('nav.about').toUpperCase(), href: '#about' },
        { label: t('nav.tokenomics').toUpperCase(), href: '#tokenomics' },
        { label: t('nav.security').toUpperCase(), href: '#security' },
        { label: t('nav.roadmap').toUpperCase(), href: '#roadmap' },
        { label: t('nav.faq').toUpperCase(), href: '#faq' },
        { label: t('nav.contact').toUpperCase(), href: '/mugsywebsite/contact' },
      ]
    : [
        { label: t('nav.home').toUpperCase(), href: '/mugsywebsite/' },
        { label: t('nav.about').toUpperCase(), href: '/mugsywebsite/#about' },
        { label: t('nav.tokenomics').toUpperCase(), href: '/mugsywebsite/#tokenomics' },
        { label: t('nav.security').toUpperCase(), href: '/mugsywebsite/#security' },
        { label: t('nav.roadmap').toUpperCase(), href: '/mugsywebsite/#roadmap' },
        { label: t('nav.faq').toUpperCase(), href: '/mugsywebsite/#faq' },
        { label: t('nav.contact').toUpperCase(), href: '/mugsywebsite/contact' },
      ]

  return (
    <header className={`sticky top-0 z-[60] transition-all header-rabbit backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10 ${className}`}>
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6">
        <a href={onHome ? '#hero' : '/'} className="flex items-center gap-2 font-extrabold text-white tracking-tight text-lg">
          <img src="img/mugsy-logo-red.png" alt="RED $MUGSY logo" className="h-28 w-auto" />
          <span><span className="text-[#ff1a4b]">RED</span> $MUGSY</span>
        </a>
        
        {/* Mobile hamburger menu button */}
        <div className="flex md:hidden items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white hover:text-[#ff1a4b] transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>
        
        {/* Desktop TubeNavbar */}
        <div className="hidden md:flex flex-1 justify-center items-center min-w-0 px-4">
          <TubeNavbar links={links} />
        </div>
      </nav>
      
      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0b0c10]/95 backdrop-blur border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col space-y-3">
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
  )
}

