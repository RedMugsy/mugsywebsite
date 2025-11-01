
export default function MainNav({ showBackHome = false }: { showBackHome?: boolean }) {
  const FEATURE_CLAIM = ((import.meta as any).env?.VITE_FEATURE_CLAIM || 'false') === 'true'
  const btnCommon = 'relative inline-flex items-center justify-center rounded-xl px-5 py-3 text-xl font-extrabold select-none transition-colors duration-200 ease-out translate-y-0 hover:translate-y-0.5 active:translate-y-1 before:content-[\'\'] before:absolute before:inset-0 before:-z-10 before:rounded-[inherit]'
  const btnCyan = `${btnCommon} text-black bg-[#00F0FF] hover:bg-[#ff1a4b] hover:text-white active:bg-[#cc1239] before:bg-[#00cde0]`
  return (
    <header className="sticky top-0 z-40 transition-all header-rabbit backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10">
      <nav className="max-w-7xl mx-auto flex items-start justify-between py-3 px-6">
        <div>
          <a href="/" className="flex items-center gap-2 font-extrabold text-white tracking-tight text-lg">
            <img src="img/mugsy-logo-red.png" alt="RED $MUGSY logo" className="h-28 w-auto" />
            <span><span className="text-[#ff1a4b]">RED</span> $MUGSY</span>
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
        {/* Mobile menu - show main links */}
        <div className="flex sm:hidden flex-col gap-2 text-xs">
          {([
            ["About", "/#about"],
            ["Tokenomics", "/#tokenomics"],
            ["FAQ", "/#faq"],
          ] as Array<[string,string]>).map(([label, href]) => (
            <a key={href} href={href} className="text-slate-300 hover:text-white transition-colors">{label}</a>
          ))}
        </div>
        
        {/* Desktop menu */}
        <div className="hidden sm:flex gap-6 text-sm items-center">
          {([
            ["About", "/#about"],
            ["Tokenomics", "/#tokenomics"],
            ["Security", "/#security"],
            ["Roadmap", "/#roadmap"],
            ["FAQ", "/#faq"],
            ["Contact", "/contact"],
          ] as Array<[string,string]>).map(([label, href]) => (
            <a key={href} href={href} className="text-slate-300 hover:text-white transition-colors">{label}</a>
          ))}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/#buy" className={`${btnCyan} text-sm sm:text-xl px-3 sm:px-5 py-2 sm:py-3`} aria-label="Buy $MUGSY">Buy $MUGSY</a>
          {FEATURE_CLAIM && (
            <a href="/claim" className={`${btnCyan} text-sm sm:text-xl px-3 sm:px-5 py-2 sm:py-3`} aria-label="Claim $MUGSY">Claim $MUGSY</a>
          )}
        </div>
      </nav>
    </header>
  )
}

