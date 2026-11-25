'use client'
import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

export const panelVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

interface PanelProps {
  title:      ReactNode
  right?:     ReactNode
  children:   ReactNode
  className?: string
  bodyClass?: string
  style?:     CSSProperties
  tone?:      'default' | 'danger' | 'signal'
}

/** Standard panel: bg-surface + border-line + rounded-card, header "◉ TITLE". */
export function Panel({ title, right, children, className = '', bodyClass = '', style, tone = 'default' }: PanelProps) {
  const border = tone === 'danger' ? 'border-danger/40' : tone === 'signal' ? 'border-signal/30' : 'border-line'
  return (
    <motion.section
      variants={panelVariants}
      initial="initial"
      animate="animate"
      style={style}
      className={`flex flex-col min-h-0 min-w-0 bg-surface border ${border} rounded-card overflow-hidden ${className}`}
    >
      <header className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-line shrink-0">
        <h3 className="font-mono text-xs font-semibold text-muted uppercase tracking-widest truncate">
          <span className="text-signal mr-1.5">◉</span>{title}
        </h3>
        {right && <div className="flex items-center gap-2 text-xs font-mono shrink-0">{right}</div>}
      </header>
      <div className={`flex-1 min-h-0 ${bodyClass}`}>{children}</div>
    </motion.section>
  )
}
