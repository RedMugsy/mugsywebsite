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
    let retryCount = 0
    const maxRetries = 3

    const waitForScript = () => {
      if (cancelled) return
      
      if (window.turnstile?.render) {
        try {
          widgetId = window.turnstile.render(el.current!, {
            sitekey,
            theme,
            callback: (token: string) => {
              if (!cancelled) {
                onToken(token)
              }
            },
            'expired-callback': () => {
              if (!cancelled) {
                onExpire?.()
              }
            },
            'error-callback': () => {
              if (!cancelled) {
                console.warn('Turnstile error callback triggered')
                onError?.()
              }
            }
          })
        } catch (error) {
          console.error('Failed to render Turnstile widget:', error)
          if (!cancelled) {
            onError?.()
          }
        }
      } else {
        retryCount++
        if (retryCount < maxRetries) {
          setTimeout(waitForScript, 150 * retryCount) // Exponential backoff
        } else {
          console.error('Turnstile script failed to load after', maxRetries, 'attempts')
          if (!cancelled) {
            onError?.()
          }
        }
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
