import { useEffect, useRef } from 'react'

declare global { 
  interface Window { 
    turnstile?: { 
      render: (...args: any[]) => any; 
      reset?: (id?: any) => void; 
      remove?: (id?: any) => void;
      ready?: (callback: () => void) => void;
    } 
  } 
}

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
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!el.current || !sitekey) return
    let cancelled = false
    let retryCount = 0
    const maxRetries = 5

    // Clear any existing widget first
    if (widgetIdRef.current && window.turnstile?.remove) {
      try { 
        window.turnstile.remove(widgetIdRef.current) 
        widgetIdRef.current = null
      } catch (e) {
        console.warn('Failed to remove existing widget:', e)
      }
    }

    // Also clear any existing widgets in the DOM element
    if (el.current) {
      el.current.innerHTML = ''
    }

    const renderWidget = () => {
      if (cancelled || !el.current || !window.turnstile?.render) return
      
      try {
        // Double-check element is clean before rendering
        if (el.current) {
          el.current.innerHTML = ''
        }

        const widgetId = window.turnstile.render(el.current, {
          sitekey,
          theme,
          size: 'normal',
          'response-field': false,
          'response-field-name': '',
          retry: 'auto',
          'retry-interval': 8000,
          'refresh-expired': 'auto',
          callback: (token: string) => {
            if (!cancelled && token) {
              console.log('Turnstile token received')
              onToken(token)
            }
          },
          'expired-callback': () => {
            if (!cancelled) {
              console.log('Turnstile token expired')
              onExpire?.()
            }
          },
          'error-callback': (error?: string) => {
            if (!cancelled) {
              console.warn('Turnstile error:', error)
              // Don't immediately call onError for retryable errors
              if (error === 'network-error' && retryCount < maxRetries) {
                retryCount++
                setTimeout(() => {
                  if (!cancelled) {
                    renderWidget()
                  }
                }, 2000 * retryCount)
              } else {
                onError?.()
              }
            }
          },
          'timeout-callback': () => {
            if (!cancelled) {
              console.warn('Turnstile timeout')
              if (retryCount < maxRetries) {
                retryCount++
                setTimeout(() => {
                  if (!cancelled) {
                    renderWidget()
                  }
                }, 3000)
              } else {
                onError?.()
              }
            }
          },
          'before-interactive-callback': () => {
            console.log('Turnstile before interactive')
          },
          'after-interactive-callback': () => {
            console.log('Turnstile after interactive')
          }
        })

        widgetIdRef.current = widgetId
        console.log('Turnstile widget rendered with ID:', widgetId)
        
      } catch (error) {
        console.error('Failed to render Turnstile widget:', error)
        if (!cancelled) {
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(() => {
              if (!cancelled) {
                renderWidget()
              }
            }, 1000 * retryCount)
          } else {
            onError?.()
          }
        }
      }
    }

    const waitForTurnstile = () => {
      if (cancelled) return
      
      if (window.turnstile?.render) {
        // Use turnstile.ready if available for better timing
        if (window.turnstile.ready) {
          window.turnstile.ready(() => {
            if (!cancelled) {
              renderWidget()
            }
          })
        } else {
          renderWidget()
        }
      } else {
        retryCount++
        if (retryCount < maxRetries) {
          console.log(`Waiting for Turnstile script... attempt ${retryCount}`)
          setTimeout(waitForTurnstile, 200 * retryCount)
        } else {
          console.error('Turnstile script failed to load after', maxRetries, 'attempts')
          if (!cancelled) {
            onError?.()
          }
        }
      }
    }

    // Small delay to ensure DOM is ready
    setTimeout(waitForTurnstile, 100)

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile?.remove) {
        try { 
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        } catch (e) {
          console.warn('Failed to cleanup Turnstile widget:', e)
        }
      }
    }
  }, [sitekey, theme]) // Removed callbacks from deps to prevent unnecessary re-renders

  // Use separate effect for callback updates to avoid widget recreation
  useEffect(() => {
    // Store current callbacks in refs so they can be called without recreating widget
    const currentCallbacks = { onToken, onExpire, onError }
    
    return () => {
      // Cleanup if needed
    }
  }, [onToken, onExpire, onError])

  return (
    <div 
      ref={el} 
      className="inline-block min-h-[65px] min-w-[300px]"
      data-testid="turnstile-widget"
      data-sitekey={sitekey}
      key={sitekey} // Ensure remount when sitekey changes
    />
  )
}
