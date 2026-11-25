'use client'
import { DEFENSE_KEYS, DEFENSE_LABEL, useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import type { DefenseType } from '@/lib/types'

const ORDER: { key: DefenseType; name: string }[] = [
  { key: 'firewall', name: 'Firewall' },
  { key: 'ids',      name: 'Intrusion Detection' },
  { key: 'ips',      name: 'Intrusion Prevention' },
  { key: 'waf',      name: 'Web App Firewall' },
  { key: 'edr',      name: 'Endpoint Detection' },
  { key: 'siem',     name: 'SIEM Correlation' },
  { key: 'ti',       name: 'Threat Intel Feed' },
  { key: 'soar',     name: 'SOAR Playbooks' },
]

export function FirewallStatus({ className = '' }: { className?: string }) {
  const toggleDefense = useWarStore(s => s.toggleDefense)
  const flags = {
    firewall: useWarStore(s => s.firewallOn),
    ids:      useWarStore(s => s.idsOn),
    ips:      useWarStore(s => s.ipsOn),
    waf:      useWarStore(s => s.wafOn),
    edr:      useWarStore(s => s.edrOn),
    siem:     useWarStore(s => s.siemOn),
    ti:       useWarStore(s => s.tiOn),
    soar:     useWarStore(s => s.soarOn),
  } satisfies Record<keyof typeof DEFENSE_KEYS, boolean>
  const activeCount = Object.values(flags).filter(Boolean).length

  return (
    <Panel
      title="Defense Controls"
      right={<span className={activeCount >= 6 ? 'text-signal' : 'text-warn'}>{activeCount}/8 ACTIVE · −{activeCount * 8}% dmg</span>}
      className={className}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3">
        {ORDER.map(({ key, name }) => {
          const on = flags[key]
          return (
            <button
              key={key}
              onClick={() => toggleDefense(key)}
              title={name}
              className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-btn border font-mono transition-all ${
                on
                  ? 'border-signal/50 bg-signal/10 text-signal shadow-[0_0_14px_-4px_var(--color-signal)]'
                  : 'border-line bg-ink/40 text-muted opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-sm font-bold">{DEFENSE_LABEL[key]}</span>
              <span className="text-[10px]">{on ? '● ACTIVE' : '○ OFF'}</span>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
