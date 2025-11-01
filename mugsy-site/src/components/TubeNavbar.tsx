import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type LinkItem = { label: string; href: string };

const DEFAULT_LINKS: LinkItem[] = [
  { label: "HOME", href: "#hero" },
  { label: "ABOUT", href: "#about" },
  { label: "TOKENOMICS", href: "#tokenomics" },
  { label: "SECURITY", href: "#security" },
  { label: "ROADMAP", href: "#roadmap" },
  { label: "FAQ", href: "#faq" },
  { label: "CONTACT US", href: "/contact" },
];

type Props = {
  links?: LinkItem[];
  onNavigate?: (href: string) => void;
  className?: string;
};

export default function TubeNavbar({ links = DEFAULT_LINKS, onNavigate, className = "" }: Props) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [centers, setCenters] = useState<number[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const [ringX, setRingX] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const submenuRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const [tubeLeft, setTubeLeft] = useState<number | null>(null);
  const [tubeWidth, setTubeWidth] = useState<number | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setContactOpen(false), 160);
  }, [cancelClose]);

  const openContact = useCallback(() => {
    cancelClose();
    setContactOpen(true);
  }, [cancelClose]);

  const contactIdx = useMemo(
    () => links.findIndex((l) => l.href === '/contact' || l.href?.startsWith('/contact')),
    [links]
  );

  // Compute centers relative to tube container
  const computeCenters = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const next: number[] = itemRefs.current.map((btn) => {
      if (!btn) return 0;
      const r = btn.getBoundingClientRect();
      return r.left - cRect.left + r.width / 2;
    });
    setCenters(next);
    // Ensure ring aligns with current state
    const idx = hoverIdx ?? activeIdx;
    setRingX(next[idx] ?? 0);
  }, [activeIdx, hoverIdx]);

  // Debounce resize
  useEffect(() => {
    let t: number | undefined;
    const on = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => computeCenters(), 100);
    };
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("resize", on);
      if (t) window.clearTimeout(t);
    };
  }, [computeCenters]);

  useLayoutEffect(() => {
    computeCenters();
    // Recompute on font load/layout settle
    const id = window.setTimeout(computeCenters, 0);
    return () => window.clearTimeout(id);
  }, [computeCenters, links.length]);

  // Measure tube's left relative to outer and expand width to the right edge only
  const measureAndExpand = useCallback(() => {
    const outer = outerRef.current;
    const tube = containerRef.current;
    if (!outer || !tube) return;
    // Fallback measurement: align tube's right edge to CTA group's left edge
    const nav = outer.closest('nav');
    const o = outer.getBoundingClientRect();
    const t = tube.getBoundingClientRect();
    const left = Math.max(0, t.left - o.left);
    let width: number;
    const cta = document.getElementById('cta-buttons') || document.getElementById('cta-group');
    if (cta) {
      const c = cta.getBoundingClientRect();
      width = Math.max(0, Math.round(c.right - t.left));
    } else {
      const n = nav ? (nav as HTMLElement).getBoundingClientRect() : o;
      width = Math.max(0, Math.round(n.right - t.left));
    }
    setTubeLeft(left);
    setTubeWidth(width);
  }, []);

  useLayoutEffect(() => {
    measureAndExpand();
    const on = () => measureAndExpand();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [measureAndExpand]);

  // Hover preview vs active position
  useEffect(() => {
    if (!centers.length) return;
    const idx = hoverIdx ?? activeIdx;
    if (centers[idx] !== undefined) setRingX(centers[idx]);
  }, [centers, activeIdx, hoverIdx]);

  const activate = useCallback(
    (idx: number) => {
      setActiveIdx(idx);
      setHoverIdx(null);
      setRingX(centers[idx] ?? 0);
      const href = links[idx]?.href;
      if (idx === contactIdx) {
        setContactOpen((o) => !o);
        return;
      }
      if (href) {
        setContactOpen(false);
        onNavigate?.(href);
        if (href.startsWith("#")) {
          const el = document.getElementById(href.slice(1));
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.href = href;
        }
      }
    },
    [centers, links, onNavigate, contactIdx]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!links.length) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const next = (focusIdx + dir + links.length) % links.length;
        setFocusIdx(next);
        itemRefs.current[next]?.focus();
        // Preview ring on focused item (without committing)
        if (centers[next] !== undefined) setHoverIdx(next);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate(focusIdx);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setHoverIdx(null);
        if (centers[activeIdx] !== undefined) setRingX(centers[activeIdx]);
        setContactOpen(false);
      }
    },
    [links.length, focusIdx, centers, activate, activeIdx]
  );

  // Intentionally no outside-click close: submenu closes on link click or mouse leaving submenu

  // Mobile underline position mirrors ringX
  const underlineStyle = useMemo<React.CSSProperties>(() => ({ left: ringX, transform: "translateX(-50%)" }), [ringX]);
  const ringStyle = useMemo<React.CSSProperties>(() => ({ left: ringX }), [ringX]);
  const previewing = hoverIdx !== null && hoverIdx !== activeIdx;
  const tubeStyle = useMemo<React.CSSProperties>(() => {
    if (tubeLeft == null || tubeWidth == null) return {};
    return {
      position: "absolute",
      left: tubeLeft,
      width: tubeWidth,
      top: "50%",
      transform: "translateY(-50%)",
    } as React.CSSProperties;
  }, [tubeLeft, tubeWidth]);

  return (
    <nav aria-label="Primary" className={`w-full flex justify-center ${className}`}>
      <div ref={outerRef} className="relative w-full">
        <div
          ref={containerRef}
          className="tube-nav relative"
          data-preview={previewing ? "true" : "false"}
          style={tubeStyle}
        >
        {/* Sliding red ring (hidden on small via CSS) */}
        <div className="tube-ring" style={ringStyle} aria-hidden />

        {/* Mobile underline indicator */}
        <div className="tube-underline md:hidden" style={underlineStyle} aria-hidden />

        {/* Items */}
        <ul
          role="menubar"
          className="tube-items w-full overflow-x-auto md:overflow-visible snap-x snap-mandatory"
          onKeyDown={onKeyDown}
          onMouseLeave={() => setHoverIdx(null)}
        >
          {links.map((link, idx) => {
            const isActive = idx === activeIdx;
            return (
              <li key={link.href} role="none" className="snap-center">
                <button
                  ref={(el) => { itemRefs.current[idx] = el }}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  className={`tube-item focus:outline-none focus:ring-2 focus:ring-[#ff1a4b] ${
                    isActive ? "tube-item--active" : ""
                  }`}
                  onMouseEnter={() => {
                    setHoverIdx(idx);
                    if (idx === contactIdx) openContact();
                    else scheduleClose();
                  }}
                  onFocus={() => {
                    setFocusIdx(idx);
                    if (idx !== contactIdx) setContactOpen(false);
                  }}
                  onMouseLeave={() => {
                    if (idx === contactIdx) scheduleClose();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    activate(idx);
                  }}
                  aria-expanded={idx === contactIdx ? contactOpen : undefined}
                  aria-haspopup={idx === contactIdx ? "menu" : undefined}
                  aria-label={link.label}
                >
                  <span className="tube-label text-xs sm:text-sm">{link.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {/* Contact dropdown */}
        {contactIdx >= 0 && contactOpen && (
          <div
            role="menu"
            aria-label="Contact menu"
            className="absolute mt-2 w-[min(92vw,208px)] rounded-xl border border-white/10 bg-black/80 backdrop-blur-sm shadow-xl p-3 z-50"
            style={{ top: "100%", left: centers[contactIdx] ?? 0, transform: "translateX(-50%)" }}
            ref={submenuRef}
            onMouseEnter={openContact}
            onMouseLeave={scheduleClose}
          >
            <div className="flex flex-col gap-2">
              <a
                href="/contact"
                className="relative inline-flex items-center justify-center rounded-lg px-4 py-3 font-extrabold text-black bg-[#00F0FF] hover:bg-[#ff1a4b] hover:text-white transition-colors"
                onClick={() => setContactOpen(false)}
              >
                Contact Form
              </a>
              <div className="pt-1">
                <div className="text-xs uppercase tracking-widest text-slate-400 px-1 mb-1">Social Links</div>
                <div className="flex flex-col gap-1">
                  <a onClick={()=>setContactOpen(false)} href="https://x.com/RedMugsyToken" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm">X / Twitter</a>
                  <a onClick={()=>setContactOpen(false)} href="https://bsky.app/profile/redmugsy.bsky.social" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm">BlueSky</a>
                  <a onClick={()=>setContactOpen(false)} href="https://t.me/REDMUGSY" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm">Telegram</a>
                  <a onClick={()=>setContactOpen(false)} href="https://discord.gg/9GJcjKhaYj" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm">Discord</a>
                  <a onClick={()=>setContactOpen(false)} href="https://www.tiktok.com/@redmugsytoken" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm">TikTok</a>
                  <a onClick={()=>setContactOpen(false)} href="https://www.instagram.com/redmugsy/" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm">Instagram</a>
                  <a onClick={()=>setContactOpen(false)} href="https://www.reddit.com/user/redmugsy/" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm">Reddit</a>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </nav>
  );
}

