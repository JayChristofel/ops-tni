'use client'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { THREAT_LABELS } from '@/lib/utils'
import type { ThreatLevel } from '@/lib/types'

const LEVEL_COLOR: Record<ThreatLevel, string> = {
  1: 'text-signal', 2: 'text-signal', 3: 'text-warn', 4: 'text-danger', 5: 'text-danger',
}

export function ThreatLevelGauge({ className = '' }: { className?: string }) {
  const threatLevel = useWarStore(s => s.threatLevel)
  const levels: ThreatLevel[] = [5, 4, 3, 2, 1]

  return (
    <Panel title="Threat Level" className={className}>
      <div className="px-4 py-3 font-mono text-xs flex flex-col gap-1">
        {levels.map(l => {
          const filled = l <= threatLevel
          const active = l === threatLevel
          return (
            <div key={l} className={`flex items-center gap-3 ${filled ? LEVEL_COLOR[l] : 'text-muted/50'} ${active ? 'font-bold' : ''}`}>
              <span className="w-3">{l}</span>
              <span className={active && l >= 4 ? 'animate-pulse' : ''}>{filled ? '████' : '░░░░'}</span>
              <span>{THREAT_LABELS[l]}</span>
              {active && <span className="ml-auto">◀</span>}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
