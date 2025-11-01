import { solvePow } from './pow'

export type CaptchaChallenge = { type: 'pow'|'image'; difficulty?: number; token?: string; expiresAt?: string; prefix?: string; nonce?: string; payload?: any }
export type AntiSpamInit = {
  csrf: string
  issuedAt: number
  issuedSig: string
  captcha: CaptchaChallenge
  powSolution?: number
}

export async function initAntiSpam(apiBase: string, opts?: { computePow?: boolean; low?: boolean }): Promise<AntiSpamInit> {
  const computePow = !!opts?.computePow
  const csrf = await fetch(`${apiBase}/api/contact/csrf`, { credentials: 'include', headers: { 'Accept': 'application/json' } })
    .then(async r=>{
      const ct = r.headers.get('content-type') || ''
      if (!ct.includes('application/json')) { const text = await r.text(); throw new Error(`CSRF endpoint did not return JSON (${r.status}). ${text.slice(0,80)}`) }
      return r.json()
    }).then(j=>j.token)
  const { issuedAt, issuedSig } = await fetch(`${apiBase}/api/contact/timestamp`, { credentials: 'include', headers: { 'Accept': 'application/json' } })
    .then(async r=>{ const ct = r.headers.get('content-type')||''; if (!ct.includes('application/json')) { const t=await r.text(); throw new Error(`Timestamp not JSON (${r.status}). ${t.slice(0,80)}`)}; return r.json() })
  const url = `${apiBase}/api/contact/captcha${opts?.low ? '?low=1' : ''}`
  const captcha: CaptchaChallenge = await fetch(url, { credentials: 'include', headers: { 'Accept': 'application/json' } })
    .then(async r=>{ const ct=r.headers.get('content-type')||''; if(!ct.includes('application/json')){ const t=await r.text(); throw new Error(`Captcha endpoint did not return JSON (${r.status}). ${t.slice(0,80)}`)}; return r.json() })
  let powSolution: number | undefined
  if (computePow && captcha?.type === 'pow' && typeof captcha.difficulty === 'number' && captcha.prefix) {
    powSolution = await solvePow(captcha.prefix, captcha.difficulty)
  }
  return { csrf, issuedAt, issuedSig, captcha, powSolution }
}
