'use client'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { Chip } from '@/components/layout/StatusBadge'
import { formatClock } from '@/lib/utils'
import type { IOC, IOCAction } from '@/lib/types'

const TYPE_STYLE: Record<IOC['type'], string> = {
  ip:     'border-danger/40 text-danger bg-danger/10',
  domain: 'border-warn/40 text-warn bg-warn/10',
  hash:   'border-purple/40 text-purple bg-purple/10',
  url:    'border-signal/40 text-signal bg-signal/10',
}

const ACTIONS: IOCAction[] = ['ADD BLOCKLIST', 'SINKHOLE', 'ADD TO EDR', 'REPORT']

export function ThreatIntelFeed({ className = '' }: { className?: string }) {
  const iocs = useWarStore(s => s.iocs)
  const iocAction = useWarStore(s => s.iocAction)

  return (
    <Panel
      title="Threat Intel Feed"
      right={<span className="text-purple">{iocs.length} IOCs</span>}
      className={className}
      bodyClass="overflow-y-auto"
    >
      <div className="p-2 flex flex-col gap-1.5">
        {iocs.length === 0 && <div className="text-muted text-xs font-mono py-4 text-center">[*] waiting for indicators...</div>}
        {[...iocs].reverse().map(ioc => (
          <div key={ioc.id} className="p-2 rounded-btn border border-line bg-ink/40 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <Chip className={`uppercase ${TYPE_STYLE[ioc.type]}`}>{ioc.type}</Chip>
              <span className="text-txt truncate flex-1" title={ioc.value}>{ioc.value}</span>
            </div>
            <div className="flex gap-3 text-[10px] text-muted mt-1">
              <span>conf <span className={ioc.confidence >= 85 ? 'text-danger' : 'text-warn'}>{ioc.confidence}%</span></span>
              <span className="text-purple">{ioc.threat}</span>
              <span className="ml-auto">{formatClock(ioc.ts)}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {ACTIONS.map(a => {
                const done = ioc.actions.includes(a)
                return (
                  <button
                    key={a}
                    disabled={done}
                    onClick={() => iocAction(ioc.id, a)}
                    className={`px-1.5 py-0.5 rounded-badge border text-[9px] transition-colors ${
                      done ? 'border-signal/30 text-signal bg-signal/10' : 'border-line text-muted hover:text-txt hover:border-purple/40'
                    }`}
                  >
                    {done ? '✓ ' : '['}{a}{done ? '' : ']'}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
