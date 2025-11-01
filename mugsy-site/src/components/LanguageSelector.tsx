import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
  { code: 'de', label: 'German' },
  { code: 'fr', label: 'French' },
  { code: 'it', label: 'Italian' },
  { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Mandarin' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'hi', label: 'Indian' },
  { code: 'ru', label: 'Russian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'South Korean' },
  { code: 'sw', label: 'Swahili' },
  { code: 'pl', label: 'Polish' }
]

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang')
      if (saved) i18n.changeLanguage(saved)
    } catch {}
  }, [i18n])

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value
    i18n.changeLanguage(lang)
    try { localStorage.setItem('lang', lang) } catch {}
    // set document direction for RTL
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    }
  }

  return (
    <select
      aria-label="Language"
      className="bg-black/50 text-white border border-white/10 rounded px-2 py-1 text-sm"
      value={i18n.language}
      onChange={onChange}
    >
      {LANGS.map(l => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  )
}

