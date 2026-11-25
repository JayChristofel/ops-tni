/** CRT vignette + subtle flicker (scanlines sendiri ada di body::after). */
export function ScanlineOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9998] animate-flicker"
      style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.35) 100%)' }}
    />
  )
}
