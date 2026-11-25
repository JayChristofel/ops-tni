'use client'
import { useState } from 'react'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { HealthBar } from '@/components/layout/HealthBar'
import { StatusBadge } from '@/components/layout/StatusBadge'
import type { Alert, IDAsset, Sector, SectorId } from '@/lib/types'

function AssetTable({ assets, alerts }: { assets: IDAsset[]; alerts: Alert[] }) {
  return (
    <table className="w-full font-mono text-[11px]">
      <thead>
        <tr className="text-muted text-[10px] text-left">
          <th className="font-normal py-1.5 pr-3">ASSET</th>
          <th className="font-normal py-1.5 pr-3 w-1/3">HEALTH</th>
          <th className="font-normal py-1.5 pr-3">STATUS</th>
          <th className="font-normal py-1.5 pr-3">ATTACK</th>
          <th className="font-normal py-1.5 text-right">INCIDENTS</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {assets.map(a => {
          const inc = alerts.filter(al => al.assetId === a.id && !al.ack).length
          return (
            <tr key={a.id}>
              <td className="py-1.5 pr-3 text-txt">{a.name}</td>
              <td className="py-1.5 pr-3"><HealthBar value={a.healthPercent} showLabel /></td>
              <td className="py-1.5 pr-3"><StatusBadge status={a.status} /></td>
              <td className="py-1.5 pr-3">
                {a.underAttack
                  ? <span className="text-danger animate-pulse">● UNDER ATTACK</span>
                  : a.defenseActive ? <span className="text-signal">◆ SHIELDED</span> : <span className="text-muted">—</span>}
              </td>
              <td className={`py-1.5 text-right ${inc ? 'text-warn' : 'text-muted'}`}>{inc}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function tabState(sec: Sector) {
  const critical = sec.assets.some(a => a.status === 'critical' || a.status === 'compromised')
  return { critical, incidents: sec.openIncidents }
}

export function AssetHealthBySektor({ className = '' }: { className?: string }) {
  const sectors = useWarStore(s => s.sectors)
  const alerts = useWarStore(s => s.alerts)
  const filter = useWarStore(s => s.activeSectorFilter)
  const [tab, setTab] = useState<SectorId>('energy')
  const active = filter ?? tab
  const current = sectors.find(s => s.id === active)!

  return (
    <Panel title="Asset Health by Sektor" className={className}>
      {/* Desktop: tabs */}
      <div className="hidden xl:block">
        <div className="flex gap-1 px-3 pt-2 border-b border-line overflow-x-auto">
          {sectors.map(sec => {
            const { critical, incidents } = tabState(sec)
            const on = sec.id === active
            return (
              <button
                key={sec.id}
                onClick={() => setTab(sec.id)}
                title={sec.label}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border-b-2 transition-colors ${
                  on ? 'border-signal text-signal' : critical ? 'border-danger/50 text-danger' : 'border-transparent text-muted hover:text-txt'
                }`}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
                {incidents > 0 && (
                  <span className="px-1 rounded-badge bg-warn/20 text-warn text-[9px] leading-tight">{incidents}</span>
                )}
              </button>
            )
          })}
        </div>
        <div className="px-4 py-2">
          <AssetTable assets={current.assets} alerts={alerts} />
        </div>
      </div>

      {/* < 1280px: accordion */}
      <div className="xl:hidden divide-y divide-line">
        {sectors.map(sec => {
          const { critical, incidents } = tabState(sec)
          return (
            <details key={sec.id} open={sec.id === active} className="group">
              <summary className={`flex items-center gap-2 px-4 py-2 cursor-pointer font-mono text-xs list-none ${critical ? 'text-danger' : 'text-txt'}`}>
                <span className="text-muted group-open:rotate-90 transition-transform">▶</span>
                {sec.icon} {sec.label}
                <span className="text-muted">· {Math.round(sec.avgHealth)}%</span>
                {incidents > 0 && <span className="ml-auto text-warn">{incidents} incidents</span>}
              </summary>
              <div className="px-4 pb-2"><AssetTable assets={sec.assets} alerts={alerts} /></div>
            </details>
          )
        })}
      </div>
    </Panel>
  )
}
