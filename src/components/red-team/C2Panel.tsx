'use client'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { formatBytes, formatClock } from '@/lib/utils'
import { shortName } from '@/lib/sectorData'

export function C2Panel({ className = '' }: { className?: string }) {
  const sessions = useWarStore(s => s.c2Sessions)
  const c2Action = useWarStore(s => s.c2Action)
  const active = sessions.filter(s => s.active).length

  const btn = 'px-1.5 py-0.5 rounded-badge border font-mono text-[9px] transition-colors'

  return (
    <Panel
      title="C2 Sessions"
      right={<span className="text-purple">{active} active · {sessions.length} beacons</span>}
      className={className}
      bodyClass="overflow-y-auto"
    >
      <div className="px-3 py-2 flex flex-col gap-1.5">
        {sessions.length === 0 && <div className="text-muted text-xs font-mono py-4 text-center">[*] no implants checked in</div>}
        {[...sessions].reverse().map(s => (
          <div key={s.id} className={`flex flex-col gap-1 p-2 rounded-btn border ${s.active ? 'border-line bg-ink/40' : 'border-warn/30 bg-warn/5'}`}>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.active ? 'bg-danger animate-pulse' : 'bg-warn'}`} />
              <span className="text-txt font-semibold truncate">{s.hostname}</span>
              <span className="text-purple text-[10px]">{s.protocol}</span>
              <span className="ml-auto text-signal text-[10px]">{formatBytes(s.dataBytes)}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
              <span>{s.ip}</span>
              <span className="truncate">→ {shortName(s.targetName, 16)}</span>
              <span className="ml-auto">
                {s.active ? <>beacon {formatClock(s.lastBeacon)}</> : <span className="text-warn animate-pulse">reconnecting...</span>}
              </span>
            </div>
            <div className="flex gap-1">
              <button disabled={!s.active} onClick={() => c2Action(s.id, 'shell')} className={`${btn} text-signal border-signal/40 bg-signal/10 hover:bg-signal/20 disabled:opacity-40`}>[SHELL ▶]</button>
              <button disabled={!s.active} onClick={() => c2Action(s.id, 'pivot')} className={`${btn} text-purple border-purple/40 bg-purple/10 hover:bg-purple/20 disabled:opacity-40`}>[PIVOT]</button>
              <button onClick={() => c2Action(s.id, 'kill')} className={`${btn} text-danger border-danger/40 bg-danger/10 hover:bg-danger/20`}>[KILL]</button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
