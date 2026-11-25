'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { Chip } from '@/components/layout/StatusBadge'
import { SECTOR_META } from '@/lib/sectorData'
import { SEV_STYLE, formatClock } from '@/lib/utils'
import type { AlertAction, Severity } from '@/lib/types'

const alertVariants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 16 },
}

const ACTIONS: Record<Severity, AlertAction[]> = {
  critical: ['ISOLATE HOST', 'ESCALATE'],
  high:     ['INVESTIGATE', 'BLOCK IP'],
  medium:   ['INVESTIGATE', 'FALSE POS'],
  low:      ['MARK READ'],
}

const SEVS: Severity[] = ['critical', 'high', 'medium', 'low']

export function AlertFeed({ className = '' }: { className?: string }) {
  const alerts = useWarStore(s => s.alerts)
  const sectorFilter = useWarStore(s => s.activeSectorFilter)
  const handleAlert = useWarStore(s => s.handleAlert)
  const [sev, setSev] = useState<Severity | 'all'>('all')
  const ref = useRef<HTMLDivElement>(null)

  const scoped = sectorFilter ? alerts.filter(a => a.sectorId === sectorFilter) : alerts
  const counts = Object.fromEntries(SEVS.map(s => [s, scoped.filter(a => a.severity === s && !a.ack).length])) as Record<Severity, number>
  const shown = scoped.filter(a => sev === 'all' || a.severity === sev).slice().reverse()
  const open = scoped.filter(a => !a.ack).length

  // newest alert is on top → keep scrolled to top
  const newest = alerts[alerts.length - 1]?.id
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0 }, [newest])

  return (
    <Panel
      title={<>SOC Alerts{sectorFilter && <span className="text-signal"> · {SECTOR_META[sectorFilter].label}</span>}</>}
      right={<span className="text-danger">[{open} OPEN]</span>}
      className={className}
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b border-line">
          <button
            onClick={() => setSev('all')}
            className={`px-2 py-0.5 rounded-badge border font-mono text-[10px] ${sev === 'all' ? 'border-txt/50 text-txt bg-line' : 'border-line text-muted'}`}
          >ALL ▾</button>
          {SEVS.map(s => (
            <button
              key={s}
              onClick={() => setSev(s)}
              className={`px-2 py-0.5 rounded-badge border font-mono text-[10px] uppercase ${sev === s ? SEV_STYLE[s] : 'border-line text-muted hover:text-txt'}`}
            >
              {s} {counts[s]}
            </button>
          ))}
        </div>

        <div ref={ref} className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col gap-1.5">
          {shown.length === 0 && <div className="text-muted text-xs font-mono py-6 text-center">[*] queue empty</div>}
          <AnimatePresence initial={false}>
            {shown.map(a => (
              <motion.div
                key={a.id}
                variants={alertVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className={`p-2 rounded-btn border font-mono text-[11px] ${
                  a.ack ? 'border-line/50 bg-ink/20 opacity-50' : a.severity === 'critical' ? 'border-danger/40 bg-danger/5' : 'border-line bg-ink/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Chip className={`uppercase ${SEV_STYLE[a.severity]}`}>{a.severity}</Chip>
                  <span className="text-muted">#{a.num.toString().padStart(4, '0')}</span>
                  <span className="text-muted ml-auto text-[10px]">{formatClock(a.ts)}</span>
                </div>
                <div className="text-txt mt-1 break-words">{a.msg}</div>
                <div className="flex flex-wrap gap-x-3 text-[10px] text-muted mt-0.5">
                  <span>{SECTOR_META[a.sectorId].icon} {a.assetName}</span>
                  <span>src {a.srcIp}</span>
                  <span className="text-purple">{a.rule}</span>
                </div>
                <div className="flex gap-1 mt-1.5">
                  {a.ack ? (
                    <span className="text-signal text-[10px]">✓ {a.action}</span>
                  ) : (
                    ACTIONS[a.severity].map(act => (
                      <button
                        key={act}
                        onClick={() => handleAlert(a.id, act)}
                        className={`px-1.5 py-0.5 rounded-badge border text-[9px] font-semibold transition-colors ${
                          act === 'ISOLATE HOST' || act === 'BLOCK IP'
                            ? 'bg-danger/15 text-danger border-danger/40 hover:bg-danger/25'
                            : act === 'ESCALATE'
                            ? 'bg-warn/15 text-warn border-warn/40 hover:bg-warn/25'
                            : 'bg-line text-muted border-line hover:text-txt'
                        }`}
                      >
                        [{act}]
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Panel>
  )
}
