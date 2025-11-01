import TubeNavbar from './TubeNavbar'
import { useTranslation } from 'react-i18next'

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
  const links = onHome
    ? [
        { label: t('nav.home').toUpperCase(), href: '#hero' },
        { label: t('nav.about').toUpperCase(), href: '#about' },
        { label: t('nav.tokenomics').toUpperCase(), href: '#tokenomics' },
        { label: t('nav.security').toUpperCase(), href: '#security' },
        { label: t('nav.roadmap').toUpperCase(), href: '#roadmap' },
        { label: t('nav.faq').toUpperCase(), href: '#faq' },
        { label: t('nav.contact').toUpperCase(), href: '/contact' },
      ]
    : [
        { label: t('nav.home').toUpperCase(), href: '/' },
        { label: t('nav.about').toUpperCase(), href: '/#about' },
        { label: t('nav.tokenomics').toUpperCase(), href: '/#tokenomics' },
        { label: t('nav.security').toUpperCase(), href: '/#security' },
        { label: t('nav.roadmap').toUpperCase(), href: '/#roadmap' },
        { label: t('nav.faq').toUpperCase(), href: '/#faq' },
        { label: t('nav.contact').toUpperCase(), href: '/contact' },
      ]

  return (
    <header className={`sticky top-0 z-[60] transition-all header-rabbit backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10 ${className}`}>
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6">
        <a href={onHome ? '#hero' : '/'} className="flex items-center gap-2 font-extrabold text-white tracking-tight text-lg">
          <img src="/img/mugsy-logo-red.png" alt="RED $MUGSY logo" className="h-28 w-auto" />
          <span><span className="text-[#ff1a4b]">RED</span> $MUGSY</span>
        </a>
        <div className="flex-1 flex justify-center items-center min-w-0 px-4">
          <TubeNavbar links={links} />
        </div>
      </nav>
      {/* Language selector hidden per request */}
    </header>
  )
}

