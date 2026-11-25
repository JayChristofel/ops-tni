'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useWarStore } from '@/store/warStore'
import { panelVariants } from '@/components/layout/Panel'
import { formatTime } from '@/lib/utils'

export function ActiveOpsSummary({ className = '' }: { className?: string }) {
  const redOpsActive = useWarStore(s => s.redOpsActive)
  const blueIncidents = useWarStore(s => s.blueIncidents)
  const conflictSeconds = useWarStore(s => s.conflictSeconds)

  return (
    <motion.section
      variants={panelVariants}
      initial="initial"
      animate="animate"
      className={`flex flex-col items-center justify-center gap-3 bg-surface border border-line rounded-card px-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-sm">
        <span className="px-3 py-1 rounded-btn border border-danger/40 bg-danger/10 text-danger">
          [ RED OPS: {redOpsActive} <span className="animate-pulse">●</span> ]
        </span>
        <span className="px-3 py-1 rounded-btn border border-warn/40 bg-warn/10 text-warn">
          [ BLUE INCIDENTS: {blueIncidents} ⚠ ]
        </span>
        <span className="px-3 py-1 rounded-btn border border-line text-txt">
          [ CONFLICT: {formatTime(conflictSeconds)} ]
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs">
        <Link href="/red-team" className="px-4 py-1.5 rounded-btn font-semibold bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30 transition-colors">
          [▶ RED TEAM OPERATIONS]
        </Link>
        <Link href="/blue-team" className="px-4 py-1.5 rounded-btn font-semibold bg-signal/20 text-signal border border-signal/40 hover:bg-signal/30 transition-colors">
          [▶ BLUE TEAM OPERATIONS]
        </Link>
      </div>
    </motion.section>
  )
}
