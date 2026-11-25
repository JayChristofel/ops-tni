'use client'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWarStore } from '@/store/warStore'
import type { ToastEntry } from '@/lib/types'

const VARIANT: Record<ToastEntry['variant'], string> = {
  info:    'border-purple/40 text-txt',
  warn:    'border-warn/50 text-warn',
  danger:  'border-danger/50 text-danger',
  success: 'border-signal/50 text-signal',
}
const TEAM: Record<ToastEntry['team'], string> = {
  RED: 'text-danger', BLUE: 'text-signal', INTEL: 'text-purple', WARN: 'text-warn', SYS: 'text-muted',
}

function Toast({ toast }: { toast: ToastEntry }) {
  const dismiss = useWarStore(s => s.dismissToast)
  useEffect(() => {
    const id = setTimeout(() => dismiss(toast.id), 4000)
    return () => clearTimeout(id)
  }, [toast.id, dismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={() => dismiss(toast.id)}
      className={`cursor-pointer w-80 bg-surface/95 backdrop-blur-sm border rounded-btn px-3 py-2 font-mono text-xs shadow-lg shadow-black/40 ${VARIANT[toast.variant]}`}
    >
      <span className={`font-bold mr-2 ${TEAM[toast.team]}`}>[{toast.team}]</span>
      <span className="text-txt">{toast.msg}</span>
    </motion.div>
  )
}

export function ToastContainer() {
  const toasts = useWarStore(s => s.toasts)
  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 items-end">
      <AnimatePresence initial={false}>
        {toasts.map(t => <Toast key={t.id} toast={t} />)}
      </AnimatePresence>
    </div>
  )
}
