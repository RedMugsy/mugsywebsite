
import React from 'react'

export default function MainNav({ showBackHome = false }: { showBackHome?: boolean }) {
  const FEATURE_CLAIM = ((import.meta as any).env?.VITE_FEATURE_CLAIM || 'false') === 'true'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  
  const btnCommon = 'relative inline-flex items-center justify-center rounded-xl px-5 py-3 text-xl font-extrabold select-none transition-colors duration-200 ease-out translate-y-0 hover:translate-y-0.5 active:translate-y-1 before:content-[\'\'] before:absolute before:inset-0 before:-z-10 before:rounded-[inherit]'
  const btnCyan = `${btnCommon} text-black bg-[#00F0FF] hover:bg-[#ff1a4b] hover:text-white active:bg-[#cc1239] before:bg-[#00cde0]`
  
  const menuItems = [
    ["About", "/#about"],
    ["Tokenomics", "/#tokenomics"],
    ["Security", "/#security"],
    ["Roadmap", "/#roadmap"],
    ["FAQ", "/#faq"],
    ["Contact", "#/contact"],
  ] as Array<[string,string]>
  
  return (
    <header className="sticky top-0 z-40 transition-all header-rabbit backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10">
      <nav className="max-w-7xl mx-auto flex items-start justify-between py-3 px-6">
        <div>
          <a href="/" className="flex items-center gap-2 font-extrabold text-white tracking-tight text-lg">
            <img src="img/mugsy-logo-red.png" alt="RED $MUGSY logo" className="h-28 w-auto" />
            <span><span className="text-white">RED</span> <span className="text-[#ff1a4b]">$MUGSY</span></span>
          </a>
          {showBackHome && (
            <div className="mt-2">
              <a href="/" className="btn-ghost btn-ghost--red gap-2">
                <img src="img/Back Home Icon.png" alt="" aria-hidden className="h-5 w-5" />
                Back to Home
              </a>
            </div>
          )}
        </div>
        
        {/* Mobile hamburger menu button */}
        <div className="flex sm:hidden items-center gap-2">
          <a href="#buy" className={`${btnCyan} text-xs px-2 py-1`} aria-label="Buy $MUGSY">Buy</a>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white hover:text-[#ff1a4b] transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden sm:flex gap-6 text-sm items-center">
          {menuItems.map(([label, href]) => (
            <a key={href} href={href} className="text-slate-300 hover:text-white transition-colors">{label}</a>
          ))}
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
          <a href="#buy" className={`${btnCyan} text-xl px-5 py-3`} aria-label="Buy $MUGSY">Buy $MUGSY</a>
          {FEATURE_CLAIM && (
            <a href="#/claim" className={`${btnCyan} text-xl px-5 py-3`} aria-label="Claim $MUGSY">Claim $MUGSY</a>
          )}
        </div>
      </nav>
      
      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-[#0b0c10]/95 backdrop-blur border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col space-y-3">
              {menuItems.map(([label, href]) => (
                <a 
                  key={href} 
                  href={href} 
                  className="text-slate-300 hover:text-white transition-colors py-2 border-b border-white/10 last:border-b-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              {FEATURE_CLAIM && (
                <a 
                  href="#/claim" 
                  className={`${btnCyan} text-center mt-3`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Claim $MUGSY
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
