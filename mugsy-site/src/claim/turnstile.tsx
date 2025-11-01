import { useEffect, useRef } from 'react'

declare global { interface Window { turnstile?: any } }

export function Turnstile({
  sitekey,
  onToken,
  theme = 'dark',
}: { sitekey: string; onToken: (t: string)=>void; theme?: 'light'|'dark' }) {
  const el = useRef<HTMLDivElement|null>(null)
  useEffect(()=>{
    if (!el.current) return
    let cancelled = false
    const t = setInterval(()=>{
      if (cancelled) return
      if (window.turnstile?.render) {
        clearInterval(t)
        window.turnstile.render(el.current!, {
          sitekey, theme,
          callback: (token: string)=> onToken(token),
        })
      }
    }, 200)
    return ()=>{ cancelled = true; clearInterval(t) }
  }, [sitekey, onToken, theme])
  return <div ref={el} className="inline-block" />
}

