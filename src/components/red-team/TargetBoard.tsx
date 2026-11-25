'use client'
import { memo, useCallback } from 'react'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { HealthBar } from '@/components/layout/HealthBar'
import { Chip } from '@/components/layout/StatusBadge'
import { SECTOR_META } from '@/lib/sectorData'
import { compPhase, formatMB } from '@/lib/utils'
import type { CompPhase, SGTarget } from '@/lib/types'

const PHASE_STYLE: Record<CompPhase, string> = {
  UNTOUCHED: 'border-line text-muted',
  RECON:     'border-purple/40 text-purple bg-purple/10',
  FOOTHOLD:  'border-warn/40 text-warn bg-warn/10',
  PIVOTING:  'border-warn/60 text-warn bg-warn/20',
  EXFIL:     'border-danger/40 text-danger bg-danger/10',
  OWNED:     'border-danger/60 text-danger bg-danger/30 animate-pulse',
}

const TargetCard = memo(function TargetCard({
  target, selected, onSelect,
}: { target: SGTarget; selected: boolean; onSelect: (id: string) => void }) {
  const phase = compPhase(target.compromisePercent)
  const sector = SECTOR_META[target.sector]
  return (
    <div
      onClick={() => onSelect(target.id)}
      className={`flex flex-col gap-1.5 p-2.5 rounded-btn border cursor-pointer transition-all duration-150 ${
        selected
          ? 'border-danger/70 bg-danger/5 shadow-[0_0_18px_-4px_var(--color-danger)]'
          : 'border-line bg-ink/40 hover:border-danger/30'
      }`}
    >
      <div className={`flex items-center justify-between gap-2 -mx-2.5 -mt-2.5 px-2.5 py-1 rounded-t-btn ${selected ? 'bg-danger/15' : ''}`}>
        <span className={`font-mono text-[10px] font-bold ${selected ? 'text-danger' : 'text-muted'}`}>
          [{target.id.toUpperCase()}]
        </span>
        <Chip className={PHASE_STYLE[phase]}>{phase}</Chip>
      </div>
      <div className="min-w-0">
        <div className="font-sans text-sm font-semibold text-txt truncate" title={target.name}>{target.name}</div>
        <div className="font-mono text-[10px] text-muted">{sector.icon} {target.sector}</div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between font-mono text-[10px] text-muted">
          <span>COMPROMISE {target.underAttack && <span className="text-danger animate-pulse">● ATTACKING</span>}</span>
          <span className="text-danger font-bold">{target.compromisePercent}%</span>
        </div>
        <HealthBar value={target.compromisePercent} color="bg-danger" />
      </div>
      <div className="flex justify-between font-mono text-[10px]">
        <span className="text-purple">C2: {target.c2Sessions}</span>
        <span className="text-warn">EXFIL: {formatMB(target.dataExfil)}</span>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onSelect(target.id) }}
        className={`mt-auto px-2 py-1 rounded-badge font-mono text-[10px] font-semibold border transition-colors ${
          selected
            ? 'bg-danger/25 text-danger border-danger/60'
            : 'bg-line text-muted border-line hover:text-txt hover:border-danger/30'
        }`}
      >
        {selected ? '[● TARGET LOCKED]' : '[SELECT TARGET ▶]'}
      </button>
    </div>
  )
})

export function TargetBoard({ className = '' }: { className?: string }) {
  const sgTargets = useWarStore(s => s.sgTargets)
  const selectedId = useWarStore(s => s.selectedTargetId)
  const selectTarget = useWarStore(s => s.selectTarget)
  const onSelect = useCallback((id: string) => selectTarget(id), [selectTarget])
  const owned = sgTargets.filter(t => t.compromisePercent >= 75).length

  return (
    <Panel
      title="Target Board · Singapore"
      tone="danger"
      right={<span className="text-danger">{owned}/6 PWNED</span>}
      className={className}
      bodyClass="overflow-y-auto"
    >
      <div className="grid grid-cols-2 2xl:grid-cols-3 gap-2 p-2">
        {sgTargets.map(t => (
          <TargetCard key={t.id} target={t} selected={t.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </Panel>
  )
}
