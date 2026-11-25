'use client'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { MITRE_TACTICS, mitreLevel } from '@/lib/mitreData'

export function MitreHeatmap({ className = '' }: { className?: string }) {
  const mitreData = useWarStore(s => s.mitreData)
  const hottest = mitreData.reduce((m, e) => (e.intensity > m.intensity ? e : m), mitreData[0])

  return (
    <Panel
      title="MITRE ATT&CK Heatmap"
      right={hottest.intensity > 0 && <span className="text-danger">TOP {hottest.techniqueId}</span>}
      className={className}
      bodyClass="overflow-y-auto"
    >
      <div className="px-3 py-2 flex flex-col gap-2">
        {MITRE_TACTICS.map(tactic => {
          const rows = mitreData.filter(m => m.tactic === tactic)
          if (!rows.length) return null
          return (
            <div key={tactic}>
              <div className="font-sans text-[10px] text-muted uppercase tracking-widest mb-0.5">{tactic}</div>
              {rows.map(m => {
                const lvl = mitreLevel(m.intensity)
                return (
                  <div key={m.techniqueId} className="flex items-center gap-2 py-0.5">
                    <span className="font-mono text-[10px] text-purple w-11 shrink-0">{m.techniqueId}</span>
                    <span className="font-sans text-[11px] text-txt w-36 shrink-0 truncate">{m.name}</span>
                    <div className="flex-1 h-2 bg-line rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-300"
                        style={{
                          width: `${m.intensity * 10}%`,
                          background: `color-mix(in srgb, var(--color-danger) ${40 + m.intensity * 6}%, var(--color-warn))`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted w-8 text-right">{m.intensity}/10</span>
                    <span className={`font-mono text-[9px] w-8 text-right ${lvl.color}`}>{lvl.label}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
