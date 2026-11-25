'use client'
import { useCallback, useEffect, useRef } from 'react'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { PREFIX_COLOR, formatClock } from '@/lib/utils'

export function AttackTerminal({ className = '' }: { className?: string }) {
  const terminal = useWarStore(s => s.terminal)
  const selectedId = useWarStore(s => s.selectedTargetId)
  const sgTargets = useWarStore(s => s.sgTargets)
  const paused = useWarStore(s => s.paused)
  const clearTerminal = useWarStore(s => s.clearTerminal)
  const togglePause = useWarStore(s => s.togglePause)
  const ref = useRef<HTMLDivElement>(null)
  const target = sgTargets.find(t => t.id === selectedId)

  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [terminal])

  const exportLog = useCallback(() => {
    const { terminal: lines, attackLog } = useWarStore.getState()
    const body = [
      '# CYBERWAR.SIM — Attack Terminal Export',
      `# Target: ${target ? `[${target.id.toUpperCase()}] ${target.name}` : '-'}`,
      '',
      '## TERMINAL',
      ...lines.map(l => `${l.ts ? formatClock(l.ts) : '--:--:--'} ${l.prefix} ${l.text}`),
      '',
      '## ATTACK LOG',
      ...attackLog.map(l => `${formatClock(l.ts)} ${l.prefix} ${l.team} » ${l.msg}${l.techniqueId ? ` (${l.techniqueId})` : ''}`),
    ].join('\n')
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `attack-log-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [target])

  const btn = 'px-2 py-0.5 rounded-badge border font-mono text-[10px] transition-colors'

  return (
    <Panel
      title={<>Attack Terminal · <span className="text-danger">{target ? `[${target.id.toUpperCase()}] ${target.name}` : 'NO TARGET'}</span></>}
      right={
        <>
          <button onClick={clearTerminal} className={`${btn} bg-line text-muted border-line hover:text-txt`}>[CLEAR]</button>
          <button onClick={togglePause} className={`${btn} ${paused ? 'bg-signal/15 text-signal border-signal/40' : 'bg-warn/15 text-warn border-warn/40'}`}>
            {paused ? '[RESUME SIM]' : '[PAUSE SIM]'}
          </button>
          <button onClick={exportLog} className={`${btn} bg-line text-muted border-line hover:text-txt`}>[EXPORT LOG]</button>
        </>
      }
      className={className}
    >
      <div ref={ref} className="h-full overflow-y-auto bg-ink p-3 font-mono text-[11px] leading-relaxed">
        {terminal.map(l => (
          <div key={l.id} className="whitespace-pre-wrap break-words">
            {l.prefix && <span className={PREFIX_COLOR[l.prefix]}>{l.prefix} </span>}
            <span className={l.prefix === '[>]' ? 'text-danger' : 'text-txt'}>
              {l.prefix === '[>]' && <span className="text-muted">root@redcell:~# </span>}
              {l.text}
            </span>
          </div>
        ))}
        <div>
          <span className="text-muted">root@redcell:~# </span>
          <span className="inline-block w-2 h-3.5 align-middle bg-danger animate-blink" />
        </div>
      </div>
    </Panel>
  )
}
