'use client'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { AnimatedNumber } from '@/components/layout/AnimatedNumber'
import { formatMB } from '@/lib/utils'
import { shortName } from '@/lib/sectorData'

function Row({ label, children, tone = 'text-txt' }: { label: string; children: React.ReactNode; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1">
      <span className="text-[11px] font-sans text-muted uppercase tracking-wide">{label}</span>
      <span className={`font-mono text-lg font-bold ${tone}`}>{children}</span>
    </div>
  )
}

export function WarScoreBoard({ className = '' }: { className?: string }) {
  const redOpsActive = useWarStore(s => s.redOpsActive)
  const sgTargets = useWarStore(s => s.sgTargets)
  const exfilTotal = useWarStore(s => s.exfilTotal)
  const blueIncidents = useWarStore(s => s.blueIncidents)
  const idAssets = useWarStore(s => s.idAssets)
  const threatsBlocked = useWarStore(s => s.threatsBlocked)

  const pwned = sgTargets.filter(t => t.compromisePercent >= 75).length
  const defended = idAssets.filter(a => a.healthPercent > 60).length
  const hotAssets = [...idAssets].filter(a => a.healthPercent < 60).sort((a, b) => a.healthPercent - b.healthPercent).slice(0, 3)

  return (
    <Panel title="War Score" className={className} bodyClass="overflow-y-auto">
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center justify-between font-mono text-xs font-bold pb-2 border-b border-line">
          <span className="text-danger">🇮🇩 INDONESIA</span>
          <span className="text-muted">vs</span>
          <span className="text-purple">🇸🇬 SINGAPORE</span>
        </div>

        <div className="text-[10px] text-danger font-mono tracking-widest pt-2">▸ RED TEAM (OFFENSE)</div>
        <Row label="Red Ops Active" tone="text-danger"><AnimatedNumber value={redOpsActive} /></Row>
        <Row label="SG Assets Pwned" tone={pwned > 0 ? 'text-danger' : 'text-txt'}>
          <AnimatedNumber value={pwned} /> <span className="text-xs text-muted">/ 6</span>
        </Row>
        <Row label="Exfil Total" tone="text-warn"><AnimatedNumber value={exfilTotal} format={formatMB} /></Row>

        <div className="text-[10px] text-signal font-mono tracking-widest pt-3 border-t border-line mt-1">▸ BLUE TEAM (DEFENSE)</div>
        <Row label="Blue Incidents" tone={blueIncidents > 10 ? 'text-danger' : 'text-warn'}>
          <AnimatedNumber value={blueIncidents} /> <span className="text-xs text-muted">open</span>
        </Row>
        <Row label="ID Assets Defended" tone={defended < 14 ? 'text-warn' : 'text-signal'}>
          <AnimatedNumber value={defended} /> <span className="text-xs text-muted">/ 20</span>
        </Row>
        <Row label="Threats Blocked" tone="text-signal"><AnimatedNumber value={threatsBlocked} /></Row>

        {hotAssets.length > 0 && (
          <div className="mt-2 pt-2 border-t border-line flex flex-col gap-1">
            <span className="text-[10px] text-muted font-mono tracking-widest">DEGRADED ASSETS</span>
            {hotAssets.map(a => (
              <div key={a.id} className="flex justify-between text-[11px] font-mono">
                <span className="text-txt truncate">▪ {shortName(a.name, 24)}</span>
                <span className={a.healthPercent < 30 ? 'text-danger' : 'text-warn'}>{Math.round(a.healthPercent)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  )
}
