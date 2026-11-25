'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { PREFIX_COLOR, TEAM_COLOR, formatClock } from '@/lib/utils'

export function AttackFeed({ className = '' }: { className?: string }) {
  const attackLog = useWarStore(s => s.attackLog)
  const ref = useRef<HTMLDivElement>(null)
  const entries = attackLog.slice(-50)

  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [attackLog])

  return (
    <Panel title="Attack Feed" right={<span className="text-muted">{attackLog.length}/100</span>} className={className}>
      <div ref={ref} className="h-full overflow-y-auto p-3 font-mono text-[11px] leading-relaxed bg-ink/40">
        {entries.length === 0 && <div className="text-muted animate-pulse">[*] awaiting telemetry...</div>}
        {entries.map(e => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="py-0.5 border-b border-line/30"
          >
            <span className={PREFIX_COLOR[e.prefix] ?? 'text-muted'}>{e.prefix}</span>{' '}
            <span className="text-muted">{formatClock(e.ts)}</span>{' '}
            <span className={`font-semibold ${TEAM_COLOR[e.team]}`}>{e.team}</span>
            <span className="text-muted"> » </span>
            <span className="text-txt break-words">{e.msg}</span>
            {e.techniqueId && (
              <span className="ml-1 px-1 rounded-badge border border-purple/40 text-purple text-[9px]">{e.techniqueId}</span>
            )}
          </motion.div>
        ))}
      </div>
    </Panel>
  )
}
