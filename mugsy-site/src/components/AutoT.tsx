import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateText } from '../lib/translationService'

export default function AutoT({ text, as: Tag = 'p', className = '' }: { text: string; as?: any; className?: string }) {
  const { i18n } = useTranslation()
  const [out, setOut] = useState(text)
  useEffect(() => {
    let alive = true
    async function run() {
      const lang = (i18n.language || 'en').split('-')[0]
      if (lang === 'en') { setOut(text); return }
      const t = await translateText(text, lang)
      if (alive) setOut(t)
    }
    run()
    return () => { alive = false }
  }, [i18n.language, text])
  return <Tag className={className}>{out}</Tag>
}



