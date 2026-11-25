'use client'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { HealthBar } from '@/components/layout/HealthBar'
import { formatMB } from '@/lib/utils'

const STATUS_STYLE = {
  'done':        'text-signal',
  'in-progress': 'text-warn animate-pulse',
  'pending':     'text-muted',
} as const

export function ExfilTracker({ className = '' }: { className?: string }) {
  const datasets = useWarStore(s => s.exfilDatasets)
  const exfilTotal = useWarStore(s => s.exfilTotal)
  const staged = datasets.reduce((s, d) => s + d.sizeMB, 0)
  const transferred = datasets.reduce((s, d) => s + d.transferredMB, 0)
  const pct = staged ? (transferred / staged) * 100 : 0

  return (
    <Panel
      title="Exfil Tracker"
      right={<span className="text-warn">TOTAL {formatMB(exfilTotal)}</span>}
      className={className}
    >
      <div className="flex flex-col h-full">
        <div className="px-3 pt-2 pb-2 border-b border-line">
          <div className="flex justify-between font-mono text-[10px] text-muted mb-1">
            <span>TRANSFERRED {formatMB(transferred)}</span>
            <span>STAGED {formatMB(staged)}</span>
          </div>
          <HealthBar value={pct} color="bg-warn" height="h-2" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-1.5 flex flex-col gap-1">
          {datasets.length === 0 && <div className="text-muted text-xs font-mono py-4 text-center">[*] nothing staged yet</div>}
          {[...datasets].reverse().map(d => (
            <div key={d.id} className="flex items-center gap-2 font-mono text-[10px] py-0.5 border-b border-line/40">
              <span className="text-muted w-10 shrink-0">{d.targetId.toUpperCase()}</span>
              <span className="text-txt truncate flex-1">{d.name}</span>
              <span className="text-muted w-20 text-right">{d.transferredMB.toFixed(0)}/{d.sizeMB}MB</span>
              <span className={`w-16 text-right ${STATUS_STYLE[d.status]}`}>{d.status}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
