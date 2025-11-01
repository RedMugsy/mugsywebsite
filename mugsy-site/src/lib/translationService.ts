// DeepL v2 translation + local caching (Map + IndexedDB)
// Uses REST API to avoid bundling server SDK

import { idbGet, idbSet } from './idb'

type CacheEntry = { text: string; lang: string; translated: string; ts: number }

const memCache = new Map<string, CacheEntry>()
const TTL_MS = 60 * 60 * 1000 // 1 hour

function keyOf(text: string, targetLang: string) {
  return `${targetLang}::${text}`
}

function isFresh(e?: CacheEntry | null) {
  if (!e) return false
  return Date.now() - e.ts < TTL_MS
}

async function getCached(text: string, targetLang: string): Promise<string | undefined> {
  const key = keyOf(text, targetLang)
  const m = memCache.get(key)
  if (isFresh(m)) return m!.translated
  try {
    const d = await idbGet<CacheEntry>(key)
    if (isFresh(d)) {
      memCache.set(key, d!)
      return d!.translated
    }
  } catch {}
  return undefined
}

async function setCached(text: string, targetLang: string, translated: string) {
  const key = keyOf(text, targetLang)
  const entry: CacheEntry = { text, lang: targetLang, translated, ts: Date.now() }
  memCache.set(key, entry)
  try { await idbSet(key, entry) } catch {}
}

const API_KEY = (import.meta as any).env?.VITE_DEEPL_API_KEY
const API_URL = 'https://api-free.deepl.com/v2/translate'

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text) return ''
  const cached = await getCached(text, targetLang)
  if (cached !== undefined) return cached

  if (!API_KEY) return text

  try {
    const body = new URLSearchParams()
    body.set('text', text)
    body.set('target_lang', targetLang.toUpperCase())
    // HTML tag handling keeps markup intact if present
    body.set('tag_handling', 'html')

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `DeepL-Auth-Key ${API_KEY}` },
      body: body.toString(),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const j: any = await resp.json()
    const out = j?.translations?.[0]?.text || text
    await setCached(text, targetLang, out)
    return out
  } catch (e) {
    console.error(`Translation error (${targetLang}):`, e)
    return text
  }
}

const CONTEXT_PROMPT = `Tone: sarcastic, witty, caffeine-fuelled trader commentary.\nAudience: crypto enthusiasts.\nGoal: preserve humor and double meanings; avoid literal translation.`

export async function translateWithContext(text: string, targetLang: string) {
  return translateText(`${CONTEXT_PROMPT}\n\n${text}`, targetLang)
}

