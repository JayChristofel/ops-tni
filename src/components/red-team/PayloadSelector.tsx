'use client'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { Chip } from '@/components/layout/StatusBadge'
import type { PayloadStatus } from '@/lib/types'

const STATUS_STYLE: Record<PayloadStatus, { chip: string; tile: string }> = {
  LOADED:    { chip: 'border-purple/40 text-purple bg-purple/10', tile: 'border-purple/30 hover:border-purple/60' },
  DEPLOYED:  { chip: 'border-danger/40 text-danger bg-danger/15', tile: 'border-danger/50 bg-danger/5' },
  AVAILABLE: { chip: 'border-line text-muted',                    tile: 'border-line hover:border-danger/40' },
  DETECTED:  { chip: 'border-warn/50 text-warn bg-warn/15 animate-pulse', tile: 'border-warn/40 bg-warn/5' },
}

export function PayloadSelector({ className = '' }: { className?: string }) {
  const payloads = useWarStore(s => s.payloads)
  const selectedId = useWarStore(s => s.selectedTargetId)
  const deployPayload = useWarStore(s => s.deployPayload)

  return (
    <Panel
      title="Payload Selector"
      right={<span className="text-muted">→ {selectedId ? selectedId.toUpperCase() : 'no target'}</span>}
      className={className}
      bodyClass="overflow-y-auto"
    >
      <div className="grid grid-cols-3 gap-1.5 p-2">
        {payloads.map(p => {
          const st = STATUS_STYLE[p.status]
          return (
            <button
              key={p.id}
              disabled={!selectedId}
              onClick={() => deployPayload(p.id, selectedId)}
              title={p.status === 'DETECTED' ? 'Click to re-obfuscate' : `Deploy ${p.name} to ${selectedId}`}
              className={`flex flex-col items-start gap-1 px-2 py-1.5 rounded-btn border bg-ink/40 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${st.tile}`}
            >
              <span className="flex items-center gap-1 w-full">
                <span className="font-mono text-[11px] font-semibold text-txt truncate flex-1">{p.name}</span>
                <Chip className={st.chip}>{p.status}</Chip>
              </span>
              <span className="font-mono text-[9px] text-muted">
                {p.type} · {p.size} · <span className="text-warn">{'★'.repeat(p.rating)}<span className="text-line">{'★'.repeat(5 - p.rating)}</span></span>
              </span>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
