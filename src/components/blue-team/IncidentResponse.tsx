'use client'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'

const GROUPS = [
  { title: 'NETWORK',  tone: 'signal', actions: ['Block IP', 'GeoBlock SG', 'Rate Limit', 'Honeypot'] },
  { title: 'HOST',     tone: 'danger', actions: ['Isolate Host', 'Memory Dump', 'Force Reboot', 'Kill Process'] },
  { title: 'RECOVERY', tone: 'warn',   actions: ['Deploy Patch', 'Restore Backup', 'Failover', 'Escalate BSSN'] },
] as const

const TONE = {
  signal: 'bg-signal/10 text-signal border-signal/30 hover:bg-signal/20',
  danger: 'bg-danger/10 text-danger border-danger/30 hover:bg-danger/20',
  warn:   'bg-warn/10 text-warn border-warn/30 hover:bg-warn/20',
} as const

export function IncidentResponse({ className = '' }: { className?: string }) {
  const runIRAction = useWarStore(s => s.runIRAction)
  const actionsTaken = useWarStore(s => s.actionsTaken)

  return (
    <Panel
      title="Incident Response"
      right={<span className="text-muted">Actions taken this session: <span className="text-signal font-bold">{actionsTaken}</span></span>}
      className={className}
      bodyClass="overflow-y-auto"
    >
      <div className="px-4 py-3 flex flex-col gap-3">
        {GROUPS.map(g => (
          <div key={g.title}>
            <div className="font-mono text-[10px] text-muted tracking-widest mb-1.5">── {g.title} ──</div>
            <div className="grid grid-cols-2 gap-2">
              {g.actions.map(a => (
                <button
                  key={a}
                  onClick={() => runIRAction(a)}
                  className={`px-3 py-2 rounded-btn border font-mono text-xs font-semibold transition-colors ${TONE[g.tone]}`}
                >
                  [{a}]
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
