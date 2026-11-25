'use client'
import { useEffect, useState } from 'react'
import { SECTOR_COOLDOWN_MS, useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { HealthBar } from '@/components/layout/HealthBar'
import { Chip } from '@/components/layout/StatusBadge'
import type { DefStatus } from '@/lib/types'

const DEF_STYLE: Record<DefStatus, string> = {
  SECURE:   'bg-signal/20 text-signal border-signal/40',
  OK:       'bg-signal/10 text-signal/70 border-signal/20',
  WARN:     'bg-warn/20 text-warn border-warn/40',
  CRITICAL: 'bg-danger/20 text-danger border-danger/40 animate-pulse',
}

/** Jam lokal 1 detik untuk countdown (mulai 0 → aman untuk prerender). */
function useNow(interval = 1000) {
  const [now, setNow] = useState(0)
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const id = setInterval(tick, interval)
    return () => { clearTimeout(first); clearInterval(id) }
  }, [interval])
  return now
}

export function SectorDefensePanel({ className = '' }: { className?: string }) {
  const sectors = useWarStore(s => s.sectors)
  const filter = useWarStore(s => s.activeSectorFilter)
  const setSectorFilter = useWarStore(s => s.setSectorFilter)
  const deploySectorDef = useWarStore(s => s.deploySectorDef)
  const now = useNow()

  return (
    <Panel
      title="Sector Defense"
      right={filter ? <button onClick={() => setSectorFilter(null)} className="text-muted hover:text-txt">[CLEAR FILTER ✗]</button> : <span className="text-muted">8 sectors</span>}
      className={className}
      bodyClass="overflow-y-auto"
    >
      <div className="flex flex-col gap-2 p-2">
        {sectors.map(sec => {
          const selected = filter === sec.id
          const remaining = sec.defenseDeployedAt
            ? Math.max(0, Math.ceil((sec.defenseDeployedAt + SECTOR_COOLDOWN_MS - Math.max(now, sec.defenseDeployedAt)) / 1000))
            : 0
          return (
            <div
              key={sec.id}
              onClick={() => setSectorFilter(sec.id)}
              className={`flex flex-col gap-1.5 p-2.5 rounded-btn border cursor-pointer transition-colors ${
                selected ? 'border-signal/70 bg-signal/5' : 'border-line bg-ink/40 hover:border-signal/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{sec.icon}</span>
                <span className="font-mono text-xs font-semibold text-txt">{sec.label}</span>
                <span className="font-mono text-[10px] text-muted">[{sec.assets.length}]</span>
                <Chip className={`ml-auto ${DEF_STYLE[sec.status]}`}>{sec.status}</Chip>
              </div>
              <HealthBar value={sec.avgHealth} showLabel />
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span className={sec.assetsUnderAttack ? 'text-danger' : 'text-muted'}>
                  {sec.assetsUnderAttack ? '● ' : ''}{sec.assetsUnderAttack} under attack
                </span>
                <span className={sec.openIncidents ? 'text-warn' : 'text-muted'}>{sec.openIncidents} incidents</span>
              </div>
              <button
                  disabled={remaining > 0}
                  onClick={e => { e.stopPropagation(); deploySectorDef(sec.id) }}
                  className={`w-full px-2 py-1 rounded-badge border font-mono text-[10px] font-semibold transition-colors ${
                    remaining > 0
                      ? 'bg-warn/15 text-warn border-warn/40 cursor-not-allowed'
                      : 'bg-signal/15 text-signal border-signal/40 hover:bg-signal/25'
                  }`}
                >
                  {remaining > 0 ? `COOLDOWN ${remaining}s...` : '[DEPLOY SECTOR DEFENSE]'}
                </button>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
