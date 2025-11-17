import { useEffect, useState } from 'react'

export function TurnstileDebug({ sitekey }: { sitekey: string }) {
  const [info, setInfo] = useState({
    domain: '',
    protocol: '',
    sitekey: '',
    scriptLoaded: false,
    turnstileReady: false,
    error: ''
  })

  useEffect(() => {
    const checkStatus = () => {
      setInfo({
        domain: window.location.hostname,
        protocol: window.location.protocol,
        sitekey: sitekey || 'NOT_SET',
        scriptLoaded: !!window.turnstile,
        turnstileReady: !!(window.turnstile?.render),
        error: (window as any).turnstileLoadError ? 'Script failed to load' : ''
      })
    }

    checkStatus()
    const interval = setInterval(checkStatus, 1000)
    
    return () => clearInterval(interval)
  }, [sitekey])

  // Only show in development or with debug param
  if (import.meta.env.PROD && !window.location.search.includes('debug=true')) {
    return null
  }

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg text-sm font-mono mt-4">
      <h3 className="font-bold mb-2">Turnstile Debug Info:</h3>
      <div className="space-y-1">
        <div>Domain: <span className="text-yellow-400">{info.domain}</span></div>
        <div>Protocol: <span className="text-yellow-400">{info.protocol}</span></div>
        <div>Sitekey: <span className="text-yellow-400">{info.sitekey.substring(0, 20)}...</span></div>
        <div>Script Loaded: <span className={info.scriptLoaded ? 'text-green-400' : 'text-red-400'}>{info.scriptLoaded ? 'YES' : 'NO'}</span></div>
        <div>Turnstile Ready: <span className={info.turnstileReady ? 'text-green-400' : 'text-red-400'}>{info.turnstileReady ? 'YES' : 'NO'}</span></div>
        {info.error && <div>Error: <span className="text-red-400">{info.error}</span></div>}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Add ?debug=true to URL to see this in production
      </div>
    </div>
  )
}