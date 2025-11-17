import { useEffect, useRef } from 'react'

declare global { interface Window { turnstile?: { render: (...args: any[]) => any; reset?: (id?: any) => void; remove?: (id?: any) => void } } }

type TurnstileProps = {
  sitekey: string
  onToken: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  theme?: 'light' | 'dark'
}

export function Turnstile({
  sitekey,
  onToken,
  onExpire,
  onError,
  theme = 'dark',
}: TurnstileProps) {
  const el = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!el.current || !sitekey) return
    let cancelled = false
    let widgetId: any = null

    const waitForScript = () => {
      if (cancelled) return
      if (window.turnstile?.render) {
        widgetId = window.turnstile.render(el.current!, {
          sitekey,
          theme,
          callback: (token: string) => onToken(token),
          'expired-callback': () => {
            onExpire?.()
          },
          'error-callback': () => {
            onError?.()
          }
        })
      } else {
        setTimeout(waitForScript, 150)
      }
    }

    waitForScript()

    return () => {
      cancelled = true
      if (widgetId && window.turnstile?.remove) {
        try { window.turnstile.remove(widgetId) } catch {}
      } else if (widgetId && window.turnstile?.reset) {
        try { window.turnstile.reset(widgetId) } catch {}
      }
    }
  }, [sitekey, onToken, onExpire, onError, theme])

  return <div ref={el} className="inline-block" />
}
