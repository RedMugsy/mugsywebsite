import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '../locales/en.json'
import ar from '../locales/ar.json'
import de from '../locales/de.json'
import fr from '../locales/fr.json'
import it from '../locales/it.json'
import es from '../locales/es.json'
import zh from '../locales/zh.json'
import pt from '../locales/pt.json'
import hi from '../locales/hi.json'
import ru from '../locales/ru.json'
import ja from '../locales/ja.json'
import ko from '../locales/ko.json'
import sw from '../locales/sw.json'
import pl from '../locales/pl.json'

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  de: { translation: de },
  fr: { translation: fr },
  it: { translation: it },
  es: { translation: es },
  zh: { translation: zh },
  pt: { translation: pt },
  hi: { translation: hi },
  ru: { translation: ru },
  ja: { translation: ja },
  ko: { translation: ko },
  sw: { translation: sw },
  pl: { translation: pl },
}

const SUPPORTED = ['en','ar','de','fr','it','es','zh','pt','hi','ru','ja','ko','sw','pl']

function initialLang() {
  try {
    const saved = localStorage.getItem('lang')
    if (saved && SUPPORTED.includes(saved)) return saved
  } catch {}
  const nav = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language.split('-')[0] : 'en'
  return SUPPORTED.includes(nav) ? nav : 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n

