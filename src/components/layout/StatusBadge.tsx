import type { AssetStatus } from '@/lib/types'

const STATUS_CONFIG: Record<AssetStatus, { label: string; className: string }> = {
  secure:      { label: 'SECURE',      className: 'bg-signal/20 text-signal border-signal/40' },
  ok:          { label: 'OK',          className: 'bg-signal/10 text-signal/70 border-signal/20' },
  warn:        { label: 'WARN',        className: 'bg-warn/20 text-warn border-warn/40' },
  critical:    { label: 'CRITICAL',    className: 'bg-danger/20 text-danger border-danger/40' },
  compromised: { label: 'COMPROMISED', className: 'bg-danger/30 text-danger border-danger/60 animate-pulse' },
}

export function StatusBadge({ status, label }: { status: AssetStatus; label?: string }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`px-1.5 py-0.5 rounded-badge text-[10px] leading-none font-mono border whitespace-nowrap ${cfg.className}`}>
      {label ?? cfg.label}
    </span>
  )
}

export function Chip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-1.5 py-0.5 rounded-badge text-[10px] leading-none font-mono border whitespace-nowrap ${className}`}>
      {children}
    </span>
  )
}
